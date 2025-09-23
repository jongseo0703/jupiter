package com.example.authservice.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;

public record UserUpdateRequest(
    @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
        String username,
    @Email(message = "Email should be valid") String email,
    @Size(min = 8, message = "Phone number must be at least 8 characters long") String phone,
    @Size(min = 8, message = "Password must be at least 8 characters long") String password) {
  public UserUpdateRequest {
    if (username != null && username.trim().isEmpty()) {
      throw new IllegalArgumentException("Username cannot be empty");
    }
    if (email != null && email.trim().isEmpty()) {
      throw new IllegalArgumentException("Email cannot be empty");
    }
    if (phone != null && phone.trim().isEmpty()) {
      throw new IllegalArgumentException("Phone cannot be empty");
    }
    if (password != null && password.trim().isEmpty()) {
      throw new IllegalArgumentException("Password cannot be empty");
    }
    // phone 번호에서 하이픈 제거하여 재할당
    phone = phone != null ? phone.replaceAll("-", "") : phone;
  }

  // 하이픈이 제거된 phone 번호를 반환하는 메서드
  public String normalizedPhone() {
    return phone != null ? phone.replaceAll("-", "") : phone;
  }
}
