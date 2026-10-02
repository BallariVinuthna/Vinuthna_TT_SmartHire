package com.smarthire.dto.recruiter;

import com.smarthire.dto.auth.UserDto;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecruiterProfileDto {
    private Long id;
    private UserDto user;
    private CompanyDto company;
    private String title;
    private String phone;
    private LocalDateTime createdAt;
}
