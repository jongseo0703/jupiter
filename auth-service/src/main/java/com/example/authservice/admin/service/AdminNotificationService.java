package com.example.authservice.admin.service;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.example.authservice.admin.dto.AdminNotificationResponse;

public interface AdminNotificationService {

  void createUserRegistrationNotification(Long userId, String username);

  void createUserInquiryNotification(String subject, String userEmail);

  void createSystemErrorNotification(String errorMessage);

  Page<AdminNotificationResponse> getAllNotifications(Pageable pageable);

  List<AdminNotificationResponse> getUnreadNotifications();

  AdminNotificationResponse markAsRead(Long notificationId);

  void markAllAsRead();

  long getUnreadCount();

  void deleteNotification(Long notificationId);
}
