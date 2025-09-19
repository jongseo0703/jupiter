package com.example.authservice.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** 회원가입 요청을 처리하는 RegisterRequest */
public record RegisterRequest(
    // username은 3자에서 50자까지 요구됨.
    @NotBlank(message = "Username is required")
        @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
        String username,
    // email이 비어있으면 메시지
    @Email(message = "Email should be valid") @NotBlank(message = "Email is required") String email,
    // password는 최소 8자 이상이어야 함.
    @NotBlank(message = "Password is required")
        @Size(min = 8, message = "Password must be at least 8 characters long")
        String password,
    // phone number는 최소 8자 이상이어야 함.
    @NotBlank(message = "Phone number is required")
        @Size(min = 8, message = "Phone number must be at least 8 characters long")
        String phone) {
  public RegisterRequest {
    // username에 공백이 있으면
    if (username != null && username.trim().isEmpty()) {
      throw new IllegalArgumentException("Username cannot be blank");
    }
    // email에 공백이 있으면
    if (email != null && email.trim().isEmpty()) {
      throw new IllegalArgumentException("Email cannot be blank");
    }
    // password에 공백이 있으면
    if (password != null && password.trim().isEmpty()) {
      throw new IllegalArgumentException("Password cannot be blank");
    }
    // phone에 공백이 있으면
    if (phone != null && phone.trim().isEmpty()) {
      throw new IllegalArgumentException("Phone cannot be blank");
    }
  }
}
