package com.example.authservice.admin.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.example.authservice.admin.entity.AdminNotification;

@Repository
public interface AdminNotificationRepository extends JpaRepository<AdminNotification, Long> {

  Page<AdminNotification> findAllByOrderByCreatedAtDesc(Pageable pageable);

  List<AdminNotification> findByIsReadFalseOrderByCreatedAtDesc();

  long countByIsReadFalse();

  @Query("SELECT COUNT(n) FROM AdminNotification n WHERE n.isRead = false AND n.isImportant = true")
  long countUnreadImportantNotifications();

  List<AdminNotification> findTop10ByOrderByCreatedAtDesc();
}
