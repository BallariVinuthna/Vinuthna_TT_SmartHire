package com.smarthire.dto.interview;

import com.smarthire.dto.application.ApplicationDto;
import com.smarthire.enums.InterviewStatus;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InterviewDto {
    private Long id;
    private ApplicationDto application;
    private LocalDateTime scheduledAt;
    private String interviewType;
    private String meetingLink;
    private String notes;
    private InterviewStatus status;
    private LocalDateTime createdAt;
}
