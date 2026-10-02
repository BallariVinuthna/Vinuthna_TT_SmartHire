package com.smarthire.controller;

import com.smarthire.dto.common.ApiResponse;
import com.smarthire.dto.common.PageResponse;
import com.smarthire.dto.interview.InterviewDto;
import com.smarthire.dto.interview.ScheduleInterviewRequest;
import com.smarthire.security.UserPrincipal;
import com.smarthire.service.InterviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/interviews")
@RequiredArgsConstructor
public class InterviewController {

    private final InterviewService interviewService;

    @PostMapping
    public ResponseEntity<ApiResponse<InterviewDto>> scheduleInterview(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody ScheduleInterviewRequest request
    ) {
        InterviewDto interview = interviewService.scheduleInterview(principal.getUser(), request);
        return ResponseEntity.ok(ApiResponse.success("Interview scheduled successfully", interview));
    }

    @GetMapping("/candidate")
    public ResponseEntity<ApiResponse<PageResponse<InterviewDto>>> getCandidateInterviews(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        PageResponse<InterviewDto> interviews = interviewService.getCandidateInterviews(principal.getUser(), page, size);
        return ResponseEntity.ok(ApiResponse.success("Candidate interviews loaded", interviews));
    }

    @GetMapping("/recruiter")
    public ResponseEntity<ApiResponse<PageResponse<InterviewDto>>> getRecruiterInterviews(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        PageResponse<InterviewDto> interviews = interviewService.getRecruiterInterviews(principal.getUser(), page, size);
        return ResponseEntity.ok(ApiResponse.success("Recruiter interviews loaded", interviews));
    }
}
