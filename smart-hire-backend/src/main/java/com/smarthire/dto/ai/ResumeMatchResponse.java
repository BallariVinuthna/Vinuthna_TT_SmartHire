package com.smarthire.dto.ai;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResumeMatchResponse {
    private int matchScore; // 0 to 100
    private String candidateTitle;
    private String targetJobTitle;
    private List<String> matchedSkills;
    private List<String> missingSkills;
    private String experienceFit;
    private String matchSummary;
    private String hiringRecommendation;
}
