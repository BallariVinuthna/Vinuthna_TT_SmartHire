package com.smarthire.service;

import com.smarthire.dto.admin.CandidateDashboardStatsDto;
import com.smarthire.dto.auth.UserDto;
import com.smarthire.dto.candidate.*;
import com.smarthire.dto.common.PageResponse;
import com.smarthire.dto.job.JobDto;
import com.smarthire.dto.job.SkillDto;
import com.smarthire.entity.*;
import com.smarthire.enums.ApplicationStatus;
import com.smarthire.exception.DuplicateResourceException;
import com.smarthire.exception.ResourceNotFoundException;
import com.smarthire.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CandidateService {

    private final CandidateProfileRepository candidateProfileRepository;
    private final UserRepository userRepository;
    private final SkillRepository skillRepository;
    private final CandidateSkillRepository candidateSkillRepository;
    private final SavedJobRepository savedJobRepository;
    private final JobRepository jobRepository;
    private final ApplicationRepository applicationRepository;
    private final InterviewRepository interviewRepository;

    @Transactional(readOnly = true)
    public CandidateProfileDto getProfile(User user) {
        CandidateProfile profile = getOrCreateCandidateProfile(user);
        return mapToDto(profile);
    }

    @Transactional
    public CandidateProfileDto updateProfile(User user, UpdateCandidateProfileRequest request) {
        CandidateProfile profile = getOrCreateCandidateProfile(user);

        if (request.getName() != null) {
            user.setName(request.getName());
        }
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
        }
        userRepository.save(user);

        if (request.getTitle() != null) profile.setTitle(request.getTitle());
        if (request.getLocation() != null) profile.setLocation(request.getLocation());
        if (request.getBio() != null) profile.setBio(request.getBio());
        if (request.getEducation() != null) profile.setEducation(request.getEducation());
        if (request.getExperience() != null) profile.setExperience(request.getExperience());
        if (request.getExperienceYears() != null) profile.setExperienceYears(request.getExperienceYears());
        if (request.getResumeUrl() != null) profile.setResumeUrl(request.getResumeUrl());

        if (request.getSkills() != null) {
            candidateSkillRepository.deleteByCandidateProfileId(profile.getId());
            List<CandidateSkill> newSkills = new ArrayList<>();
            for (String skillName : request.getSkills()) {
                Skill skill = skillRepository.findByNameIgnoreCase(skillName)
                        .orElseGet(() -> skillRepository.save(Skill.builder().name(skillName).category("General").build()));
                newSkills.add(CandidateSkill.builder()
                        .candidateProfile(profile)
                        .skill(skill)
                        .proficiencyLevel("INTERMEDIATE")
                        .build());
            }
            candidateSkillRepository.saveAll(newSkills);
            profile.setSkills(newSkills);
        }

        profile = candidateProfileRepository.save(profile);
        return mapToDto(profile);
    }

    @Transactional
    public void saveJob(User user, Long jobId) {
        CandidateProfile profile = getOrCreateCandidateProfile(user);
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found: " + jobId));

        if (savedJobRepository.existsByCandidateProfileIdAndJobId(profile.getId(), jobId)) {
            throw new DuplicateResourceException("Job already saved");
        }

        SavedJob savedJob = SavedJob.builder()
                .candidateProfile(profile)
                .job(job)
                .build();
        savedJobRepository.save(savedJob);
    }

    @Transactional
    public void unsaveJob(User user, Long jobId) {
        CandidateProfile profile = getOrCreateCandidateProfile(user);
        savedJobRepository.deleteByCandidateProfileIdAndJobId(profile.getId(), jobId);
    }

    @Transactional(readOnly = true)
    public PageResponse<JobDto> getSavedJobs(User user, int page, int size) {
        CandidateProfile profile = getOrCreateCandidateProfile(user);
        Pageable pageable = PageRequest.of(page, size);
        Page<SavedJob> savedPage = savedJobRepository.findByCandidateProfileId(profile.getId(), pageable);

        Page<JobDto> jobDtoPage = savedPage.map(sj -> {
            Job j = sj.getJob();
            return mapJobToDto(j, profile.getId());
        });

        return PageResponse.fromPage(jobDtoPage);
    }

    @Transactional(readOnly = true)
    public CandidateDashboardStatsDto getDashboardStats(User user) {
        CandidateProfile profile = getOrCreateCandidateProfile(user);
        Long profileId = profile.getId();

        long totalApps = applicationRepository.countByCandidateProfileId(profileId);
        long underReview = applicationRepository.countByCandidateProfileIdAndCurrentStatus(profileId, ApplicationStatus.UNDER_REVIEW) +
                           applicationRepository.countByCandidateProfileIdAndCurrentStatus(profileId, ApplicationStatus.APPLIED);
        long shortlisted = applicationRepository.countByCandidateProfileIdAndCurrentStatus(profileId, ApplicationStatus.SHORTLISTED);
        long upcomingInterviews = interviewRepository.countByApplicationCandidateProfileIdAndScheduledAtAfter(profileId, LocalDateTime.now());
        long savedJobsCount = savedJobRepository.countByCandidateProfileId(profileId);
        int completion = calculateProfileCompletion(profile);

        return CandidateDashboardStatsDto.builder()
                .totalApplications(totalApps)
                .applicationsUnderReview(underReview)
                .shortlistedApplications(shortlisted)
                .upcomingInterviews(upcomingInterviews)
                .savedJobsCount(savedJobsCount)
                .profileCompletionPercentage(completion)
                .build();
    }

    public CandidateProfile getOrCreateCandidateProfile(User user) {
        return candidateProfileRepository.findByUser(user)
                .orElseGet(() -> candidateProfileRepository.save(CandidateProfile.builder()
                        .user(user)
                        .title("Software Professional")
                        .skills(new ArrayList<>())
                        .build()));
    }

    private int calculateProfileCompletion(CandidateProfile profile) {
        int score = 20; // registered user base
        if (profile.getTitle() != null && !profile.getTitle().isBlank()) score += 15;
        if (profile.getLocation() != null && !profile.getLocation().isBlank()) score += 15;
        if (profile.getBio() != null && !profile.getBio().isBlank()) score += 15;
        if (profile.getEducation() != null && !profile.getEducation().isBlank()) score += 15;
        if (profile.getExperience() != null && !profile.getExperience().isBlank()) score += 10;
        if (profile.getResumeUrl() != null && !profile.getResumeUrl().isBlank()) score += 10;
        return Math.min(score, 100);
    }

    public CandidateProfileDto mapToDto(CandidateProfile profile) {
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

        List<CandidateSkillDto> skillDtos = profile.getSkills() == null ? List.of() : profile.getSkills().stream()
                .map(cs -> CandidateSkillDto.builder()
                        .id(cs.getId())
                        .skillId(cs.getSkill().getId())
                        .skillName(cs.getSkill().getName())
                        .category(cs.getSkill().getCategory())
                        .proficiencyLevel(cs.getProficiencyLevel())
                        .build())
                .collect(Collectors.toList());

        return CandidateProfileDto.builder()
                .id(profile.getId())
                .user(userDto)
                .title(profile.getTitle())
                .location(profile.getLocation())
                .bio(profile.getBio())
                .education(profile.getEducation())
                .experience(profile.getExperience())
                .experienceYears(profile.getExperienceYears())
                .resumeUrl(profile.getResumeUrl())
                .skills(skillDtos)
                .profileCompletionPercentage(calculateProfileCompletion(profile))
                .createdAt(profile.getCreatedAt())
                .updatedAt(profile.getUpdatedAt())
                .build();
    }

    private JobDto mapJobToDto(Job j, Long candidateProfileId) {
        List<SkillDto> skills = j.getJobSkills() == null ? List.of() : j.getJobSkills().stream()
                .map(js -> SkillDto.builder().id(js.getSkill().getId()).name(js.getSkill().getName()).category(js.getSkill().getCategory()).build())
                .collect(Collectors.toList());

        boolean isSaved = savedJobRepository.existsByCandidateProfileIdAndJobId(candidateProfileId, j.getId());
        boolean isApplied = applicationRepository.existsByCandidateProfileIdAndJobId(candidateProfileId, j.getId());

        return JobDto.builder()
                .id(j.getId())
                .title(j.getTitle())
                .description(j.getDescription())
                .responsibilities(j.getResponsibilities())
                .requirements(j.getRequirements())
                .location(j.getLocation())
                .jobType(j.getJobType())
                .workMode(j.getWorkMode())
                .experienceRequired(j.getExperienceRequired())
                .salaryMin(j.getSalaryMin())
                .salaryMax(j.getSalaryMax())
                .applicationDeadline(j.getApplicationDeadline())
                .status(j.getStatus())
                .recruiterId(j.getRecruiter().getId())
                .recruiterName(j.getRecruiter().getUser().getName())
                .skills(skills)
                .savedByCurrentCandidate(isSaved)
                .appliedByCurrentCandidate(isApplied)
                .createdAt(j.getCreatedAt())
                .updatedAt(j.getUpdatedAt())
                .build();
    }
}
