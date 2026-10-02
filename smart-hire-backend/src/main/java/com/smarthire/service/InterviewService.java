package com.smarthire.service;

import com.smarthire.dto.common.PageResponse;
import com.smarthire.dto.interview.*;
import com.smarthire.entity.*;
import com.smarthire.enums.ApplicationStatus;
import com.smarthire.enums.InterviewStatus;
import com.smarthire.enums.NotificationType;
import com.smarthire.exception.AccessDeniedException;
import com.smarthire.exception.ResourceNotFoundException;
import com.smarthire.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
public class InterviewService {

    private final InterviewRepository interviewRepository;
    private final ApplicationRepository applicationRepository;
    private final RecruiterProfileRepository recruiterProfileRepository;
    private final CandidateProfileRepository candidateProfileRepository;
    private final ApplicationService applicationService;
    private final EmailService emailService;
    private final NotificationService notificationService;

    @Transactional
    public InterviewDto scheduleInterview(User recruiterUser, ScheduleInterviewRequest request) {
        RecruiterProfile recruiterProfile = recruiterProfileRepository.findByUser(recruiterUser)
                .orElseThrow(() -> new ResourceNotFoundException("Recruiter profile not found"));

        Application application = applicationRepository.findById(request.getApplicationId())
                .orElseThrow(() -> new ResourceNotFoundException("Application not found: " + request.getApplicationId()));

        if (!application.getJob().getRecruiter().getId().equals(recruiterProfile.getId())) {
            throw new AccessDeniedException("You can only schedule interviews for your own job applicants");
        }

        Interview interview = Interview.builder()
                .application(application)
                .scheduledAt(request.getScheduledAt())
                .interviewType(request.getInterviewType() != null ? request.getInterviewType() : "Technical Interview")
                .meetingLink(request.getMeetingLink())
                .notes(request.getNotes())
                .status(InterviewStatus.SCHEDULED)
                .build();

        interview = interviewRepository.save(interview);

        // Update Application Status to INTERVIEW
        application.setCurrentStatus(ApplicationStatus.INTERVIEW);
        applicationRepository.save(application);

        User candidateUser = application.getCandidateProfile().getUser();
        Job job = application.getJob();
        String formattedDate = request.getScheduledAt().format(DateTimeFormatter.ofPattern("MMM dd, yyyy - hh:mm a"));

        // Dispatch Email & In-App Notification
        emailService.sendInterviewScheduledEmail(candidateUser.getEmail(), candidateUser.getName(), job.getTitle(), formattedDate, request.getMeetingLink());

        notificationService.createNotification(
                candidateUser,
                "Interview Scheduled!",
                "Interview for " + job.getTitle() + " scheduled on " + formattedDate,
                NotificationType.INTERVIEW_SCHEDULED
        );

        return mapToDto(interview);
    }

    @Transactional(readOnly = true)
    public PageResponse<InterviewDto> getCandidateInterviews(User candidateUser, int page, int size) {
        CandidateProfile profile = candidateProfileRepository.findByUser(candidateUser)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate profile not found"));

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "scheduledAt"));
        Page<Interview> pageResult = interviewRepository.findByApplicationCandidateProfileId(profile.getId(), pageable);
        return PageResponse.fromPage(pageResult.map(this::mapToDto));
    }

    @Transactional(readOnly = true)
    public PageResponse<InterviewDto> getRecruiterInterviews(User recruiterUser, int page, int size) {
        RecruiterProfile profile = recruiterProfileRepository.findByUser(recruiterUser)
                .orElseThrow(() -> new ResourceNotFoundException("Recruiter profile not found"));

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "scheduledAt"));
        Page<Interview> pageResult = interviewRepository.findByApplicationJobRecruiterId(profile.getId(), pageable);
        return PageResponse.fromPage(pageResult.map(this::mapToDto));
    }

    public InterviewDto mapToDto(Interview interview) {
        return InterviewDto.builder()
                .id(interview.getId())
                .application(applicationService.mapToDto(interview.getApplication()))
                .scheduledAt(interview.getScheduledAt())
                .interviewType(interview.getInterviewType())
                .meetingLink(interview.getMeetingLink())
                .notes(interview.getNotes())
                .status(interview.getStatus())
                .createdAt(interview.getCreatedAt())
                .build();
    }
}
