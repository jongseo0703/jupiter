package com.example.authservice.notification.service;

import java.time.LocalTime;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.authservice.global.exception.BusinessException;
import com.example.authservice.notification.dto.NotificationSettingsRequest;
import com.example.authservice.notification.dto.NotificationSettingsResponse;
import com.example.authservice.notification.entity.NotificationSettings;
import com.example.authservice.notification.repository.NotificationSettingsRepository;
import com.example.authservice.user.entity.User;
import com.example.authservice.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NotificationSettingsServiceImpl implements NotificationSettingsService {

  private final NotificationSettingsRepository notificationSettingsRepository;
  private final UserRepository userRepository;

  @Override
  public NotificationSettingsResponse getSettings(Long userId) {
    Optional<NotificationSettings> existing = notificationSettingsRepository.findByUserId(userId);
    if (existing.isPresent()) {
      return NotificationSettingsResponse.from(existing.get());
    }

    // 설정이 없으면 기본값으로 응답 (DB에 저장하지 않음)
    return new NotificationSettingsResponse(
        null, true, true, LocalTime.of(9, 0), LocalTime.of(21, 0), true, 5, 10);
  }

  @Override
  @Transactional(readOnly = false)
  public NotificationSettingsResponse createSettings(
      Long userId, NotificationSettingsRequest request) {
    User user =
        userRepository
            .findById(userId)
            .orElseThrow(() -> new BusinessException("사용자를 찾을 수 없습니다.", 404, "USER_NOT_FOUND"));

    if (notificationSettingsRepository.existsByUserId(userId)) {
      throw new BusinessException("이미 알림 설정이 존재합니다.", 409, "NOTIFICATION_SETTINGS_ALREADY_EXISTS");
    }

    NotificationSettings settings =
        NotificationSettings.builder()
            .user(user)
            .emailNotifications(request.emailNotifications())
            .pushNotifications(request.pushNotifications())
            .notificationStartTime(request.notificationStartTime())
            .notificationEndTime(request.notificationEndTime())
            .weekendNotifications(request.weekendNotifications())
            .minDiscountPercent(request.minDiscountPercent())
            .maxDailyNotifications(request.maxDailyNotifications())
            .build();

    NotificationSettings savedSettings = notificationSettingsRepository.save(settings);
    return NotificationSettingsResponse.from(savedSettings);
  }

  @Override
  @Transactional(readOnly = false)
  public NotificationSettingsResponse updateSettings(
      Long userId, NotificationSettingsRequest request) {
    NotificationSettings settings =
        notificationSettingsRepository
            .findByUserId(userId)
            .orElseThrow(
                () ->
                    new BusinessException(
                        "알림 설정을 찾을 수 없습니다.", 404, "NOTIFICATION_SETTINGS_NOT_FOUND"));

    settings.setEmailNotifications(request.emailNotifications());
    settings.setPushNotifications(request.pushNotifications());
    settings.setNotificationStartTime(request.notificationStartTime());
    settings.setNotificationEndTime(request.notificationEndTime());
    settings.setWeekendNotifications(request.weekendNotifications());
    settings.setMinDiscountPercent(request.minDiscountPercent());
    settings.setMaxDailyNotifications(request.maxDailyNotifications());

    NotificationSettings updatedSettings = notificationSettingsRepository.save(settings);
    return NotificationSettingsResponse.from(updatedSettings);
  }

  @Override
  @Transactional(readOnly = false)
  public void deleteSettings(Long userId) {
    if (!notificationSettingsRepository.existsByUserId(userId)) {
      throw new BusinessException("알림 설정을 찾을 수 없습니다.", 404, "NOTIFICATION_SETTINGS_NOT_FOUND");
    }
    notificationSettingsRepository.deleteByUserId(userId);
  }
}
