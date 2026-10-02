package com.smarthire.service;

import com.smarthire.dto.application.*;
import com.smarthire.dto.common.PageResponse;
import com.smarthire.entity.*;
import com.smarthire.enums.ApplicationStatus;
import com.smarthire.enums.NotificationType;
import com.smarthire.exception.AccessDeniedException;
import com.smarthire.exception.DuplicateResourceException;
import com.smarthire.exception.ResourceNotFoundException;
import com.smarthire.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final ApplicationStatusHistoryRepository statusHistoryRepository;
    private final CandidateProfileRepository candidateProfileRepository;
    private final RecruiterProfileRepository recruiterProfileRepository;
    private final JobRepository jobRepository;
    private final JobService jobService;
    private final CandidateService candidateService;
    private final EmailService emailService;
    private final NotificationService notificationService;

    @Transactional
    public ApplicationDto applyForJob(User candidateUser, Long jobId, ApplyJobRequest request) {
        CandidateProfile profile = candidateService.getOrCreateCandidateProfile(candidateUser);
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found: " + jobId));

        if (applicationRepository.existsByCandidateProfileIdAndJobId(profile.getId(), jobId)) {
            throw new DuplicateResourceException("You have already applied for this position");
        }

        Application application = Application.builder()
                .candidateProfile(profile)
                .job(job)
                .currentStatus(ApplicationStatus.APPLIED)
                .coverLetter(request != null ? request.getCoverLetter() : null)
                .build();

        application = applicationRepository.save(application);

        ApplicationStatusHistory history = ApplicationStatusHistory.builder()
                .application(application)
                .status(ApplicationStatus.APPLIED)
                .notes("Application submitted by candidate")
                .changedBy(candidateUser)
                .build();
        statusHistoryRepository.save(history);

        // Send Email & Notifications
        emailService.sendApplicationSubmittedEmail(candidateUser.getEmail(), candidateUser.getName(), job.getTitle(), job.getCompany().getName());
        
        notificationService.createNotification(
                job.getRecruiter().getUser(),
                "New Job Application Received",
                candidateUser.getName() + " applied for " + job.getTitle(),
                NotificationType.APPLICATION_SUBMITTED
        );

        return mapToDto(application);
    }

    @Transactional(readOnly = true)
    public PageResponse<ApplicationDto> getCandidateApplications(User candidateUser, int page, int size) {
        CandidateProfile profile = candidateService.getOrCreateCandidateProfile(candidateUser);
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "appliedAt"));
        Page<Application> appPage = applicationRepository.findByCandidateProfileId(profile.getId(), pageable);
        return PageResponse.fromPage(appPage.map(this::mapToDto));
    }

    @Transactional
    public ApplicationDto withdrawApplication(User candidateUser, Long applicationId) {
        CandidateProfile profile = candidateService.getOrCreateCandidateProfile(candidateUser);
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found: " + applicationId));

        if (!application.getCandidateProfile().getId().equals(profile.getId())) {
            throw new AccessDeniedException("You can only withdraw your own applications");
        }

        application.setCurrentStatus(ApplicationStatus.WITHDRAWN);
        application = applicationRepository.save(application);

        ApplicationStatusHistory history = ApplicationStatusHistory.builder()
                .application(application)
                .status(ApplicationStatus.WITHDRAWN)
                .notes("Application withdrawn by candidate")
                .changedBy(candidateUser)
                .build();
        statusHistoryRepository.save(history);

        return mapToDto(application);
    }

    @Transactional(readOnly = true)
    public PageResponse<ApplicationDto> getJobApplicationsForRecruiter(User recruiterUser, Long jobId, int page, int size) {
        RecruiterProfile recruiterProfile = recruiterProfileRepository.findByUser(recruiterUser)
                .orElseThrow(() -> new ResourceNotFoundException("Recruiter profile not found"));

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found: " + jobId));

        if (!job.getRecruiter().getId().equals(recruiterProfile.getId())) {
            throw new AccessDeniedException("You do not have permission to view applications for this job");
        }

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "appliedAt"));
        Page<Application> appPage = applicationRepository.findByJobId(jobId, pageable);
        return PageResponse.fromPage(appPage.map(this::mapToDto));
    }

    @Transactional
    public ApplicationDto updateApplicationStatus(User recruiterUser, Long applicationId, UpdateApplicationStatusRequest request) {
        RecruiterProfile recruiterProfile = recruiterProfileRepository.findByUser(recruiterUser)
                .orElseThrow(() -> new ResourceNotFoundException("Recruiter profile not found"));

        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found: " + applicationId));

        if (!application.getJob().getRecruiter().getId().equals(recruiterProfile.getId())) {
            throw new AccessDeniedException("You do not have permission to modify this application");
        }

        application.setCurrentStatus(request.getStatus());
        application = applicationRepository.save(application);

        ApplicationStatusHistory history = ApplicationStatusHistory.builder()
                .application(application)
                .status(request.getStatus())
                .notes(request.getNotes())
                .changedBy(recruiterUser)
                .build();
        statusHistoryRepository.save(history);

        User candidateUser = application.getCandidateProfile().getUser();
        Job job = application.getJob();

        // Email & Notification
        emailService.sendApplicationStatusUpdateEmail(candidateUser.getEmail(), candidateUser.getName(), job.getTitle(), request.getStatus().name(), request.getNotes());

        notificationService.createNotification(
                candidateUser,
                "Application Status Updated",
                "Your application for " + job.getTitle() + " has been updated to " + request.getStatus().name(),
                NotificationType.APPLICATION_STATUS_UPDATED
        );

        return mapToDto(application);
    }

    public ApplicationDto mapToDto(Application app) {
        List<ApplicationStatusHistory> histories = statusHistoryRepository.findByApplicationIdOrderByChangedAtDesc(app.getId());
        List<ApplicationStatusHistoryDto> historyDtos = histories.stream()
                .map(h -> ApplicationStatusHistoryDto.builder()
                        .id(h.getId())
                        .status(h.getStatus())
                        .notes(h.getNotes())
                        .changedByName(h.getChangedBy() != null ? h.getChangedBy().getName() : "System")
                        .changedAt(h.getChangedAt())
                        .build())
                .collect(Collectors.toList());

        return ApplicationDto.builder()
                .id(app.getId())
                .candidate(candidateService.mapToDto(app.getCandidateProfile()))
                .job(jobService.mapToDto(app.getJob(), app.getCandidateProfile().getId()))
                .currentStatus(app.getCurrentStatus())
                .coverLetter(app.getCoverLetter())
                .history(historyDtos)
                .appliedAt(app.getAppliedAt())
                .updatedAt(app.getUpdatedAt())
                .build();
    }
}
