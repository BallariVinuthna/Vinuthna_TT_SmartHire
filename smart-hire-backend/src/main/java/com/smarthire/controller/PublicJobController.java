package com.smarthire.controller;

import com.smarthire.dto.common.ApiResponse;
import com.smarthire.dto.common.PageResponse;
import com.smarthire.dto.job.JobDto;
import com.smarthire.dto.job.JobSearchCriteria;
import com.smarthire.enums.JobMode;
import com.smarthire.enums.JobType;
import com.smarthire.security.UserPrincipal;
import com.smarthire.service.JobService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/jobs/public")
@RequiredArgsConstructor
public class PublicJobController {

    private final JobService jobService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<JobDto>>> searchJobs(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) JobType jobType,
            @RequestParam(required = false) JobMode workMode,
            @RequestParam(required = false) Integer minExperience,
            @RequestParam(required = false) Integer maxExperience,
            @RequestParam(required = false) String skill,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        JobSearchCriteria criteria = JobSearchCriteria.builder()
                .query(query)
                .location(location)
                .jobType(jobType)
                .workMode(workMode)
                .minExperience(minExperience)
                .maxExperience(maxExperience)
                .skill(skill)
                .page(page)
                .size(size)
                .sortBy(sortBy)
                .sortDir(sortDir)
                .build();

        PageResponse<JobDto> jobs = jobService.searchPublicJobs(criteria, userPrincipal != null ? userPrincipal.getUser() : null);
        return ResponseEntity.ok(ApiResponse.success("Jobs fetched successfully", jobs));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<JobDto>> getJobById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        JobDto job = jobService.getJobById(id, userPrincipal != null ? userPrincipal.getUser() : null);
        return ResponseEntity.ok(ApiResponse.success("Job details fetched successfully", job));
    }
}
