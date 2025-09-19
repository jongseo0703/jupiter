package com.example.authservice.admin.dto;

import java.time.LocalDateTime;

import com.example.authservice.admin.entity.AdminNotification;

public record AdminNotificationResponse(
    Long id,
    String title,
    String message,
    String type,
    Long relatedEntityId,
    boolean isRead,
    boolean isImportant,
    LocalDateTime createdAt) {

  public static AdminNotificationResponse from(AdminNotification notification) {
    return new AdminNotificationResponse(
        notification.getId(),
        notification.getTitle(),
        notification.getMessage(),
        notification.getType().name(),
        notification.getRelatedEntityId(),
        notification.isRead(),
        notification.isImportant(),
        notification.getCreatedAt());
  }
}
