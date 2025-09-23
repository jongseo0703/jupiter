package com.example.authservice.security.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.authservice.security.entity.SuspiciousActivity;
import com.example.authservice.user.entity.User;

@Repository
public interface SuspiciousActivityRepository extends JpaRepository<SuspiciousActivity, Long> {

  List<SuspiciousActivity> findByUserOrderByDetectedAtDesc(User user);

  @Query(
      "SELECT COUNT(s) FROM SuspiciousActivity s WHERE s.user = :user AND s.detectedAt >= :since")
  long countByUserAndDetectedAtAfter(@Param("user") User user, @Param("since") LocalDateTime since);

  List<SuspiciousActivity> findByUserAndNotifiedFalse(User user);
}
