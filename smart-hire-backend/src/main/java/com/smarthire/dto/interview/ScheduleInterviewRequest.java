package com.smarthire.dto.interview;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ScheduleInterviewRequest {

    @NotNull(message = "Application ID is required")
    private Long applicationId;

    @NotNull(message = "Scheduled time is required")
    @Future(message = "Interview time must be in the future")
    private LocalDateTime scheduledAt;

    private String interviewType; // e.g. "TECHNICAL_ROUND", "HR_ROUND"
    private String meetingLink;
    private String notes;
}
