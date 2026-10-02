package com.smarthire.dto.recruiter;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompanyDto {
    private Long id;
    private String name;
    private String description;
    private String website;
    private String location;
    private String logoUrl;
    private LocalDateTime createdAt;
}
