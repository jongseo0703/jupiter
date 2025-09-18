package com.example.authservice.notification.dto;

import java.time.LocalTime;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record NotificationSettingsRequest(
    @NotNull(message = "이메일 알림 설정은 필수입니다")
    Boolean emailNotifications,

    @NotNull(message = "푸시 알림 설정은 필수입니다")
    Boolean pushNotifications,

    LocalTime notificationStartTime,

    LocalTime notificationEndTime,

    @NotNull(message = "주말 알림 설정은 필수입니다")
    Boolean weekendNotifications,

    @NotNull(message = "최소 할인율은 필수입니다")
    @Min(value = 1, message = "최소 할인율은 1% 이상이어야 합니다")
    @Max(value = 50, message = "최소 할인율은 50% 이하여야 합니다")
    Integer minDiscountPercent,

    @NotNull(message = "일일 최대 알림 개수는 필수입니다")
    @Min(value = 1, message = "일일 최대 알림 개수는 1개 이상이어야 합니다")
    @Max(value = 50, message = "일일 최대 알림 개수는 50개 이하여야 합니다")
    Integer maxDailyNotifications
) {}
