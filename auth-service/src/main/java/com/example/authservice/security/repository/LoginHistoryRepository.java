package com.example.authservice.security.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.authservice.security.entity.LoginHistory;
import com.example.authservice.user.entity.User;

@Repository
public interface LoginHistoryRepository extends JpaRepository<LoginHistory, Long> {

  List<LoginHistory> findByUserOrderByLoginTimeDesc(User user);

  @Query(
      "SELECT COUNT(l) FROM LoginHistory l WHERE l.user = :user AND l.successful = false AND l.loginTime >= :since")
  long countFailedLoginsSince(@Param("user") User user, @Param("since") LocalDateTime since);

  @Query(
      "SELECT DISTINCT l.ipAddress FROM LoginHistory l WHERE l.user = :user AND l.successful = true")
  List<String> findDistinctSuccessfulIpsByUser(@Param("user") User user);

  @Query(
      "SELECT DISTINCT l.userAgent FROM LoginHistory l WHERE l.user = :user AND l.successful = true")
  List<String> findDistinctSuccessfulUserAgentsByUser(@Param("user") User user);

  Optional<LoginHistory> findFirstByUserAndSuccessfulTrueOrderByLoginTimeDesc(User user);

  void deleteByUser(User user);
}
