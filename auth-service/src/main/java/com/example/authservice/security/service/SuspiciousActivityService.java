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
  public void recordLoginAttempt(
      User user, String ipAddress, String userAgent, boolean successful, String failureReason) {
    // 로그인 이력 저장
    LoginHistory loginHistory =
        LoginHistory.builder()
            .user(user)
            .ipAddress(ipAddress)
            .userAgent(userAgent)
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

    // 의심스러운 활동 감지
    if (successful) {
      checkForSuspiciousLogin(user, ipAddress, userAgent);
    } else {
      checkForMultipleFailedAttempts(user, ipAddress, userAgent);
    }
  }

  private void checkForSuspiciousLogin(User user, String ipAddress, String userAgent) {
    // 1. 새로운 IP 체크
    List<String> knownIps = loginHistoryRepository.findDistinctSuccessfulIpsByUser(user);
    if (!knownIps.contains(ipAddress)) {
      recordSuspiciousActivity(
          user,
          SuspiciousActivity.ActivityType.UNUSUAL_IP_LOGIN,
          ipAddress,
          userAgent,
          "새로운 IP 주소에서 로그인: " + ipAddress);
    }

    // 2. 새로운 기기/브라우저 체크
    List<String> knownUserAgents =
        loginHistoryRepository.findDistinctSuccessfulUserAgentsByUser(user);
    if (!knownUserAgents.contains(userAgent)) {
      recordSuspiciousActivity(
          user,
          SuspiciousActivity.ActivityType.NEW_DEVICE_LOGIN,
          ipAddress,
          userAgent,
          "새로운 기기/브라우저에서 로그인: " + extractBrowserInfo(userAgent));
    }
  }

  private void checkForMultipleFailedAttempts(User user, String ipAddress, String userAgent) {
    // 지난 15분간 실패한 로그인 시도 체크
    LocalDateTime fifteenMinutesAgo = LocalDateTime.now().minusMinutes(15);
    long failedAttempts = loginHistoryRepository.countFailedLoginsSince(user, fifteenMinutesAgo);

    if (failedAttempts >= 5) { // 5번 이상 실패 시
      recordSuspiciousActivity(
          user,
          SuspiciousActivity.ActivityType.MULTIPLE_FAILED_ATTEMPTS,
          ipAddress,
          userAgent,
          "15분 내 " + failedAttempts + "번의 로그인 실패");
    }
  }

  @Transactional
  public void recordSuspiciousActivity(
      User user,
      SuspiciousActivity.ActivityType activityType,
      String ipAddress,
      String userAgent,
      String details) {

    SuspiciousActivity activity =
        SuspiciousActivity.builder()
            .user(user)
            .activityType(activityType)
            .ipAddress(ipAddress)
            .userAgent(userAgent)
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
          user.getEmail(), activityType.getDescription(), details, ipAddress, userAgent);

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

  private String extractBrowserInfo(String userAgent) {
    if (userAgent == null) return "Unknown";

    if (userAgent.contains("Chrome")) return "Chrome";
    if (userAgent.contains("Firefox")) return "Firefox";
    if (userAgent.contains("Safari")) return "Safari";
    if (userAgent.contains("Edge")) return "Edge";

    return "Unknown Browser";
  }
}
