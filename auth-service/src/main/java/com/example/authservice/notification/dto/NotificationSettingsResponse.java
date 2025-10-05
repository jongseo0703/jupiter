package com.example.authservice.notification.dto;

import java.time.LocalTime;

import com.example.authservice.notification.entity.NotificationSettings;

public record NotificationSettingsResponse(
    Long id,
    Boolean emailNotifications,
    Boolean pushNotifications,
    LocalTime notificationStartTime,
    LocalTime notificationEndTime,
    Boolean weekendNotifications,
    Integer minDiscountPercent,
    Integer maxDailyNotifications,
    UserDto user) {
  public static NotificationSettingsResponse from(NotificationSettings settings) {
    return new NotificationSettingsResponse(
        settings.getId(),
        settings.getEmailNotifications(),
        settings.getPushNotifications(),
        settings.getNotificationStartTime(),
        settings.getNotificationEndTime(),
        settings.getWeekendNotifications(),
        settings.getMinDiscountPercent(),
        settings.getMaxDailyNotifications(),
        new UserDto(settings.getUser().getId(), settings.getUser().getPhone()));
  }

  public record UserDto(Long id, String phone) {}
}
