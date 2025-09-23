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
import com.example.authservice.user.entity.SecuritySettings;
import com.example.authservice.user.entity.User;
import com.example.authservice.user.repository.SecuritySettingsRepository;
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
  private final SecuritySettingsRepository securitySettingsRepository;
  private final TotpService totpService;

  @Override
  @Transactional
  public UserResponse register(RegisterRequest request) {
    log.info("Registering new user with username: {}", request.username());

    // 휴대폰 인증 완료 확인 (하이픈 제거된 번호로 확인)
    String normalizedPhone = request.normalizedPhone();
    if (!smsService.isPhoneVerified(normalizedPhone)) {
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
            .phone(normalizedPhone)
            .role(Role.USER)
            .enabled(true)
            .accountNonExpired(true)
            .accountNonLocked(true)
            .credentialsNonExpired(true)
            .build();

    User savedUser = userRepository.save(user);

    // 휴대폰 인증 사용 완료 처리
    smsService.markVerificationAsUsed(normalizedPhone);

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

    // 5. 2FA 및 비밀번호 변경 필요 여부 확인
    boolean passwordChangeRequired = false;
    boolean twoFactorRequired = false;

    try {
      SecuritySettings securitySettings = securitySettingsRepository.findByUser(user).orElse(null);
      if (securitySettings != null) {
        passwordChangeRequired = securitySettings.isPasswordChangeRequired();
        twoFactorRequired =
            securitySettings.getTwoFactorEnabled() && securitySettings.getTwoFactorSecret() != null;
      }
    } catch (Exception e) {
      log.warn("보안 설정 확인 중 오류 발생: {}", e.getMessage());
    }

    // 6. 2FA가 필요한 경우 임시 토큰 생성하고 2FA 요구
    if (twoFactorRequired) {
      String tempToken = jwtTokenProvider.generateTempToken(user.getId(), user.getEmail());
      log.info("2FA required for user: {}, temp token generated", user.getEmail());
      return LoginResponse.requireTwoFactor(tempToken);
    }

    return LoginResponse.of(accessToken, refreshToken, passwordChangeRequired);
  }

  @Override
  @Transactional
  public LoginResponse verifyTwoFactor(String tempToken, String code) {
    try {
      log.debug("2FA verification started with tempToken: {}, code: {}", tempToken, code);

      // 1. 임시 토큰에서 사용자 ID 추출
      Long userId = jwtTokenProvider.getUserIdFromTempToken(tempToken);
      log.debug("Extracted userId from temp token: {}", userId);

      User user =
          userRepository
              .findById(userId)
              .orElseThrow(() -> new BusinessException("사용자를 찾을 수 없습니다", 404, "USER_NOT_FOUND"));

      log.debug("Found user: {}", user.getEmail());

      // 2. 사용자의 2FA 시크릿 조회
      SecuritySettings securitySettings =
          securitySettingsRepository
              .findByUser(user)
              .orElseThrow(
                  () ->
                      new BusinessException(
                          "보안 설정을 찾을 수 없습니다", 404, "SECURITY_SETTINGS_NOT_FOUND"));

      if (!securitySettings.getTwoFactorEnabled()
          || securitySettings.getTwoFactorSecret() == null) {
        throw new BusinessException("2단계 인증이 설정되지 않았습니다", 400, "TWO_FACTOR_NOT_ENABLED");
      }

      // 3. TOTP 코드 검증
      boolean isValid = totpService.verifyCode(securitySettings.getTwoFactorSecret(), code);
      if (!isValid) {
        throw new BusinessException("인증 코드가 올바르지 않습니다", 400, "INVALID_VERIFICATION_CODE");
      }

      // 4. 2FA 검증 성공 - 정상 토큰 생성
      Authentication authentication =
          new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities());
      String accessToken = jwtTokenProvider.generateAccessToken(authentication);
      String refreshToken = jwtTokenProvider.generateRefreshToken(user.getId());

      // 5. Refresh Token을 Redis에 저장
      refreshTokenService.saveTokenInfo(user.getEmail(), refreshToken, accessToken);

      // 6. 비밀번호 변경 필요 여부 확인
      boolean passwordChangeRequired = securitySettings.isPasswordChangeRequired();

      log.info("2FA verification successful for user: {}", user.getEmail());
      return LoginResponse.of(accessToken, refreshToken, passwordChangeRequired);

    } catch (BusinessException e) {
      log.warn("2FA verification failed: {}", e.getMessage());
      throw e;
    } catch (Exception e) {
      log.error("2FA verification error: {}", e.getMessage(), e);
      throw new BusinessException("2단계 인증 처리 중 오류가 발생했습니다", 500, "TWO_FACTOR_VERIFICATION_ERROR");
    }
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
