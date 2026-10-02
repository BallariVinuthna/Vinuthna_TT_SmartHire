package com.smarthire.service;

import com.smarthire.dto.common.PageResponse;
import com.smarthire.dto.job.*;
import com.smarthire.dto.recruiter.CompanyDto;
import com.smarthire.entity.*;
import com.smarthire.enums.JobStatus;
import com.smarthire.exception.AccessDeniedException;
import com.smarthire.exception.ResourceNotFoundException;
import com.smarthire.repository.*;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class JobService {

    private final JobRepository jobRepository;
    private final RecruiterProfileRepository recruiterProfileRepository;
    private final CandidateProfileRepository candidateProfileRepository;
    private final SkillRepository skillRepository;
    private final JobSkillRepository jobSkillRepository;
    private final SavedJobRepository savedJobRepository;
    private final ApplicationRepository applicationRepository;

    @Transactional(readOnly = true)
    public PageResponse<JobDto> searchPublicJobs(JobSearchCriteria criteria, User currentUser) {
        Specification<Job> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            predicates.add(cb.equal(root.get("status"), JobStatus.APPROVED));

            if (criteria.getQuery() != null && !criteria.getQuery().isBlank()) {
                String searchPattern = "%" + criteria.getQuery().toLowerCase() + "%";
                Predicate titleMatch = cb.like(cb.lower(root.get("title")), searchPattern);
                Predicate descMatch = cb.like(cb.lower(root.get("description")), searchPattern);
                predicates.add(cb.or(titleMatch, descMatch));
            }

            if (criteria.getLocation() != null && !criteria.getLocation().isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("location")), "%" + criteria.getLocation().toLowerCase() + "%"));
            }

            if (criteria.getJobType() != null) {
                predicates.add(cb.equal(root.get("jobType"), criteria.getJobType()));
            }

            if (criteria.getWorkMode() != null) {
                predicates.add(cb.equal(root.get("workMode"), criteria.getWorkMode()));
            }

            if (criteria.getMinExperience() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("experienceRequired"), criteria.getMinExperience()));
            }

            if (criteria.getMaxExperience() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("experienceRequired"), criteria.getMaxExperience()));
            }

            if (criteria.getSkill() != null && !criteria.getSkill().isBlank()) {
                Join<Job, JobSkill> jobSkillJoin = root.join("jobSkills");
                Join<JobSkill, Skill> skillJoin = jobSkillJoin.join("skill");
                predicates.add(cb.equal(cb.lower(skillJoin.get("name")), criteria.getSkill().toLowerCase()));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Sort sort = Sort.by(Sort.Direction.fromString(criteria.getSortDir()), criteria.getSortBy());
        Pageable pageable = PageRequest.of(criteria.getPage(), criteria.getSize(), sort);

        Page<Job> jobPage = jobRepository.findAll(spec, pageable);

        Long candidateProfileId = getCandidateProfileId(currentUser);

        Page<JobDto> dtoPage = jobPage.map(job -> mapToDto(job, candidateProfileId));
        return PageResponse.fromPage(dtoPage);
    }

    @Transactional(readOnly = true)
    public JobDto getJobById(Long jobId, User currentUser) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found: " + jobId));

        Long candidateProfileId = getCandidateProfileId(currentUser);
        return mapToDto(job, candidateProfileId);
    }

    @Transactional
    public JobDto createJob(User recruiterUser, CreateJobRequest request) {
        RecruiterProfile recruiterProfile = recruiterProfileRepository.findByUser(recruiterUser)
                .orElseThrow(() -> new ResourceNotFoundException("Recruiter profile not found"));

        Job job = Job.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .responsibilities(request.getResponsibilities())
                .requirements(request.getRequirements())
                .location(request.getLocation())
                .jobType(request.getJobType())
                .workMode(request.getWorkMode())
                .experienceRequired(request.getExperienceRequired() != null ? request.getExperienceRequired() : 0)
                .salaryMin(request.getSalaryMin())
                .salaryMax(request.getSalaryMax())
                .applicationDeadline(request.getApplicationDeadline())
                .status(JobStatus.APPROVED)
                .recruiter(recruiterProfile)
                .company(recruiterProfile.getCompany())
                .jobSkills(new ArrayList<>())
                .build();

        job = jobRepository.save(job);

        if (request.getSkills() != null && !request.getSkills().isEmpty()) {
            List<JobSkill> jobSkills = new ArrayList<>();
            for (String skillName : request.getSkills()) {
                Skill skill = skillRepository.findByNameIgnoreCase(skillName)
                        .orElseGet(() -> skillRepository.save(Skill.builder().name(skillName).category("General").build()));
                jobSkills.add(JobSkill.builder().job(job).skill(skill).build());
            }
            jobSkillRepository.saveAll(jobSkills);
            job.setJobSkills(jobSkills);
        }

        return mapToDto(job, null);
    }

    @Transactional
    public JobDto updateJob(User recruiterUser, Long jobId, UpdateJobRequest request) {
        RecruiterProfile recruiterProfile = recruiterProfileRepository.findByUser(recruiterUser)
                .orElseThrow(() -> new ResourceNotFoundException("Recruiter profile not found"));

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found: " + jobId));

        // Enforce strict Data Ownership!
        if (!job.getRecruiter().getId().equals(recruiterProfile.getId())) {
            throw new AccessDeniedException("You do not have permission to update this job");
        }

        if (request.getTitle() != null) job.setTitle(request.getTitle());
        if (request.getDescription() != null) job.setDescription(request.getDescription());
        if (request.getResponsibilities() != null) job.setResponsibilities(request.getResponsibilities());
        if (request.getRequirements() != null) job.setRequirements(request.getRequirements());
        if (request.getLocation() != null) job.setLocation(request.getLocation());
        if (request.getJobType() != null) job.setJobType(request.getJobType());
        if (request.getWorkMode() != null) job.setWorkMode(request.getWorkMode());
        if (request.getExperienceRequired() != null) job.setExperienceRequired(request.getExperienceRequired());
        if (request.getSalaryMin() != null) job.setSalaryMin(request.getSalaryMin());
        if (request.getSalaryMax() != null) job.setSalaryMax(request.getSalaryMax());
        if (request.getApplicationDeadline() != null) job.setApplicationDeadline(request.getApplicationDeadline());
        if (request.getStatus() != null) job.setStatus(request.getStatus());

        if (request.getSkills() != null) {
            jobSkillRepository.deleteByJobId(job.getId());
            List<JobSkill> jobSkills = new ArrayList<>();
            for (String skillName : request.getSkills()) {
                Skill skill = skillRepository.findByNameIgnoreCase(skillName)
                        .orElseGet(() -> skillRepository.save(Skill.builder().name(skillName).category("General").build()));
                jobSkills.add(JobSkill.builder().job(job).skill(skill).build());
            }
            jobSkillRepository.saveAll(jobSkills);
            job.setJobSkills(jobSkills);
        }

        job = jobRepository.save(job);
        return mapToDto(job, null);
    }

    @Transactional
    public void deleteOrDeactivateJob(User recruiterUser, Long jobId) {
        RecruiterProfile recruiterProfile = recruiterProfileRepository.findByUser(recruiterUser)
                .orElseThrow(() -> new ResourceNotFoundException("Recruiter profile not found"));

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found: " + jobId));

        if (!job.getRecruiter().getId().equals(recruiterProfile.getId())) {
            throw new AccessDeniedException("You do not have permission to delete this job");
        }

        job.setStatus(JobStatus.DEACTIVATED);
        jobRepository.save(job);
    }

    @Transactional(readOnly = true)
    public PageResponse<JobDto> getRecruiterJobs(User recruiterUser, int page, int size) {
        RecruiterProfile recruiterProfile = recruiterProfileRepository.findByUser(recruiterUser)
                .orElseThrow(() -> new ResourceNotFoundException("Recruiter profile not found"));

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Job> jobs = jobRepository.findByRecruiterId(recruiterProfile.getId(), pageable);
        return PageResponse.fromPage(jobs.map(j -> mapToDto(j, null)));
    }

    private Long getCandidateProfileId(User user) {
        if (user == null) return null;
        return candidateProfileRepository.findByUser(user)
                .map(CandidateProfile::getId).orElse(null);
    }

    public JobDto mapToDto(Job job, Long candidateProfileId) {
        List<SkillDto> skills = job.getJobSkills() == null ? List.of() : job.getJobSkills().stream()
                .map(js -> SkillDto.builder()
                        .id(js.getSkill().getId())
                        .name(js.getSkill().getName())
                        .category(js.getSkill().getCategory())
                        .build())
                .collect(Collectors.toList());

        Company company = job.getCompany();
        CompanyDto companyDto = CompanyDto.builder()
                .id(company.getId())
                .name(company.getName())
                .description(company.getDescription())
                .website(company.getWebsite())
                .location(company.getLocation())
                .logoUrl(company.getLogoUrl())
                .createdAt(company.getCreatedAt())
                .build();

        boolean isSaved = false;
        boolean isApplied = false;

        if (candidateProfileId != null) {
            isSaved = savedJobRepository.existsByCandidateProfileIdAndJobId(candidateProfileId, job.getId());
            isApplied = applicationRepository.existsByCandidateProfileIdAndJobId(candidateProfileId, job.getId());
        }

        return JobDto.builder()
                .id(job.getId())
                .title(job.getTitle())
                .description(job.getDescription())
                .responsibilities(job.getResponsibilities())
                .requirements(job.getRequirements())
                .location(job.getLocation())
                .jobType(job.getJobType())
                .workMode(job.getWorkMode())
                .experienceRequired(job.getExperienceRequired())
                .salaryMin(job.getSalaryMin())
                .salaryMax(job.getSalaryMax())
                .applicationDeadline(job.getApplicationDeadline())
                .status(job.getStatus())
                .recruiterId(job.getRecruiter().getId())
                .recruiterName(job.getRecruiter().getUser().getName())
                .company(companyDto)
                .skills(skills)
                .savedByCurrentCandidate(isSaved)
                .appliedByCurrentCandidate(isApplied)
                .createdAt(job.getCreatedAt())
                .updatedAt(job.getUpdatedAt())
                .build();
    }
}
