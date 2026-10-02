package com.smarthire.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class RagChatService {

    private final GeminiService geminiService;
    private final VectorStoreService vectorStoreService;

    private volatile boolean ragEnabled = false;
    private volatile Long defaultUserId = 1L; // System Admin / demo recruiter

    public void enableRag() {
        this.ragEnabled = true;
    }

    public void setDefaultUserId(Long userId) {
        this.defaultUserId = userId;
    }

    public String askQuestion(String message) {
        log.info("RagChatService processing askQuestion: '{}' (ragEnabled: {})", message, ragEnabled);

        String context = "";
        if (ragEnabled && defaultUserId != null) {
            List<VectorStoreService.ScoredChunk> chunks = vectorStoreService.similaritySearch(message, defaultUserId, null, 3);
            if (!chunks.isEmpty()) {
                StringBuilder sb = new StringBuilder();
                for (VectorStoreService.ScoredChunk sc : chunks) {
                    sb.append("--- [Document: ").append(sc.chunk().getDocument().getOriginalFileName())
                            .append("] ---\n").append(sc.chunk().getContent()).append("\n\n");
                }
                context = sb.toString();
            }
        }

        String systemPrompt = """
                You are an AI assistant with access to an uploaded document.
                If the user's question is related to the uploaded document, answer using the document context.
                If the question is unrelated to the document, answer normally.
                Do not invent information from the document.
                """;

        return geminiService.generateResponse(systemPrompt, message, context, Collections.emptyList());
    }
}
