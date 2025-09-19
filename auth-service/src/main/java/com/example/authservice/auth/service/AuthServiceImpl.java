package com.example.authservice.auth.service;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.authservice.auth.dto.ForgotPasswordRequest;
import com.example.authservice.auth.dto.ForgotPasswordResponse;
import com.example.authservice.auth.dto.LoginRequest;
import com.example.authservice.auth.dto.LoginResponse;
import com.example.authservice.auth.dto.RegisterRequest;
import com.example.authservice.auth.security.JwtTokenProvider;
import com.example.authservice.auth.token.RefreshTokenService;
import com.example.authservice.global.exception.BusinessException;
import com.example.authservice.global.util.PasswordGenerator;
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
  private final EmailService emailService;
  private final PasswordGenerator passwordGenerator;
  private final SmsService smsService;

  @Override
  @Transactional
  public UserResponse register(RegisterRequest request) {
    log.info("Registering new user with username: {}", request.username());

    // 휴대폰 인증 완료 확인
    if (!smsService.isPhoneVerified(request.phone())) {
      throw new BusinessException("휴대폰 인증이 완료되지 않았습니다", 400, "PHONE_NOT_VERIFIED");
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
            .phone(request.phone())
            .role(Role.USER)
            .enabled(true)
            .accountNonExpired(true)
            .accountNonLocked(true)
            .credentialsNonExpired(true)
            .build();

    User savedUser = userRepository.save(user);

    // 휴대폰 인증 사용 완료 처리
    smsService.markVerificationAsUsed(request.phone());

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

  @Override
  @Transactional
  public ForgotPasswordResponse forgotPassword(ForgotPasswordRequest request) {
    log.info("비밀번호 찾기 요청: {}", request.email());

    // 1. 이메일로 사용자 조회
    User user =
        userRepository
            .findByEmail(request.email())
            .orElseThrow(
                () -> new BusinessException("해당 이메일로 등록된 사용자가 없습니다.", 404, "USER_NOT_FOUND"));

    // 2. 임시 비밀번호 생성
    String temporaryPassword = passwordGenerator.generateTemporaryPassword();

    // 3. 임시 비밀번호를 암호화하여 DB 저장
    user.setPassword(passwordEncoder.encode(temporaryPassword));
    userRepository.save(user);

    // 4. 이메일 발송
    try {
      emailService.sendTemporaryPassword(request.email(), temporaryPassword);
      log.info("임시 비밀번호 발송 완료: {}", request.email());
      return ForgotPasswordResponse.success(request.email());

    } catch (Exception e) {
      log.error("임시 비밀번호 이메일 발송 실패: {}", request.email(), e);
      throw new BusinessException("이메일 발송에 실패했습니다. 잠시 후 다시 시도해주세요.", 500, "EMAIL_SEND_FAILED");
    }
  }
}
