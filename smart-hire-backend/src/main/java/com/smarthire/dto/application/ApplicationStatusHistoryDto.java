package com.smarthire.dto.application;

import com.smarthire.enums.ApplicationStatus;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApplicationStatusHistoryDto {
    private Long id;
    private ApplicationStatus status;
    private String notes;
    private String changedByName;
    private LocalDateTime changedAt;
}
