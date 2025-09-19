package com.example.authservice.auth.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;

import lombok.*;

@Entity
@Table(name = "phone_verifications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PhoneVerification {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false)
  private String phoneNumber;

  @Column(nullable = false)
  private String verificationCode;

  @Column(nullable = false)
  private LocalDateTime createdAt;

  @Column(nullable = false)
  private LocalDateTime expiresAt;

  @Builder.Default
  @Column(nullable = false)
  private boolean verified = false;

  @Builder.Default
  @Column(nullable = false)
  private boolean used = false;

  public boolean isExpired() {
    return LocalDateTime.now().isAfter(expiresAt);
  }

  public void markAsVerified() {
    this.verified = true;
  }

  public void markAsUsed() {
    this.used = true;
  }
}
