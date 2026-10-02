package com.smarthire.dto.candidate;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateCandidateProfileRequest {
    private String name;
    private String phone;
    private String title;
    private String location;
    private String bio;
    private String education;
    private String experience;
    private Integer experienceYears;
    private String resumeUrl;
    private List<String> skills;
}
