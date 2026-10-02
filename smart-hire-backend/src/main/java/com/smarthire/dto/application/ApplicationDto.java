package com.smarthire.dto.application;

import com.smarthire.dto.candidate.CandidateProfileDto;
import com.smarthire.dto.job.JobDto;
import com.smarthire.enums.ApplicationStatus;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApplicationDto {
    private Long id;
    private CandidateProfileDto candidate;
    private JobDto job;
    private ApplicationStatus currentStatus;
    private String coverLetter;
    private List<ApplicationStatusHistoryDto> history;
    private LocalDateTime appliedAt;
    private LocalDateTime updatedAt;
}
