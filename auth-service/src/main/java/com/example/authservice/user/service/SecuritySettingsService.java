package com.example.authservice.user.service;

import java.time.LocalDateTime;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.authservice.global.exception.BusinessException;
import com.example.authservice.user.dto.SecuritySettingsRequest;
import com.example.authservice.user.dto.SecuritySettingsResponse;
import com.example.authservice.user.entity.SecuritySettings;
import com.example.authservice.user.entity.User;
import com.example.authservice.user.repository.SecuritySettingsRepository;
import com.example.authservice.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class SecuritySettingsService {

  private final SecuritySettingsRepository securitySettingsRepository;
  private final UserRepository userRepository;

  @Transactional
  public SecuritySettingsResponse getSecuritySettings(Long userId) {
    User user =
        userRepository
            .findById(userId)
            .orElseThrow(() -> new BusinessException("사용자를 찾을 수 없습니다", 404, "USER_NOT_FOUND"));

    SecuritySettings settings =
        securitySettingsRepository
            .findByUser(user)
            .orElseGet(() -> createDefaultSecuritySettings(user));

    return SecuritySettingsResponse.from(settings);
  }

  @Transactional
  public SecuritySettingsResponse updateSecuritySettings(
      Long userId, SecuritySettingsRequest request) {
    User user =
        userRepository
            .findById(userId)
            .orElseThrow(() -> new BusinessException("사용자를 찾을 수 없습니다", 404, "USER_NOT_FOUND"));

    SecuritySettings settings =
        securitySettingsRepository
            .findByUser(user)
            .orElseGet(() -> createDefaultSecuritySettings(user));

    // 설정 업데이트
    if (request.twoFactorEnabled() != null) {
      settings.setTwoFactorEnabled(request.twoFactorEnabled());
      // 2FA 비활성화 시 시크릿 제거
      if (!request.twoFactorEnabled()) {
        settings.setTwoFactorSecret(null);
      }
    }

    if (request.suspiciousActivityAlerts() != null) {
      settings.setSuspiciousActivityAlerts(request.suspiciousActivityAlerts());
    }

    if (request.passwordChangePeriodDays() != null) {
      settings.setPasswordChangePeriodDays(request.passwordChangePeriodDays());
    }

    SecuritySettings savedSettings = securitySettingsRepository.save(settings);
    log.info("보안 설정 업데이트 완료 - 사용자 ID: {}", userId);

    return SecuritySettingsResponse.from(savedSettings);
  }

  @Transactional
  public void updateLastPasswordChange(Long userId) {
    User user =
        userRepository
            .findById(userId)
            .orElseThrow(() -> new BusinessException("사용자를 찾을 수 없습니다", 404, "USER_NOT_FOUND"));

    SecuritySettings settings =
        securitySettingsRepository
            .findByUser(user)
            .orElseGet(() -> createDefaultSecuritySettings(user));

    settings.setLastPasswordChange(LocalDateTime.now());
    securitySettingsRepository.save(settings);

    log.info("비밀번호 변경 시간 업데이트 - 사용자 ID: {}", userId);
  }

  @Transactional
  public String enableTwoFactor(Long userId) {
    User user =
        userRepository
            .findById(userId)
            .orElseThrow(() -> new BusinessException("사용자를 찾을 수 없습니다", 404, "USER_NOT_FOUND"));

    SecuritySettings settings =
        securitySettingsRepository
            .findByUser(user)
            .orElseGet(() -> createDefaultSecuritySettings(user));

    // 2FA 시크릿 생성 (실제로는 Google Authenticator 등의 라이브러리 사용)
    String secret = generateTwoFactorSecret();
    settings.setTwoFactorSecret(secret);
    settings.setTwoFactorEnabled(true);

    securitySettingsRepository.save(settings);
    log.info("2FA 활성화 완료 - 사용자 ID: {}", userId);

    return secret; // QR 코드 생성용
  }

  @Transactional
  public void disableTwoFactor(Long userId) {
    User user =
        userRepository
            .findById(userId)
            .orElseThrow(() -> new BusinessException("사용자를 찾을 수 없습니다", 404, "USER_NOT_FOUND"));

    SecuritySettings settings =
        securitySettingsRepository
            .findByUser(user)
            .orElseGet(() -> createDefaultSecuritySettings(user));

    settings.setTwoFactorEnabled(false);
    settings.setTwoFactorSecret(null);

    securitySettingsRepository.save(settings);
    log.info("2FA 비활성화 완료 - 사용자 ID: {}", userId);
  }

  private SecuritySettings createDefaultSecuritySettings(User user) {
    SecuritySettings defaultSettings =
        SecuritySettings.builder()
            .user(user)
            .twoFactorEnabled(false)
            .suspiciousActivityAlerts(true)
            .passwordChangePeriodDays(90)
            .lastPasswordChange(LocalDateTime.now()) // 현재 시간으로 설정
            .build();

    return securitySettingsRepository.save(defaultSettings);
  }

  private String generateTwoFactorSecret() {
    // Google Authenticator 호환 Base32 시크릿 생성 (16바이트 = 128비트)
    String base32Chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
    StringBuilder secret = new StringBuilder();
    java.security.SecureRandom random = new java.security.SecureRandom();

    // 32자 길이의 Base32 문자열 생성 (권장 길이)
    for (int i = 0; i < 32; i++) {
      secret.append(base32Chars.charAt(random.nextInt(base32Chars.length())));
    }

    return secret.toString();
  }
}
