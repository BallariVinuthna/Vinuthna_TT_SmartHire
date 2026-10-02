package com.smarthire.dto.admin;

import lombok.*;

import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecruiterDashboardStatsDto {
    private long activeJobs;
    private long totalApplicants;
    private long shortlistedCandidates;
    private long scheduledInterviews;
    private long hiredCandidates;
    private Map<String, Long> applicationsByStatus;
}
