package com.example.authservice.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record PasswordChangeRequest(
    @NotBlank(message = "Current password is required") String currentPassword,
    @NotBlank(message = "New password is required")
        @Size(min = 8, message = "New password must be at least 8 characters long")
        String newPassword) {
  public PasswordChangeRequest {
    if (currentPassword != null && currentPassword.trim().isEmpty()) {
      throw new IllegalArgumentException("Current password cannot be empty");
    }
    if (newPassword != null && newPassword.trim().isEmpty()) {
      throw new IllegalArgumentException("New password cannot be empty");
    }
  }
}
