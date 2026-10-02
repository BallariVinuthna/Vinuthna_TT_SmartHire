package com.smarthire.dto.admin;

import lombok.*;

import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminDashboardStatsDto {
    private long totalUsers;
    private long totalCandidates;
    private long totalRecruiters;
    private long totalCompanies;
    private long totalJobs;
    private long totalApplications;
    private long totalHires;
    private Map<String, Long> applicationsByStatus;
    private Map<String, Long> userRegistrationsByRole;
}
