package com.smarthire.service;

import com.smarthire.dto.admin.RecruiterDashboardStatsDto;
import com.smarthire.dto.auth.UserDto;
import com.smarthire.dto.recruiter.CompanyDto;
import com.smarthire.dto.recruiter.RecruiterProfileDto;
import com.smarthire.entity.*;
import com.smarthire.enums.ApplicationStatus;
import com.smarthire.enums.JobStatus;
import com.smarthire.exception.ResourceNotFoundException;
import com.smarthire.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class RecruiterService {

    private final RecruiterProfileRepository recruiterProfileRepository;
    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;
    private final JobRepository jobRepository;
    private final ApplicationRepository applicationRepository;
    private final InterviewRepository interviewRepository;

    @Transactional(readOnly = true)
    public RecruiterProfileDto getProfile(User user) {
        RecruiterProfile profile = getRecruiterProfile(user);
        return mapToDto(profile);
    }

    @Transactional
    public RecruiterProfileDto updateCompanyProfile(User user, CompanyDto companyDto) {
        RecruiterProfile profile = getRecruiterProfile(user);
        Company company = profile.getCompany();

        if (companyDto.getName() != null) company.setName(companyDto.getName());
        if (companyDto.getDescription() != null) company.setDescription(companyDto.getDescription());
        if (companyDto.getWebsite() != null) company.setWebsite(companyDto.getWebsite());
        if (companyDto.getLocation() != null) company.setLocation(companyDto.getLocation());
        if (companyDto.getLogoUrl() != null) company.setLogoUrl(companyDto.getLogoUrl());

        company = companyRepository.save(company);
        profile.setCompany(company);

        return mapToDto(profile);
    }

    @Transactional(readOnly = true)
    public RecruiterDashboardStatsDto getDashboardStats(User user) {
        RecruiterProfile profile = getRecruiterProfile(user);
        Long recruiterId = profile.getId();

        long activeJobs = jobRepository.countByRecruiterId(recruiterId);
        long totalApplicants = applicationRepository.countByJobRecruiterId(recruiterId);
        long shortlisted = applicationRepository.countByJobRecruiterIdAndCurrentStatus(recruiterId, ApplicationStatus.SHORTLISTED);
        long hired = applicationRepository.countByJobRecruiterIdAndCurrentStatus(recruiterId, ApplicationStatus.HIRED);
        long interviews = interviewRepository.countByApplicationJobRecruiterId(recruiterId);

        Map<String, Long> statusBreakdown = new HashMap<>();
        List<Object[]> rawGroup = applicationRepository.countRecruiterApplicationsGroupByStatus(recruiterId);
        for (Object[] row : rawGroup) {
            ApplicationStatus status = (ApplicationStatus) row[0];
            Long count = (Long) row[1];
            statusBreakdown.put(status.name(), count);
        }

        return RecruiterDashboardStatsDto.builder()
                .activeJobs(activeJobs)
                .totalApplicants(totalApplicants)
                .shortlistedCandidates(shortlisted)
                .scheduledInterviews(interviews)
                .hiredCandidates(hired)
                .applicationsByStatus(statusBreakdown)
                .build();
    }

    public RecruiterProfile getRecruiterProfile(User user) {
        return recruiterProfileRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Recruiter profile not found for user: " + user.getEmail()));
    }

    public RecruiterProfileDto mapToDto(RecruiterProfile profile) {
        User user = profile.getUser();
        UserDto userDto = UserDto.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole())
                .active(user.isActive())
                .createdAt(user.getCreatedAt())
                .build();

        Company company = profile.getCompany();
        CompanyDto companyDto = CompanyDto.builder()
                .id(company.getId())
                .name(company.getName())
                .description(company.getDescription())
                .website(company.getWebsite())
                .location(company.getLocation())
                .logoUrl(company.getLogoUrl())
                .createdAt(company.getCreatedAt())
                .build();

        return RecruiterProfileDto.builder()
                .id(profile.getId())
                .user(userDto)
                .company(companyDto)
                .title(profile.getTitle())
                .phone(profile.getPhone())
                .createdAt(profile.getCreatedAt())
                .build();
    }
}
