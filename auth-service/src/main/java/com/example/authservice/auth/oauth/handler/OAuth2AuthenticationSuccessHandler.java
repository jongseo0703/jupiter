package com.example.authservice.auth.oauth.handler;

import java.io.IOException;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import com.example.authservice.auth.dto.LoginResponse;
import com.example.authservice.auth.oauth.service.OAuthService;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/** OAuth 인증 성공을 처리하는 Handler임. */
@Slf4j
@Component
@RequiredArgsConstructor
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

  private final OAuthService oAuthService;
  private final ObjectMapper objectMapper;

  @Override
  public void onAuthenticationSuccess(
      HttpServletRequest request, HttpServletResponse response, Authentication authentication)
      throws IOException {

    // OAuth2User로 캐스팅하여 인증된 사용자 정보를 가져옴.
    OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

    try {
      // OAuth 제공자 자동 감지
      String provider = detectProvider(oAuth2User);
      log.info("OAuth authentication success for provider: {}", provider);

      // JWT 토큰 생성
      LoginResponse loginResponse = oAuthService.processOAuthLogin(oAuth2User, provider);

      // React 프론트엔드로 리다이렉트 (토큰을 URL 파라미터로 전달)
      String redirectUrl =
          String.format(
              "http://localhost:3000/?access_token=%s&refresh_token=%s",
              loginResponse.accessToken(), loginResponse.refreshToken());
      response.sendRedirect(redirectUrl);

      log.info("OAuth login successful for provider: {}", provider);

    } catch (Exception e) {
      log.error("OAuth authentication processing failed: ", e);
      response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
      response.setContentType("application/json");
      response.setCharacterEncoding("UTF-8");
      response.getWriter().write("{\"error\":\"OAuth login processing failed\"}");
    }
  }

  private String detectProvider(OAuth2User oAuth2User) {
    var attributes = oAuth2User.getAttributes();

    // Google: sub 필드 존재
    if (attributes.containsKey("sub")) {
      return "google";
    }

    // Naver: response 필드 존재
    if (attributes.containsKey("response")) {
      return "naver";
    }

    // Kakao: id 필드와 properties 필드 존재
    if (attributes.containsKey("id") && attributes.containsKey("properties")) {
      return "kakao";
    }

    throw new IllegalArgumentException("Unknown OAuth provider");
  }
}
