package com.example.authservice.notification.controller;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import com.example.authservice.notification.dto.NotificationSettingsRequest;
import com.example.authservice.notification.dto.NotificationSettingsResponse;
import com.example.authservice.notification.service.NotificationSettingsService;
import com.example.authservice.user.entity.User;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/notification-settings")
@RequiredArgsConstructor
@Tag(name = "Notification Settings", description = "알림 설정 관리 API")
public class NotificationSettingsController {

  private final NotificationSettingsService notificationSettingsService;

  @GetMapping
  @Operation(summary = "알림 설정 조회", description = "현재 사용자의 알림 설정을 조회합니다.")
  public ResponseEntity<NotificationSettingsResponse> getSettings() {
    Long userId = getCurrentUserId();
    log.info("🔔 Getting notification settings for user: {}", userId);

    NotificationSettingsResponse response = notificationSettingsService.getSettings(userId);
    return ResponseEntity.ok(response);
  }

  @PostMapping
  @Operation(summary = "알림 설정 생성", description = "새로운 알림 설정을 생성합니다.")
  public ResponseEntity<NotificationSettingsResponse> createSettings(
      @Valid @RequestBody NotificationSettingsRequest request) {
    Long userId = getCurrentUserId();
    log.info("🔔 Creating notification settings for user: {}", userId);

    NotificationSettingsResponse response =
        notificationSettingsService.createSettings(userId, request);
    return ResponseEntity.ok(response);
  }

  @PutMapping
  @Operation(summary = "알림 설정 수정", description = "기존 알림 설정을 수정합니다.")
  public ResponseEntity<NotificationSettingsResponse> updateSettings(
      @Valid @RequestBody NotificationSettingsRequest request) {
    Long userId = getCurrentUserId();
    log.info("🔔 Updating notification settings for user: {}", userId);

    NotificationSettingsResponse response =
        notificationSettingsService.updateSettings(userId, request);
    return ResponseEntity.ok(response);
  }

  @DeleteMapping
  @Operation(summary = "알림 설정 삭제", description = "알림 설정을 삭제합니다.")
  public ResponseEntity<Void> deleteSettings() {
    Long userId = getCurrentUserId();
    log.info("🔔 Deleting notification settings for user: {}", userId);

    notificationSettingsService.deleteSettings(userId);
    return ResponseEntity.noContent().build();
  }

  @GetMapping("/active")
  @Operation(summary = "활성화된 알림 설정 조회", description = "푸시 알림이 활성화된 모든 사용자의 알림 설정을 조회합니다.")
  public ResponseEntity<?> getActiveSettings() {
    log.info("🔔 Getting all active notification settings");
    return ResponseEntity.ok(notificationSettingsService.getActiveSettings());
  }

  private Long getCurrentUserId() {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    if (authentication == null || !(authentication.getPrincipal() instanceof User)) {
      throw new RuntimeException("인증된 사용자를 찾을 수 없습니다.");
    }

    User user = (User) authentication.getPrincipal();
    return user.getId();
  }
}
