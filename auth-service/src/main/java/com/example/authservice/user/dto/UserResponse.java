package com.example.authservice.user.dto;

import java.time.LocalDateTime;

import com.example.authservice.user.entity.Role;
import com.example.authservice.user.entity.User;

public record UserResponse(
    Long id,
    String username,
    String email,
    String phone,
    Role role,
    boolean enabled,
    boolean isOAuthUser,
    LocalDateTime createdAt,
    LocalDateTime updatedAt) {
  public static UserResponse from(User user) {
    return new UserResponse(
        user.getId(),
        user.getUsername(),
        user.getEmail(),
        user.getPhone(),
        user.getRole(),
        user.isEnabled(),
        user.isOAuthUser(),
        user.getCreatedAt(),
        user.getUpdatedAt());
  }
}
