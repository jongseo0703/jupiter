package com.example.authservice.admin.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "admin_notifications")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EntityListeners(AuditingEntityListener.class)
public class AdminNotification {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, length = 200)
  private String title;

  @Column(nullable = false, columnDefinition = "TEXT")
  private String message;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private AdminNotificationType type;

  @Column(name = "related_entity_id")
  private Long relatedEntityId;

  @Column(name = "is_read", nullable = false)
  private boolean isRead = false;

  @Column(name = "is_important", nullable = false)
  private boolean isImportant = false;

  @CreatedDate
  @Column(name = "created_at", nullable = false, updatable = false)
  private LocalDateTime createdAt;

  @Builder
  public AdminNotification(
      String title,
      String message,
      AdminNotificationType type,
      Long relatedEntityId,
      boolean isImportant) {
    this.title = title;
    this.message = message;
    this.type = type;
    this.relatedEntityId = relatedEntityId;
    this.isImportant = isImportant;
    this.isRead = false;
  }

  public void setRead(boolean read) {
    this.isRead = read;
  }

  public enum AdminNotificationType {
    USER_REGISTRATION,
    USER_INQUIRY,
    SYSTEM_ERROR,
    PRODUCT_UPDATE,
    SECURITY_ALERT
  }
}
