package com.example.authservice.user.dto;

public record SecuritySettingsRequest(
    Boolean twoFactorEnabled, Boolean suspiciousActivityAlerts, Integer passwordChangePeriodDays) {}
