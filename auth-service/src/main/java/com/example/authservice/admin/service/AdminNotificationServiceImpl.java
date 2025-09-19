package com.example.authservice.admin.service;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.authservice.admin.dto.AdminNotificationResponse;
import com.example.authservice.admin.entity.AdminNotification;
import com.example.authservice.admin.repository.AdminNotificationRepository;
import com.example.authservice.global.exception.BusinessException;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminNotificationServiceImpl implements AdminNotificationService {

  private final AdminNotificationRepository adminNotificationRepository;

  @Override
  @Transactional
  public void createUserRegistrationNotification(Long userId, String username) {
    AdminNotification notification =
        AdminNotification.builder()
            .title("신규 회원 가입")
            .message(String.format("새로운 사용자 '%s'님이 회원가입했습니다.", username))
            .type(AdminNotification.AdminNotificationType.USER_REGISTRATION)
            .relatedEntityId(userId)
            .isImportant(false)
            .build();

    adminNotificationRepository.save(notification);
    log.info("Created user registration notification for user: {}", username);
  }

  @Override
  @Transactional
  public void createUserInquiryNotification(String subject, String userEmail) {
    AdminNotification notification =
        AdminNotification.builder()
            .title("새로운 문의")
            .message(String.format("'%s'님이 '%s' 제목으로 문의를 남겼습니다.", userEmail, subject))
            .type(AdminNotification.AdminNotificationType.USER_INQUIRY)
            .relatedEntityId(0L) // 문의 ID가 없으므로 0으로 설정
            .isImportant(true)
            .build();

    adminNotificationRepository.save(notification);
    log.info("Created user inquiry notification from: {}", userEmail);
  }

  @Override
  @Transactional
  public void createSystemErrorNotification(String errorMessage) {
    AdminNotification notification =
        AdminNotification.builder()
            .title("시스템 오류 발생")
            .message(errorMessage)
            .type(AdminNotification.AdminNotificationType.SYSTEM_ERROR)
            .relatedEntityId(0L)
            .isImportant(true)
            .build();

    adminNotificationRepository.save(notification);
    log.info("Created system error notification: {}", errorMessage);
  }

  @Override
  @Transactional(readOnly = true)
  public Page<AdminNotificationResponse> getAllNotifications(Pageable pageable) {
    Page<AdminNotification> notifications =
        adminNotificationRepository.findAllByOrderByCreatedAtDesc(pageable);
    return notifications.map(AdminNotificationResponse::from);
  }

  @Override
  @Transactional(readOnly = true)
  public List<AdminNotificationResponse> getUnreadNotifications() {
    List<AdminNotification> notifications =
        adminNotificationRepository.findByIsReadFalseOrderByCreatedAtDesc();
    return notifications.stream().map(AdminNotificationResponse::from).toList();
  }

  @Override
  @Transactional
  public AdminNotificationResponse markAsRead(Long notificationId) {
    AdminNotification notification =
        adminNotificationRepository
            .findById(notificationId)
            .orElseThrow(
                () ->
                    new BusinessException("Notification not found", 404, "NOTIFICATION_NOT_FOUND"));

    notification.setRead(true);
    AdminNotification savedNotification = adminNotificationRepository.save(notification);

    return AdminNotificationResponse.from(savedNotification);
  }

  @Override
  @Transactional
  public void markAllAsRead() {
    List<AdminNotification> unreadNotifications =
        adminNotificationRepository.findByIsReadFalseOrderByCreatedAtDesc();
    unreadNotifications.forEach(notification -> notification.setRead(true));
    adminNotificationRepository.saveAll(unreadNotifications);
  }

  @Override
  @Transactional(readOnly = true)
  public long getUnreadCount() {
    return adminNotificationRepository.countByIsReadFalse();
  }

  @Override
  @Transactional
  public void deleteNotification(Long notificationId) {
    AdminNotification notification =
        adminNotificationRepository
            .findById(notificationId)
            .orElseThrow(
                () ->
                    new BusinessException("Notification not found", 404, "NOTIFICATION_NOT_FOUND"));

    adminNotificationRepository.delete(notification);
  }
}
