package com.example.authservice.preference.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.authservice.preference.entity.UserPreference;

@Repository
public interface UserPreferenceRepository extends JpaRepository<UserPreference, Long> {

  Optional<UserPreference> findByUserId(Long userId);

  boolean existsByUserId(Long userId);
}
