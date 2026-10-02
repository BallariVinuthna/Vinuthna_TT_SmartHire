package com.smarthire.controller;

import com.smarthire.dto.admin.RecruiterDashboardStatsDto;
import com.smarthire.dto.ai.AiChatRequest;
import com.smarthire.dto.ai.AiConversationDto;
import com.smarthire.dto.ai.AiDocumentDto;
import com.smarthire.dto.ai.DocumentUploadRequest;
import com.smarthire.dto.application.ApplicationDto;
import com.smarthire.dto.application.UpdateApplicationStatusRequest;
import com.smarthire.dto.common.ApiResponse;
import com.smarthire.dto.common.PageResponse;
import com.smarthire.dto.job.CreateJobRequest;
import com.smarthire.dto.job.JobDto;
import com.smarthire.dto.job.UpdateJobRequest;
import com.smarthire.dto.recruiter.CompanyDto;
import com.smarthire.dto.recruiter.RecruiterProfileDto;
import com.smarthire.enums.AiDocumentType;
import com.smarthire.security.UserPrincipal;
import com.smarthire.service.AiService;
import com.smarthire.service.ApplicationService;
import com.smarthire.service.JobService;
import com.smarthire.service.RecruiterService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/recruiter")
@RequiredArgsConstructor
public class RecruiterController {

    private final RecruiterService recruiterService;
    private final JobService jobService;
    private final ApplicationService applicationService;
    private final AiService aiService;

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<RecruiterProfileDto>> getProfile(@AuthenticationPrincipal UserPrincipal principal) {
        RecruiterProfileDto profile = recruiterService.getProfile(principal.getUser());
        return ResponseEntity.ok(ApiResponse.success("Recruiter profile loaded", profile));
    }

    @PutMapping("/company")
    public ResponseEntity<ApiResponse<RecruiterProfileDto>> updateCompany(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody CompanyDto companyDto
    ) {
        RecruiterProfileDto profile = recruiterService.updateCompanyProfile(principal.getUser(), companyDto);
        return ResponseEntity.ok(ApiResponse.success("Company profile updated", profile));
    }

    @PostMapping("/jobs")
    public ResponseEntity<ApiResponse<JobDto>> createJob(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateJobRequest request
    ) {
        JobDto job = jobService.createJob(principal.getUser(), request);
        return ResponseEntity.ok(ApiResponse.success("Job created successfully", job));
    }

    @GetMapping("/jobs")
    public ResponseEntity<ApiResponse<PageResponse<JobDto>>> getRecruiterJobs(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        PageResponse<JobDto> jobs = jobService.getRecruiterJobs(principal.getUser(), page, size);
        return ResponseEntity.ok(ApiResponse.success("Recruiter jobs loaded", jobs));
    }

    @PutMapping("/jobs/{id}")
    public ResponseEntity<ApiResponse<JobDto>> updateJob(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @RequestBody UpdateJobRequest request
    ) {
        JobDto job = jobService.updateJob(principal.getUser(), id, request);
        return ResponseEntity.ok(ApiResponse.success("Job updated successfully", job));
    }

    @DeleteMapping("/jobs/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteJob(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id
    ) {
        jobService.deleteOrDeactivateJob(principal.getUser(), id);
        return ResponseEntity.ok(ApiResponse.success("Job deactivated successfully"));
    }

    @GetMapping("/jobs/{jobId}/applications")
    public ResponseEntity<ApiResponse<PageResponse<ApplicationDto>>> getJobApplications(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long jobId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        PageResponse<ApplicationDto> apps = applicationService.getJobApplicationsForRecruiter(principal.getUser(), jobId, page, size);
        return ResponseEntity.ok(ApiResponse.success("Job applications loaded", apps));
    }

    @PatchMapping("/applications/{applicationId}/status")
    public ResponseEntity<ApiResponse<ApplicationDto>> updateApplicationStatus(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long applicationId,
            @Valid @RequestBody UpdateApplicationStatusRequest request
    ) {
        ApplicationDto app = applicationService.updateApplicationStatus(principal.getUser(), applicationId, request);
        return ResponseEntity.ok(ApiResponse.success("Application status updated", app));
    }

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<RecruiterDashboardStatsDto>> getDashboardStats(
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        RecruiterDashboardStatsDto stats = recruiterService.getDashboardStats(principal.getUser());
        return ResponseEntity.ok(ApiResponse.success("Recruiter dashboard stats loaded", stats));
    }

    @PostMapping("/ai/conversations")
    public ResponseEntity<ApiResponse<AiConversationDto>> createConversation(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody(required = false) Object payload
    ) {
        String title = null;
        if (payload instanceof String s) {
            title = s;
        } else if (payload instanceof Map<?, ?> map && map.get("title") != null) {
            title = String.valueOf(map.get("title"));
        }

        AiConversationDto conversation = aiService.createConversation(principal.getUser(), title);
        return ResponseEntity.ok(ApiResponse.success("Conversation created", conversation));
    }

    @GetMapping("/ai/conversations")
    public ResponseEntity<ApiResponse<List<AiConversationDto>>> getConversations(
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        return ResponseEntity.ok(ApiResponse.success("Conversations loaded", aiService.getUserConversations(principal.getUser())));
    }

    @PostMapping("/ai/chat")
    public ResponseEntity<ApiResponse<AiConversationDto>> sendMessage(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody AiChatRequest request
    ) {
        AiConversationDto conversation = aiService.sendMessage(
                principal.getUser(),
                request.getConversationId(),
                request.getMessage(),
                request.getDocumentId()
        );
        return ResponseEntity.ok(ApiResponse.success("AI response generated", conversation));
    }

    @GetMapping("/ai/documents")
    public ResponseEntity<ApiResponse<List<AiDocumentDto>>> getDocuments(
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        return ResponseEntity.ok(ApiResponse.success("Documents loaded", aiService.getUserDocuments(principal.getUser())));
    }

    @PostMapping("/ai/documents/upload")
    public ResponseEntity<ApiResponse<AiDocumentDto>> uploadDocument(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "documentType", required = false, defaultValue = "OTHER") String documentType
    ) {
        AiDocumentType resolvedType;
        try {
            resolvedType = AiDocumentType.valueOf(documentType.toUpperCase());
        } catch (IllegalArgumentException ex) {
            resolvedType = AiDocumentType.OTHER;
        }

        AiDocumentDto document = aiService.uploadDocument(principal.getUser(), file, resolvedType);
        return ResponseEntity.ok(ApiResponse.success("Document uploaded", document));
    }

    @DeleteMapping("/ai/documents/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteDocument(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id
    ) {
        aiService.deleteDocument(principal.getUser(), id);
        return ResponseEntity.ok(ApiResponse.success("Document deleted", null));
    }

    @DeleteMapping("/ai/conversations/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteConversation(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id
    ) {
        aiService.deleteConversation(principal.getUser(), id);
        return ResponseEntity.ok(ApiResponse.success("Conversation deleted", null));
    }

    @PostMapping("/ai/resume/analyze")
    public ResponseEntity<ApiResponse<com.smarthire.dto.ai.ResumeAnalysisResponse>> analyzeResume(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody com.smarthire.dto.ai.ResumeAnalysisRequest request
    ) {
        com.smarthire.dto.ai.ResumeAnalysisResponse response = aiService.analyzeResume(principal.getUser(), request);
        return ResponseEntity.ok(ApiResponse.success("Resume analyzed successfully", response));
    }

    @PostMapping("/ai/resume/match")
    public ResponseEntity<ApiResponse<com.smarthire.dto.ai.ResumeMatchResponse>> matchResume(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody com.smarthire.dto.ai.ResumeMatchRequest request
    ) {
        com.smarthire.dto.ai.ResumeMatchResponse response = aiService.matchResumeToJob(principal.getUser(), request);
        return ResponseEntity.ok(ApiResponse.success("Resume matched successfully", response));
    }
}
