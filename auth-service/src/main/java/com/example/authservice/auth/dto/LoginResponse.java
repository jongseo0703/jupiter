package com.example.authservice.auth.dto;

/** 로그인 응답을 하는 LoginResponse accessToken, refreshToken, tokenType을 반환함. */
public record LoginResponse(String accessToken, String refreshToken, String tokenType) {
  public static LoginResponse of(String accessToken, String refreshToken) {
    // 로그인 성공 시, tokenType은 항상 Bearer로 고정
    return new LoginResponse(accessToken, refreshToken, "Bearer");
  }
}
