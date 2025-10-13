package com.example.authservice.notification.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.authservice.notification.entity.NotificationSettings;

@Repository
public interface NotificationSettingsRepository extends JpaRepository<NotificationSettings, Long> {

  Optional<NotificationSettings> findByUserId(Long userId);

  boolean existsByUserId(Long userId);

  void deleteByUserId(Long userId);

  List<NotificationSettings> findByPushNotificationsTrue();
}
