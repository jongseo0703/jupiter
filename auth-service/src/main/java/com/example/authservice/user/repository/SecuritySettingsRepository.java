package com.example.authservice.user.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.authservice.user.entity.SecuritySettings;
import com.example.authservice.user.entity.User;

@Repository
public interface SecuritySettingsRepository extends JpaRepository<SecuritySettings, Long> {
  Optional<SecuritySettings> findByUser(User user);
}
