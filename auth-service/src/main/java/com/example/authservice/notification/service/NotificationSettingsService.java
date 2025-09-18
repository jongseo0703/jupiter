package com.example.authservice.notification.service;

import com.example.authservice.notification.dto.NotificationSettingsRequest;
import com.example.authservice.notification.dto.NotificationSettingsResponse;

public interface NotificationSettingsService {

  NotificationSettingsResponse getSettings(Long userId);

  NotificationSettingsResponse createSettings(Long userId, NotificationSettingsRequest request);

  NotificationSettingsResponse updateSettings(Long userId, NotificationSettingsRequest request);

  void deleteSettings(Long userId);
}
