package com.example.authservice.security.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;

import com.example.authservice.global.common.BaseEntity;
import com.example.authservice.user.entity.User;

import lombok.*;

@Entity
@Table(name = "login_history")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginHistory extends BaseEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", nullable = false)
  private User user;

  @Column(nullable = false)
  private LocalDateTime loginTime;

  @Column(nullable = false)
  @Builder.Default
  private Boolean successful = true;

  @Column(length = 200)
  private String failureReason;
}
