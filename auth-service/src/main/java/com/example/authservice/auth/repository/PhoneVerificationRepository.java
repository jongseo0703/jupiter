package com.example.authservice.auth.repository;

import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.authservice.auth.entity.PhoneVerification;

public interface PhoneVerificationRepository extends JpaRepository<PhoneVerification, Long> {

  Optional<PhoneVerification> findByPhoneNumberAndVerificationCodeAndVerifiedTrueAndUsedFalse(
      String phoneNumber, String verificationCode);

  Optional<PhoneVerification> findTopByPhoneNumberOrderByCreatedAtDesc(String phoneNumber);

  @Modifying
  @Query("DELETE FROM PhoneVerification p WHERE p.expiresAt < :now")
  void deleteExpiredVerifications(@Param("now") LocalDateTime now);

  boolean existsByPhoneNumberAndVerifiedTrueAndUsedFalse(String phoneNumber);
}
