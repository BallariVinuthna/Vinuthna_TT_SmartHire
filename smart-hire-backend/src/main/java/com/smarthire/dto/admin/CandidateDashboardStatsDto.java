package com.smarthire.dto.admin;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CandidateDashboardStatsDto {
    private long totalApplications;
    private long applicationsUnderReview;
    private long shortlistedApplications;
    private long upcomingInterviews;
    private long savedJobsCount;
    private int profileCompletionPercentage;
}
