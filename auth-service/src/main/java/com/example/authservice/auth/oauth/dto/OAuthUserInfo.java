package com.example.authservice.auth.oauth.dto;

import lombok.Builder;

/**
 * OAuth 사용자의 정보를 전달하는 DTO
 *
 * @param oauthId
 * @param email
 * @param name
 * @param provider
 */
@Builder
public record OAuthUserInfo(String oauthId, String email, String name, String provider) {

  // 구글에서 가져올 정보
  public static OAuthUserInfo fromGoogle(String oauthId, String email, String name) {
    return OAuthUserInfo.builder()
        .oauthId(oauthId)
        .email(email)
        .name(name)
        .provider("google")
        .build();
  }

  // 네이버에서 가져올 정보
  public static OAuthUserInfo fromNaver(String oauthId, String email, String name) {
    return OAuthUserInfo.builder()
        .oauthId(oauthId)
        .email(email)
        .name(name)
        .provider("naver")
        .build();
  }

  // 카카오에서 가져올 정보
  public static OAuthUserInfo fromKakao(String oauthId, String email, String name) {
    return OAuthUserInfo.builder()
        .oauthId(oauthId)
        .email(email)
        .name(name)
        .provider("kakao")
        .build();
  }
}
