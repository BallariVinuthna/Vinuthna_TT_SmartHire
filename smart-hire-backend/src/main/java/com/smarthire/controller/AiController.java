package com.smarthire.controller;

import com.smarthire.dto.ai.*;
import com.smarthire.dto.common.ApiResponse;
import com.smarthire.enums.AiDocumentType;
import com.smarthire.security.UserPrincipal;
import com.smarthire.service.AiService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"})
public class AiController {

    private final AiService aiService;

    @PostMapping(value = "/documents/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyAuthority('ROLE_RECRUITER', 'ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<AiDocumentDto>> uploadDocument(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "documentType", required = false) String documentType) {

        AiDocumentType resolvedType = AiDocumentType.OTHER;
        if (documentType != null && !documentType.isBlank()) {
            try {
                resolvedType = AiDocumentType.valueOf(documentType.toUpperCase());
            } catch (IllegalArgumentException ignored) {}
        }

        AiDocumentDto document = aiService.uploadDocument(principal.getUser(), file, resolvedType);
        return ResponseEntity.ok(ApiResponse.success("Document uploaded and indexed successfully", document));
    }

    @GetMapping("/documents")
    @PreAuthorize("hasAnyAuthority('ROLE_RECRUITER', 'ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<List<AiDocumentDto>>> getDocuments(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.success("Documents loaded", aiService.getUserDocuments(principal.getUser())));
    }

    @GetMapping("/documents/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_RECRUITER', 'ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<AiDocumentDto>> getDocument(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Document loaded", aiService.getDocumentById(principal.getUser(), id)));
    }

    @DeleteMapping("/documents/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_RECRUITER', 'ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteDocument(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        aiService.deleteDocument(principal.getUser(), id);
        return ResponseEntity.ok(ApiResponse.success("Document and its vectors deleted successfully", null));
    }

    @PostMapping("/chat")
    public ResponseEntity<ApiResponse<AiConversationDto>> chat(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody AiChatRequest request) {

        Long conversationId = request.getConversationId();
        if (conversationId == null) {
            AiConversationDto created = aiService.createConversation(principal.getUser(), "SmartHire AI Chat");
            conversationId = created.getId();
        }

        AiConversationDto conversation = aiService.sendMessage(
                principal.getUser(),
                conversationId,
                request.getMessage(),
                request.getDocumentId()
        );
        return ResponseEntity.ok(ApiResponse.success("Message processed successfully", conversation));
    }

    @GetMapping("/conversations")
    @PreAuthorize("hasAnyAuthority('ROLE_RECRUITER', 'ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<List<AiConversationDto>>> getConversations(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.success("Conversations loaded", aiService.getUserConversations(principal.getUser())));
    }

    @GetMapping("/conversations/{id}/messages")
    @PreAuthorize("hasAnyAuthority('ROLE_RECRUITER', 'ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<List<AiMessageDto>>> getConversationMessages(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Messages loaded", aiService.getConversationMessages(principal.getUser(), id)));
    }

    @DeleteMapping("/conversations/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_RECRUITER', 'ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteConversation(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        aiService.deleteConversation(principal.getUser(), id);
        return ResponseEntity.ok(ApiResponse.success("Conversation deleted successfully", null));
    }

    @PostMapping("/resume/analyze")
    @PreAuthorize("hasAnyAuthority('ROLE_RECRUITER', 'ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<ResumeAnalysisResponse>> analyzeResume(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody ResumeAnalysisRequest request) {
        ResumeAnalysisResponse response = aiService.analyzeResume(principal.getUser(), request);
        return ResponseEntity.ok(ApiResponse.success("Resume analyzed successfully", response));
    }

    @PostMapping("/resume/match")
    @PreAuthorize("hasAnyAuthority('ROLE_RECRUITER', 'ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<ResumeMatchResponse>> matchResume(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody ResumeMatchRequest request) {
        ResumeMatchResponse response = aiService.matchResumeToJob(principal.getUser(), request);
        return ResponseEntity.ok(ApiResponse.success("Resume matched against job successfully", response));
    }
}
