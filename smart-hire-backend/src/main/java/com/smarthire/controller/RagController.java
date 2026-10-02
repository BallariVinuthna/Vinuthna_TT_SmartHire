package com.smarthire.controller;

import com.smarthire.dto.ai.ChatRequest;
import com.smarthire.dto.ai.ChatResponse;
import com.smarthire.entity.User;
import com.smarthire.repository.UserRepository;
import com.smarthire.service.AiService;
import com.smarthire.service.PdfService;
import com.smarthire.service.RagChatService;
import com.smarthire.service.TextChunkService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"})
@RequiredArgsConstructor
@Slf4j
public class RagController {

    private final PdfService pdfService;
    private final TextChunkService textChunkService;
    private final RagChatService ragChatService;
    private final AiService aiService;
    private final UserRepository userRepository;

    // =========================================================
    // LEVEL 1 CHATBOT (PDF Pages 10-12)
    // =========================================================
    @GetMapping("/api/chat")
    public String basicChatGet(@RequestParam("message") String message) {
        return ragChatService.askQuestion(message);
    }

    @PostMapping("/api/chat")
    public ChatResponse basicChatPost(@RequestBody ChatRequest request) {
        if (request.getMessage() == null || request.getMessage().trim().isEmpty()) {
            return ChatResponse.builder().response("Message cannot be empty").build();
        }
        String answer = ragChatService.askQuestion(request.getMessage());
        return ChatResponse.builder()
                .response(answer)
                .conversationId(request.getConversationId())
                .build();
    }

    // =========================================================
    // LEVEL 3 RAG: PDF UPLOAD (PDF Pages 35-50, 53-54, 73-76)
    // =========================================================
    @PostMapping("/api/rag/upload")
    public ResponseEntity<String> uploadDocument(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("Please select a PDF file.");
        }
        if (!"application/pdf".equals(file.getContentType()) &&
                (file.getOriginalFilename() == null || !file.getOriginalFilename().toLowerCase().endsWith(".pdf"))) {
            return ResponseEntity.badRequest().body("Only PDF files are allowed.");
        }

        try {
            // Extract PDF text
            String text = pdfService.extractText(file);
            log.info("PDF processed successfully. Extracted characters: {}", text.length());

            // Split into chunks
            List<TextChunkService.Chunk> chunks = textChunkService.splitIntoChunks(text);
            log.info("Total chunks created: {}", chunks.size());

            // Also persist to default admin/recruiter account for RAG retrieval
            User defaultUser = userRepository.findByEmail("admin@smarthire.com")
                    .orElseGet(() -> userRepository.findAll().stream().findFirst().orElse(null));

            if (defaultUser != null) {
                aiService.uploadDocument(defaultUser, file, null);
                ragChatService.setDefaultUserId(defaultUser.getId());
            }

            ragChatService.enableRag();

            return ResponseEntity.ok(String.format("PDF processed successfully. Extracted characters: %d, Total chunks: %d, Stored in Vector Store successfully.",
                    text.length(), chunks.size()));

        } catch (IOException e) {
            log.error("Failed to read PDF: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body("Failed to read PDF: " + e.getMessage());
        } catch (Exception e) {
            log.error("RAG processing failed: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body("PDF processed, but failed to store embeddings: " + e.getMessage());
        }
    }

    // =========================================================
    // LEVEL 3 RAG: CHAT (PDF Pages 51-56, 76)
    // =========================================================
    @PostMapping("/api/rag/chat")
    public ResponseEntity<String> ragChat(@RequestBody ChatRequest request) {
        if (request.getMessage() == null || request.getMessage().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Message cannot be empty.");
        }
        try {
            String answer = ragChatService.askQuestion(request.getMessage());
            return ResponseEntity.ok(answer);
        } catch (Exception e) {
            log.error("Failed to process RAG chat message: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body("Failed to process your message.");
        }
    }
}
