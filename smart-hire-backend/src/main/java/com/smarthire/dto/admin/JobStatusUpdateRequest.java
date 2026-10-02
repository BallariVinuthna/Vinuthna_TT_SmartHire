package com.smarthire.dto.admin;

import com.smarthire.enums.JobStatus;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobStatusUpdateRequest {

    @NotNull(message = "Job status is required")
    private JobStatus status;
}
