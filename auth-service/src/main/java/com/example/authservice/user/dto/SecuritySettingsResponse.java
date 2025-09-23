package com.example.authservice.user.dto;

import java.time.LocalDateTime;

import com.example.authservice.user.entity.SecuritySettings;

public record SecuritySettingsResponse(
    Boolean twoFactorEnabled,
    Boolean suspiciousActivityAlerts,
    Integer passwordChangePeriodDays,
    LocalDateTime lastPasswordChange,
    Boolean isPasswordChangeRequired,
    Long daysUntilPasswordChange) {
  public static SecuritySettingsResponse from(SecuritySettings settings) {
    return new SecuritySettingsResponse(
        settings.getTwoFactorEnabled(),
        settings.getSuspiciousActivityAlerts(),
        settings.getPasswordChangePeriodDays(),
        settings.getLastPasswordChange(),
        settings.isPasswordChangeRequired(),
        settings.getDaysUntilPasswordChange());
  }
}
