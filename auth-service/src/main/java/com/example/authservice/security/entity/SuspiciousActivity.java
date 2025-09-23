package com.example.authservice.security.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;

import com.example.authservice.global.common.BaseEntity;
import com.example.authservice.user.entity.User;

import lombok.*;

@Entity
@Table(name = "suspicious_activities")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SuspiciousActivity extends BaseEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", nullable = false)
  private User user;

  @Column(nullable = false)
  @Enumerated(EnumType.STRING)
  private ActivityType activityType;

  @Column(nullable = false, length = 45)
  private String ipAddress;

  @Column(length = 500)
  private String userAgent;

  @Column(length = 100)
  private String location;

  @Column(nullable = false)
  private LocalDateTime detectedAt;

  @Column(nullable = false)
  @Builder.Default
  private Boolean notified = false;

  @Column(length = 1000)
  private String details;

  public enum ActivityType {
    UNUSUAL_IP_LOGIN("새로운 IP에서의 로그인"),
    MULTIPLE_FAILED_ATTEMPTS("연속 로그인 실패"),
    NEW_DEVICE_LOGIN("새로운 기기에서의 로그인");

    private final String description;

    ActivityType(String description) {
      this.description = description;
    }

    public String getDescription() {
      return description;
    }
  }
}
