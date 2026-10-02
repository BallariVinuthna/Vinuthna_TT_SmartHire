package com.smarthire.dto.job;

import com.smarthire.enums.JobMode;
import com.smarthire.enums.JobType;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobSearchCriteria {
    private String query;
    private String location;
    private JobType jobType;
    private JobMode workMode;
    private Integer minExperience;
    private Integer maxExperience;
    private String skill;
    @Builder.Default
    private int page = 0;
    @Builder.Default
    private int size = 10;
    @Builder.Default
    private String sortBy = "createdAt";
    @Builder.Default
    private String sortDir = "desc";
}
