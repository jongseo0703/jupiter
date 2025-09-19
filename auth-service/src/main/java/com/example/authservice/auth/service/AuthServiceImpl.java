package com.example.authservice.auth.service;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.authservice.auth.dto.LoginRequest;
import com.example.authservice.auth.dto.LoginResponse;
import com.example.authservice.auth.dto.RegisterRequest;
import com.example.authservice.auth.security.JwtTokenProvider;
import com.example.authservice.auth.token.RefreshTokenService;
import com.example.authservice.global.exception.BusinessException;
import com.example.authservice.user.dto.UserResponse;
import com.example.authservice.user.entity.Role;
import com.example.authservice.user.entity.User;
import com.example.authservice.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

  private final UserRepository userRepository;
  private final PasswordEncoder passwordEncoder;
  private final AuthenticationManager authenticationManager;
  private final JwtTokenProvider jwtTokenProvider;
  private final RefreshTokenService refreshTokenService;

  @Override
  @Transactional
  public UserResponse register(RegisterRequest request) {
    log.info("Registering new user with username: {}", request.username());

    // 이미 유저가 있는지 확인
    if (userRepository.existsByUsername(request.username())) {
      throw new BusinessException("Username already exists", 409, "DUPLICATE_USERNAME");
    }

    // 이미 있는 이메일인지 확인
    if (userRepository.existsByEmail(request.email())) {
      throw new BusinessException("Email already exists", 409, "DUPLICATE_EMAIL");
    }

    User user =
        User.builder()
            .username(request.username())
            .email(request.email())
            .password(passwordEncoder.encode(request.password()))
            .role(Role.USER)
            .enabled(true)
            .accountNonExpired(true)
            .accountNonLocked(true)
            .credentialsNonExpired(true)
            .build();

    User savedUser = userRepository.save(user);
    log.info("User registered successfully with ID: {}", savedUser.getId());

    return UserResponse.from(savedUser);
  }

  @Override
  public LoginResponse login(LoginRequest request) {
    log.info("Attempting login for email: {}", request.email());

    // 1. AuthenticationManager를 통한 인증
    Authentication authentication =
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.email(), request.password()));

    log.debug("Authentication successful for user: {}", request.email());

    // 2. 인증된 정보에서 User 객체 가져오기
    User user = (User) authentication.getPrincipal();

    // 3. JWT 토큰 생성
    String accessToken = jwtTokenProvider.generateAccessToken(authentication);
    String refreshToken = jwtTokenProvider.generateRefreshToken(user.getId());

    log.info("Tokens generated for user: {}", user.getUsername());

    // 4. Refresh Token을 Redis에 저장
    refreshTokenService.saveTokenInfo(user.getEmail(), refreshToken, accessToken);

    return LoginResponse.of(accessToken, refreshToken);
  }
}
