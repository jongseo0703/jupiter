package com.example.authservice.security.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.authservice.auth.service.EmailService;
import com.example.authservice.security.entity.LoginHistory;
import com.example.authservice.security.entity.SuspiciousActivity;
import com.example.authservice.security.repository.LoginHistoryRepository;
import com.example.authservice.security.repository.SuspiciousActivityRepository;
import com.example.authservice.user.entity.SecuritySettings;
import com.example.authservice.user.entity.User;
import com.example.authservice.user.repository.SecuritySettingsRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class SuspiciousActivityService {

  private final SuspiciousActivityRepository suspiciousActivityRepository;
  private final LoginHistoryRepository loginHistoryRepository;
  private final SecuritySettingsRepository securitySettingsRepository;
  private final EmailService emailService;

  @Transactional
  public void recordLoginAttempt(User user, boolean successful, String failureReason) {
    // 로그인 이력 저장
    LoginHistory loginHistory =
        LoginHistory.builder()
            .user(user)
            .loginTime(LocalDateTime.now())
            .successful(successful)
            .failureReason(failureReason)
            .build();

    loginHistoryRepository.save(loginHistory);

    // 보안 설정 확인
    SecuritySettings securitySettings = securitySettingsRepository.findByUser(user).orElse(null);
    if (securitySettings == null || !securitySettings.getSuspiciousActivityAlerts()) {
      return;
    }

    // 비밀번호 실패 시에만 체크 (IP/브라우저 변경 감지 완전 제거)
    if (!successful) {
      checkForMultipleFailedAttempts(user);
    }
  }

  private void checkForMultipleFailedAttempts(User user) {
    // 지난 15분간 실패한 로그인 시도 체크
    LocalDateTime fifteenMinutesAgo = LocalDateTime.now().minusMinutes(15);
    long failedAttempts = loginHistoryRepository.countFailedLoginsSince(user, fifteenMinutesAgo);

    if (failedAttempts >= 5) { // 5번 이상 실패 시
      recordSuspiciousActivity(
          user,
          SuspiciousActivity.ActivityType.MULTIPLE_FAILED_ATTEMPTS,
          "15분 내 " + failedAttempts + "번의 로그인 실패");
    }
  }

  @Transactional
  public void recordSuspiciousActivity(
      User user, SuspiciousActivity.ActivityType activityType, String details) {

    SuspiciousActivity activity =
        SuspiciousActivity.builder()
            .user(user)
            .activityType(activityType)
            .ipAddress("N/A") // IP 추적 제거
            .userAgent("N/A") // User Agent 추적 제거
            .detectedAt(LocalDateTime.now())
            .details(details)
            .notified(false)
            .build();

    suspiciousActivityRepository.save(activity);

    log.warn(
        "의심스러운 활동 감지 - 사용자: {}, 유형: {}, 상세: {}",
        user.getEmail(),
        activityType.getDescription(),
        details);

    try {
      log.info(
          "의심스러운 활동 이메일 알림 발송 시도 - 사용자: {}, 유형: {}",
          user.getEmail(),
          activityType.getDescription());

      emailService.sendSuspiciousActivityAlert(
          user.getEmail(), activityType.getDescription(), details, "N/A", "N/A");

      activity.setNotified(true);
      suspiciousActivityRepository.save(activity);

      log.info("의심스러운 활동 이메일 알림 발송 성공 - 사용자: {}", user.getEmail());

    } catch (Exception e) {
      log.error("의심스러운 활동 이메일 알림 발송 실패 - 사용자: {}, 오류: {}", user.getEmail(), e.getMessage(), e);
    }
  }

  public List<SuspiciousActivity> getSuspiciousActivities(User user) {
    return suspiciousActivityRepository.findByUserOrderByDetectedAtDesc(user);
  }

  public List<LoginHistory> getLoginHistory(User user) {
    return loginHistoryRepository.findByUserOrderByLoginTimeDesc(user);
  }
}
