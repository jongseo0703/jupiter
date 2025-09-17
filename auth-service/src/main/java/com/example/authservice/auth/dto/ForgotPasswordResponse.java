package com.example.authservice.auth.dto;

public record ForgotPasswordResponse(String message, boolean success) {

  public static ForgotPasswordResponse success(String email) {
    return new ForgotPasswordResponse("임시 비밀번호가 " + email + "로 발송되었습니다.", true);
  }

  public static ForgotPasswordResponse failure(String message) {
    return new ForgotPasswordResponse(message, false);
  }
}
