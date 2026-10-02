package com.smarthire.dto.candidate;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CandidateSkillDto {
    private Long id;
    private Long skillId;
    private String skillName;
    private String category;
    private String proficiencyLevel;
}
