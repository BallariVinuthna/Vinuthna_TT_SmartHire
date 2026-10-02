package com.smarthire.dto.job;

import com.smarthire.dto.recruiter.CompanyDto;
import com.smarthire.enums.JobMode;
import com.smarthire.enums.JobStatus;
import com.smarthire.enums.JobType;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobDto {
    private Long id;
    private String title;
    private String description;
    private String responsibilities;
    private String requirements;
    private String location;
    private JobType jobType;
    private JobMode workMode;
    private Integer experienceRequired;
    private BigDecimal salaryMin;
    private BigDecimal salaryMax;
    private LocalDate applicationDeadline;
    private JobStatus status;
    private Long recruiterId;
    private String recruiterName;
    private CompanyDto company;
    private List<SkillDto> skills;
    private long totalApplications;
    private boolean savedByCurrentCandidate;
    private boolean appliedByCurrentCandidate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
