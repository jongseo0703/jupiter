package com.example.authservice.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;

public record UserUpdateRequest(
    @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
        String username,
    @Email(message = "Email should be valid") String email,
    @Size(min = 8, message = "Password must be at least 8 characters long") String password) {
  public UserUpdateRequest {
    if (username != null && username.trim().isEmpty()) {
      throw new IllegalArgumentException("Username cannot be empty");
    }
    if (email != null && email.trim().isEmpty()) {
      throw new IllegalArgumentException("Email cannot be empty");
    }
    if (password != null && password.trim().isEmpty()) {
      throw new IllegalArgumentException("Password cannot be empty");
    }
  }
}
