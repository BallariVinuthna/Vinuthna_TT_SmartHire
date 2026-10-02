package com.smarthire.controller;

import com.smarthire.dto.admin.*;
import com.smarthire.dto.auth.UserDto;
import com.smarthire.dto.common.ApiResponse;
import com.smarthire.dto.common.PageResponse;
import com.smarthire.dto.job.JobDto;
import com.smarthire.enums.JobStatus;
import com.smarthire.enums.Role;
import com.smarthire.service.AdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<AdminDashboardStatsDto>> getDashboardStats() {
        AdminDashboardStatsDto stats = adminService.getDashboardStats();
        return ResponseEntity.ok(ApiResponse.success("Admin dashboard stats loaded", stats));
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<PageResponse<UserDto>>> getAllUsers(
            @RequestParam(required = false) Role role,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        PageResponse<UserDto> users = adminService.getAllUsers(role, page, size);
        return ResponseEntity.ok(ApiResponse.success("Users list loaded", users));
    }

    @PatchMapping("/users/{id}/status")
    public ResponseEntity<ApiResponse<UserDto>> updateUserStatus(
            @PathVariable Long id,
            @RequestBody UserStatusUpdateRequest request
    ) {
        UserDto user = adminService.updateUserStatus(id, request);
        return ResponseEntity.ok(ApiResponse.success("User status updated", user));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long id) {
        adminService.deleteUser(id);
        return ResponseEntity.ok(ApiResponse.success("User deleted successfully"));
    }

    @GetMapping("/jobs")
    public ResponseEntity<ApiResponse<PageResponse<JobDto>>> getAllJobs(
            @RequestParam(required = false) JobStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        PageResponse<JobDto> jobs = adminService.getAllJobs(status, page, size);
        return ResponseEntity.ok(ApiResponse.success("All platform jobs loaded", jobs));
    }

    @PatchMapping("/jobs/{id}/status")
    public ResponseEntity<ApiResponse<JobDto>> updateJobStatus(
            @PathVariable Long id,
            @Valid @RequestBody JobStatusUpdateRequest request
    ) {
        JobDto job = adminService.updateJobStatus(id, request);
        return ResponseEntity.ok(ApiResponse.success("Job status updated by admin", job));
    }
}
