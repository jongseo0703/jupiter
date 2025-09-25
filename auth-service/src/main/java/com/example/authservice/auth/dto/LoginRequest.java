package com.example.authservice.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/** 로그인 요청을 처리하는 LoginRequest */
public record LoginRequest(
    // email이 비어있으면 메시지
    @NotBlank(message = "Email is required") @Email(message = "Invalid email format") String email,
    // password가 비어있으면 메시지
    @NotBlank(message = "Password is required") String password,
    // reCAPTCHA 응답 토큰
    String recaptchaResponse) {
  public LoginRequest {
    // email에 공백이 존재하면
    if (email != null && email.trim().isEmpty()) {
      throw new IllegalArgumentException("Email cannot be blank");
    }
    // password에 공백이 존재하면
    if (password != null && password.trim().isEmpty()) {
      throw new IllegalArgumentException("Password cannot be blank");
    }
  }
}
