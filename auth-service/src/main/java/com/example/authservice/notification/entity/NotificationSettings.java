package com.example.authservice.notification.entity;

import java.time.LocalTime;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import com.example.authservice.global.common.BaseEntity;
import com.example.authservice.user.entity.User;

import lombok.*;

@Entity
@Table(name = "notification_settings")
@Getter
@Setter
@ToString(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationSettings extends BaseEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @OneToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", nullable = false, unique = true)
  @NotNull
  private User user;

  @Builder.Default
  @Column(nullable = false)
  private Boolean pushNotifications = true;

  @Builder.Default
  @Column(name = "notification_start_time")
  private LocalTime notificationStartTime = LocalTime.of(9, 0);

  @Builder.Default
  @Column(name = "notification_end_time")
  private LocalTime notificationEndTime = LocalTime.of(21, 0);

  @Builder.Default
  @Column(nullable = false)
  private Boolean weekendNotifications = true;

  @Builder.Default
  @Column(nullable = false)
  @Min(value = 1, message = "최소 할인율은 1% 이상이어야 합니다")
  @Max(value = 50, message = "최소 할인율은 50% 이하여야 합니다")
  private Integer minDiscountPercent = 5;
}
