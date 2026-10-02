package com.smarthire.dto.candidate;

import com.smarthire.dto.auth.UserDto;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CandidateProfileDto {
    private Long id;
    private UserDto user;
    private String title;
    private String location;
    private String bio;
    private String education;
    private String experience;
    private Integer experienceYears;
    private String resumeUrl;
    private List<CandidateSkillDto> skills;
    private int profileCompletionPercentage;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
