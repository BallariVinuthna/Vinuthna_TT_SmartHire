package com.smarthire.dto.job;

import com.smarthire.enums.JobMode;
import com.smarthire.enums.JobStatus;
import com.smarthire.enums.JobType;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateJobRequest {
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
    private List<String> skills;
}
