package com.smarthire.controller;

import com.smarthire.dto.admin.CandidateDashboardStatsDto;
import com.smarthire.dto.application.ApplicationDto;
import com.smarthire.dto.application.ApplyJobRequest;
import com.smarthire.dto.candidate.CandidateProfileDto;
import com.smarthire.dto.candidate.UpdateCandidateProfileRequest;
import com.smarthire.dto.common.ApiResponse;
import com.smarthire.dto.common.PageResponse;
import com.smarthire.dto.job.JobDto;
import com.smarthire.security.UserPrincipal;
import com.smarthire.service.ApplicationService;
import com.smarthire.service.CandidateService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/candidate")
@RequiredArgsConstructor
public class CandidateController {

    private final CandidateService candidateService;
    private final ApplicationService applicationService;

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<CandidateProfileDto>> getProfile(@AuthenticationPrincipal UserPrincipal principal) {
        CandidateProfileDto profile = candidateService.getProfile(principal.getUser());
        return ResponseEntity.ok(ApiResponse.success("Profile fetched successfully", profile));
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<CandidateProfileDto>> updateProfile(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody UpdateCandidateProfileRequest request
    ) {
        CandidateProfileDto profile = candidateService.updateProfile(principal.getUser(), request);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", profile));
    }

    @PostMapping("/jobs/{jobId}/apply")
    public ResponseEntity<ApiResponse<ApplicationDto>> applyForJob(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long jobId,
            @RequestBody(required = false) ApplyJobRequest request
    ) {
        ApplicationDto app = applicationService.applyForJob(principal.getUser(), jobId, request);
        return ResponseEntity.ok(ApiResponse.success("Application submitted successfully", app));
    }

    @GetMapping("/applications")
    public ResponseEntity<ApiResponse<PageResponse<ApplicationDto>>> getMyApplications(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        PageResponse<ApplicationDto> apps = applicationService.getCandidateApplications(principal.getUser(), page, size);
        return ResponseEntity.ok(ApiResponse.success("Applications fetched successfully", apps));
    }

    @PatchMapping("/applications/{id}/withdraw")
    public ResponseEntity<ApiResponse<ApplicationDto>> withdrawApplication(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id
    ) {
        ApplicationDto app = applicationService.withdrawApplication(principal.getUser(), id);
        return ResponseEntity.ok(ApiResponse.success("Application withdrawn successfully", app));
    }

    @PostMapping("/jobs/{jobId}/save")
    public ResponseEntity<ApiResponse<Void>> saveJob(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long jobId
    ) {
        candidateService.saveJob(principal.getUser(), jobId);
        return ResponseEntity.ok(ApiResponse.success("Job saved successfully"));
    }

    @DeleteMapping("/jobs/{jobId}/save")
    public ResponseEntity<ApiResponse<Void>> unsaveJob(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long jobId
    ) {
        candidateService.unsaveJob(principal.getUser(), jobId);
        return ResponseEntity.ok(ApiResponse.success("Job removed from saved list"));
    }

    @GetMapping("/saved-jobs")
    public ResponseEntity<ApiResponse<PageResponse<JobDto>>> getSavedJobs(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        PageResponse<JobDto> savedJobs = candidateService.getSavedJobs(principal.getUser(), page, size);
        return ResponseEntity.ok(ApiResponse.success("Saved jobs fetched successfully", savedJobs));
    }

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<CandidateDashboardStatsDto>> getDashboardStats(
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        CandidateDashboardStatsDto stats = candidateService.getDashboardStats(principal.getUser());
        return ResponseEntity.ok(ApiResponse.success("Dashboard stats loaded", stats));
    }
}
