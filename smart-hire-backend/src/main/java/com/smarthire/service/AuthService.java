package com.smarthire.service;

import com.smarthire.dto.auth.*;
import com.smarthire.entity.*;
import com.smarthire.enums.Role;

import com.smarthire.exception.BadRequestException;
import com.smarthire.exception.DuplicateResourceException;
import com.smarthire.exception.ResourceNotFoundException;
import com.smarthire.repository.*;
import com.smarthire.security.JwtService;
import com.smarthire.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final CandidateProfileRepository candidateProfileRepository;
    private final RecruiterProfileRepository recruiterProfileRepository;
    private final CompanyRepository companyRepository;
    private final SkillRepository skillRepository;
    private final CandidateSkillRepository candidateSkillRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final EmailService emailService;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    @Transactional
    public AuthResponse registerCandidate(CandidateRegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email already in use: " + request.getEmail());
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .role(Role.ROLE_CANDIDATE)
                .active(true)
                .build();
        user = userRepository.save(user);

        CandidateProfile profile = CandidateProfile.builder()
                .user(user)
                .title(request.getTitle() != null ? request.getTitle() : "Software Professional")
                .location(request.getLocation())
                .bio(request.getBio())
                .education(request.getEducation())
                .experience(request.getExperience())
                .experienceYears(request.getExperienceYears() != null ? request.getExperienceYears() : 0)
                .skills(new ArrayList<>())
                .build();
        profile = candidateProfileRepository.save(profile);

        if (request.getSkills() != null && !request.getSkills().isEmpty()) {
            List<CandidateSkill> candidateSkills = new ArrayList<>();
            for (String skillName : request.getSkills()) {
                Skill skill = skillRepository.findByNameIgnoreCase(skillName)
                        .orElseGet(() -> skillRepository.save(Skill.builder().name(skillName).category("General").build()));
                candidateSkills.add(CandidateSkill.builder()
                        .candidateProfile(profile)
                        .skill(skill)
                        .proficiencyLevel("INTERMEDIATE")
                        .build());
            }
            candidateSkillRepository.saveAll(candidateSkills);
        }

        emailService.sendWelcomeEmail(user.getEmail(), user.getName(), "Candidate");

        UserPrincipal principal = new UserPrincipal(user);
        String token = jwtService.generateToken(principal);

        return AuthResponse.builder()
                .token(token)
                .user(mapToUserDto(user))
                .profileId(profile.getId())
                .build();
    }

    @Transactional
    public AuthResponse registerRecruiter(RecruiterRegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email already in use: " + request.getEmail());
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .role(Role.ROLE_RECRUITER)
                .active(true)
                .build();
        user = userRepository.save(user);

        Company company = companyRepository.findByName(request.getCompanyName())
                .orElseGet(() -> companyRepository.save(Company.builder()
                        .name(request.getCompanyName())
                        .description(request.getCompanyDescription())
                        .website(request.getCompanyWebsite())
                        .location(request.getCompanyLocation())
                        .build()));

        RecruiterProfile profile = RecruiterProfile.builder()
                .user(user)
                .company(company)
                .title(request.getTitle() != null ? request.getTitle() : "Talent Acquisition Specialist")
                .phone(request.getPhone())
                .build();
        profile = recruiterProfileRepository.save(profile);

        emailService.sendWelcomeEmail(user.getEmail(), user.getName(), "Recruiter");

        UserPrincipal principal = new UserPrincipal(user);
        String token = jwtService.generateToken(principal);

        return AuthResponse.builder()
                .token(token)
                .user(mapToUserDto(user))
                .profileId(profile.getId())
                .companyId(company.getId())
                .build();
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        User user = principal.getUser();
        String token = jwtService.generateToken(principal);

        Long profileId = null;
        Long companyId = null;

        if (user.getRole() == Role.ROLE_CANDIDATE) {
            profileId = candidateProfileRepository.findByUser(user)
                    .map(CandidateProfile::getId).orElse(null);
        } else if (user.getRole() == Role.ROLE_RECRUITER) {
            RecruiterProfile recProfile = recruiterProfileRepository.findByUser(user).orElse(null);
            if (recProfile != null) {
                profileId = recProfile.getId();
                companyId = recProfile.getCompany().getId();
            }
        }

        return AuthResponse.builder()
                .token(token)
                .user(mapToUserDto(user))
                .profileId(profileId)
                .companyId(companyId)
                .build();
    }

    @Transactional(readOnly = true)
    public AuthResponse getMe(User user) {
        Long profileId = null;
        Long companyId = null;

        if (user.getRole() == Role.ROLE_CANDIDATE) {
            profileId = candidateProfileRepository.findByUser(user)
                    .map(CandidateProfile::getId).orElse(null);
        } else if (user.getRole() == Role.ROLE_RECRUITER) {
            RecruiterProfile recProfile = recruiterProfileRepository.findByUser(user).orElse(null);
            if (recProfile != null) {
                profileId = recProfile.getId();
                companyId = recProfile.getCompany().getId();
            }
        }

        return AuthResponse.builder()
                .user(mapToUserDto(user))
                .profileId(profileId)
                .companyId(companyId)
                .build();
    }

    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("No account found with email: " + request.getEmail()));

        passwordResetTokenRepository.deleteByUserId(user.getId());

        String resetToken = UUID.randomUUID().toString();
        PasswordResetToken token = PasswordResetToken.builder()
                .token(resetToken)
                .user(user)
                .expiryDate(LocalDateTime.now().plusHours(1))
                .used(false)
                .build();
        passwordResetTokenRepository.save(token);

        String resetLink = frontendUrl + "/reset-password?token=" + resetToken;
        emailService.sendPasswordResetEmail(user.getEmail(), user.getName(), resetLink);
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        PasswordResetToken token = passwordResetTokenRepository.findByToken(request.getToken())
                .orElseThrow(() -> new BadRequestException("Invalid reset token"));

        if (token.isUsed() || token.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Reset token expired or already used");
        }

        User user = token.getUser();
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        token.setUsed(true);
        passwordResetTokenRepository.save(token);
    }

    public UserDto mapToUserDto(User user) {
        return UserDto.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole())
                .active(user.isActive())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
