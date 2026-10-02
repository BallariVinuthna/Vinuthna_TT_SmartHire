package com.smarthire;

import com.smarthire.dto.auth.AuthResponse;
import com.smarthire.dto.auth.CandidateRegisterRequest;
import com.smarthire.dto.auth.LoginRequest;
import com.smarthire.entity.User;
import com.smarthire.enums.Role;
import com.smarthire.exception.DuplicateResourceException;
import com.smarthire.repository.CandidateProfileRepository;
import com.smarthire.repository.UserRepository;
import com.smarthire.security.JwtService;
import com.smarthire.service.AuthService;
import com.smarthire.service.EmailService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private CandidateProfileRepository candidateProfileRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private EmailService emailService;

    @Mock
    private com.smarthire.repository.SkillRepository skillRepository;

    @Mock
    private com.smarthire.repository.CandidateSkillRepository candidateSkillRepository;

    @InjectMocks
    private AuthService authService;

    private CandidateRegisterRequest candidateRequest;
    private User candidateUser;

    @BeforeEach
    void setUp() {
        candidateRequest = CandidateRegisterRequest.builder()
                .name("John Doe")
                .email("john.doe@example.com")
                .password("Password123")
                .skills(List.of("Java", "React"))
                .build();

        candidateUser = User.builder()
                .id(1L)
                .name("John Doe")
                .email("john.doe@example.com")
                .password("encoded_hash")
                .role(Role.ROLE_CANDIDATE)
                .active(true)
                .build();
    }

    @Test
    void registerCandidate_Success() {
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("encoded_hash");
        when(userRepository.save(any(User.class))).thenReturn(candidateUser);
        when(candidateProfileRepository.save(any(com.smarthire.entity.CandidateProfile.class))).thenAnswer(inv -> {
            com.smarthire.entity.CandidateProfile p = inv.getArgument(0);
            p.setId(1L);
            return p;
        });
        when(jwtService.generateToken(any())).thenReturn("jwt_mock_token");
        when(skillRepository.findByNameIgnoreCase(anyString())).thenReturn(Optional.empty());
        when(skillRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        AuthResponse response = authService.registerCandidate(candidateRequest);

        assertNotNull(response);
        assertEquals("jwt_mock_token", response.getToken());
        assertEquals("john.doe@example.com", response.getUser().getEmail());
        verify(emailService, times(1)).sendWelcomeEmail(anyString(), anyString(), anyString());
    }

    @Test
    void registerCandidate_DuplicateEmail_ThrowsException() {
        when(userRepository.existsByEmail("john.doe@example.com")).thenReturn(true);

        assertThrows(DuplicateResourceException.class, () -> authService.registerCandidate(candidateRequest));
        verify(userRepository, never()).save(any());
    }

    @Test
    void login_Success() {
        LoginRequest loginRequest = LoginRequest.builder()
                .email("john.doe@example.com")
                .password("Password123")
                .build();

        Authentication auth = mock(Authentication.class);
        com.smarthire.security.UserPrincipal principal = new com.smarthire.security.UserPrincipal(candidateUser);
        when(auth.getPrincipal()).thenReturn(principal);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(auth);
        when(jwtService.generateToken(any())).thenReturn("login_jwt_token");

        AuthResponse response = authService.login(loginRequest);

        assertNotNull(response);
        assertEquals("login_jwt_token", response.getToken());
        assertEquals("john.doe@example.com", response.getUser().getEmail());
    }
}
