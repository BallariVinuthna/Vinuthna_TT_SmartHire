package com.smarthire.dto.ai;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResumeAnalysisResponse {
    private String candidateName;
    private String title;
    private String contactInfo;
    private Integer estimatedYearsExperience;
    private List<String> technicalSkills;
    private List<String> softSkills;
    private List<String> education;
    private List<String> keyExperiences;
    private List<String> strengths;
    private List<String> interviewVerificationPoints;
    private String executiveSummary;
}
