package com.example.notificationservice.dto;

import java.time.LocalTime;

public record NotificationSettingsDto(
    Long id,
    Boolean pushNotifications,
    LocalTime notificationStartTime,
    LocalTime notificationEndTime,
    Boolean weekendNotifications,
    Integer minDiscountPercent,
    UserDto user
) {
    public record UserDto(Long id, String phone) {}
}