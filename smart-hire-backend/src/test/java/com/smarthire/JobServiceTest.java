package com.smarthire;

import com.smarthire.dto.job.CreateJobRequest;
import com.smarthire.dto.job.JobDto;
import com.smarthire.dto.job.UpdateJobRequest;
import com.smarthire.entity.*;
import com.smarthire.enums.JobMode;
import com.smarthire.enums.JobStatus;
import com.smarthire.enums.JobType;
import com.smarthire.enums.Role;
import com.smarthire.exception.AccessDeniedException;
import com.smarthire.repository.JobRepository;
import com.smarthire.repository.RecruiterProfileRepository;
import com.smarthire.service.JobService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class JobServiceTest {

    @Mock
    private JobRepository jobRepository;

    @Mock
    private RecruiterProfileRepository recruiterProfileRepository;

    @InjectMocks
    private JobService jobService;

    private User recruiterUser;
    private RecruiterProfile recruiterProfile;
    private Company company;
    private Job job;

    @BeforeEach
    void setUp() {
        recruiterUser = User.builder().id(10L).name("Recruiter One").email("rec1@example.com").role(Role.ROLE_RECRUITER).build();
        company = Company.builder().id(100L).name("TechCorp").build();
        recruiterProfile = RecruiterProfile.builder().id(50L).user(recruiterUser).company(company).build();

        job = Job.builder()
                .id(1L)
                .title("Java Developer")
                .description("Build microservices")
                .location("Remote")
                .jobType(JobType.FULL_TIME)
                .workMode(JobMode.REMOTE)
                .recruiter(recruiterProfile)
                .company(company)
                .status(JobStatus.APPROVED)
                .build();
    }

    @Test
    void createJob_Success() {
        CreateJobRequest request = CreateJobRequest.builder()
                .title("Java Developer")
                .description("Build microservices")
                .location("Remote")
                .jobType(JobType.FULL_TIME)
                .workMode(JobMode.REMOTE)
                .salaryMin(new BigDecimal("100000"))
                .build();

        when(recruiterProfileRepository.findByUser(recruiterUser)).thenReturn(Optional.of(recruiterProfile));
        when(jobRepository.save(any(Job.class))).thenReturn(job);

        JobDto created = jobService.createJob(recruiterUser, request);

        assertNotNull(created);
        assertEquals("Java Developer", created.getTitle());
    }

    @Test
    void updateJob_UnauthorizedRecruiter_ThrowsAccessDenied() {
        User otherRecruiterUser = User.builder().id(20L).email("other@example.com").build();
        RecruiterProfile otherRecruiterProfile = RecruiterProfile.builder().id(99L).user(otherRecruiterUser).build();

        when(recruiterProfileRepository.findByUser(otherRecruiterUser)).thenReturn(Optional.of(otherRecruiterProfile));
        when(jobRepository.findById(1L)).thenReturn(Optional.of(job));

        UpdateJobRequest updateReq = UpdateJobRequest.builder().title("Updated Title").build();

        assertThrows(AccessDeniedException.class, () -> jobService.updateJob(otherRecruiterUser, 1L, updateReq));
    }
}
