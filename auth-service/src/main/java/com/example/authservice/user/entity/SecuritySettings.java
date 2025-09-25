package com.example.authservice.user.entity;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "security_settings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SecuritySettings {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @OneToOne
  @JoinColumn(name = "user_id", nullable = false)
  private User user;

  @Column(name = "two_factor_enabled", nullable = false)
  @Builder.Default
  private Boolean twoFactorEnabled = false;

  @Column(name = "two_factor_secret")
  private String twoFactorSecret;

  @Column(name = "suspicious_activity_alerts", nullable = false)
  @Builder.Default
  private Boolean suspiciousActivityAlerts = true;

  @Column(name = "password_change_period_days", nullable = false)
  @Builder.Default
  private Integer passwordChangePeriodDays = 90;

  @Column(name = "last_password_change", nullable = false)
  private LocalDateTime lastPasswordChange;

  public Boolean isPasswordChangeRequired() {
    // OAuth 사용자는 비밀번호 변경 불필요
    if (user != null && user.isOAuthUser()) {
      return false;
    }

    if (lastPasswordChange == null) {
      return true;
    }
    long daysSinceLastChange = ChronoUnit.DAYS.between(lastPasswordChange, LocalDateTime.now());
    return daysSinceLastChange >= passwordChangePeriodDays;
  }

  public Long getDaysUntilPasswordChange() {
    if (lastPasswordChange == null) {
      return 0L;
    }
    long daysSinceLastChange = ChronoUnit.DAYS.between(lastPasswordChange, LocalDateTime.now());
    return Math.max(0, passwordChangePeriodDays - daysSinceLastChange);
  }
}
