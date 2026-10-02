package com.smarthire.service;

import com.smarthire.dto.admin.*;
import com.smarthire.dto.auth.UserDto;
import com.smarthire.dto.common.PageResponse;
import com.smarthire.dto.job.JobDto;
import com.smarthire.entity.Job;
import com.smarthire.entity.User;
import com.smarthire.enums.ApplicationStatus;
import com.smarthire.enums.JobStatus;
import com.smarthire.enums.Role;
import com.smarthire.exception.ResourceNotFoundException;
import com.smarthire.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final CandidateProfileRepository candidateProfileRepository;
    private final RecruiterProfileRepository recruiterProfileRepository;
    private final CompanyRepository companyRepository;
    private final JobRepository jobRepository;
    private final ApplicationRepository applicationRepository;
    private final JobService jobService;
    private final AuthService authService;

    @Transactional(readOnly = true)
    public AdminDashboardStatsDto getDashboardStats() {
        long totalUsers = userRepository.count();
        long totalCandidates = userRepository.countByRole(Role.ROLE_CANDIDATE);
        long totalRecruiters = userRepository.countByRole(Role.ROLE_RECRUITER);
        long totalCompanies = companyRepository.count();
        long totalJobs = jobRepository.count();
        long totalApplications = applicationRepository.count();
        long totalHires = applicationRepository.countByCurrentStatus(ApplicationStatus.HIRED);

        Map<String, Long> statusMap = new HashMap<>();
        List<Object[]> rawStatus = applicationRepository.countApplicationsGroupByStatus();
        for (Object[] row : rawStatus) {
            ApplicationStatus status = (ApplicationStatus) row[0];
            Long count = (Long) row[1];
            statusMap.put(status.name(), count);
        }

        Map<String, Long> roleMap = new HashMap<>();
        roleMap.put("CANDIDATES", totalCandidates);
        roleMap.put("RECRUITERS", totalRecruiters);
        roleMap.put("ADMINS", userRepository.countByRole(Role.ROLE_ADMIN));

        return AdminDashboardStatsDto.builder()
                .totalUsers(totalUsers)
                .totalCandidates(totalCandidates)
                .totalRecruiters(totalRecruiters)
                .totalCompanies(totalCompanies)
                .totalJobs(totalJobs)
                .totalApplications(totalApplications)
                .totalHires(totalHires)
                .applicationsByStatus(statusMap)
                .userRegistrationsByRole(roleMap)
                .build();
    }

    @Transactional(readOnly = true)
    public PageResponse<UserDto> getAllUsers(Role roleFilter, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<User> users = (roleFilter != null) ?
                userRepository.findByRole(roleFilter, pageable) :
                userRepository.findAll(pageable);

        return PageResponse.fromPage(users.map(authService::mapToUserDto));
    }

    @Transactional
    public UserDto updateUserStatus(Long userId, UserStatusUpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        user.setActive(request.isActive());
        user = userRepository.save(user);
        return authService.mapToUserDto(user);
    }

    @Transactional
    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
        userRepository.delete(user);
    }

    @Transactional(readOnly = true)
    public PageResponse<JobDto> getAllJobs(JobStatus statusFilter, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Job> jobs = (statusFilter != null) ?
                jobRepository.findByStatus(statusFilter, pageable) :
                jobRepository.findAll(pageable);

        return PageResponse.fromPage(jobs.map(j -> jobService.mapToDto(j, null)));
    }

    @Transactional
    public JobDto updateJobStatus(Long jobId, JobStatusUpdateRequest request) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found: " + jobId));

        job.setStatus(request.getStatus());
        job = jobRepository.save(job);
        return jobService.mapToDto(job, null);
    }
}
