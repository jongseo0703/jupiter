package com.example.authservice.auth.dto;

/** 로그인 응답을 하는 LoginResponse accessToken, refreshToken, tokenType을 반환함. */
public record LoginResponse(
    String accessToken,
    String refreshToken,
    String tokenType,
    Boolean passwordChangeRequired,
    Boolean twoFactorRequired,
    String tempToken) {
  public static LoginResponse of(String accessToken, String refreshToken) {
    // 로그인 성공 시, tokenType은 항상 Bearer로 고정, 비밀번호 변경 불필요, 2FA 불필요
    return new LoginResponse(accessToken, refreshToken, "Bearer", false, false, null);
  }

  public static LoginResponse of(
      String accessToken, String refreshToken, Boolean passwordChangeRequired) {
    // 로그인 성공 시, tokenType은 항상 Bearer로 고정, 2FA 불필요
    return new LoginResponse(
        accessToken, refreshToken, "Bearer", passwordChangeRequired, false, null);
  }

  public static LoginResponse requireTwoFactor(String tempToken) {
    // 2FA 필요 시, 임시 토큰만 반환
    return new LoginResponse(null, null, null, false, true, tempToken);
  }
}
