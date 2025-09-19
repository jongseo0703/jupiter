package com.example.authservice.auth.controller;

import java.util.Map;

import jakarta.servlet.http.HttpServletResponse;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import com.example.authservice.auth.dto.LoginResponse;
import com.example.authservice.auth.oauth.service.OAuthService;
import com.example.authservice.global.common.ApiResponse;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Tag(name = "OAuth Authentication", description = "OAuth social login APIs")
@RestController
@RequestMapping("/api/v1/auth/oauth")
@RequiredArgsConstructor
public class OAuthController {

  private final OAuthService oAuthService;

  // provider로 naver, google, kakao중 선택해서 연동하는 매핑
  @Operation(
      summary = "OAuth login redirect",
      description = "Redirect to OAuth provider for authentication")
  @GetMapping("/login/{provider}")
  public void oauthLogin(
      @Parameter(description = "OAuth provider (google, naver, kakao)", example = "google")
          @PathVariable
          String provider,
      HttpServletResponse response)
      throws Exception {

    log.info("Redirecting to OAuth provider: {}", provider);

    // Spring Security가 자동으로 OAuth 제공자로 리다이렉트
    String redirectUrl = "/oauth2/authorization/" + provider.toLowerCase();
    response.sendRedirect(redirectUrl);
  }

  @Operation(
      summary = "OAuth callback",
      description = "Handle OAuth callback and generate JWT tokens")
  @GetMapping("/callback/{provider}")
  public ResponseEntity<ApiResponse<LoginResponse>> oauthCallback(
      @Parameter(description = "OAuth provider (google, naver, kakao)", example = "google")
          @PathVariable
          String provider,
      @AuthenticationPrincipal OAuth2User oAuth2User,
      @RequestParam(required = false) String error) {

    if (error != null) {
      log.error("OAuth login error: {}", error);
      return ResponseEntity.badRequest().body(ApiResponse.error("OAuth login failed: " + error));
    }

    if (oAuth2User == null) {
      log.error("OAuth user is null");
      return ResponseEntity.badRequest().body(ApiResponse.error("OAuth authentication failed"));
    }

    try {
      LoginResponse loginResponse = oAuthService.processOAuthLogin(oAuth2User, provider);
      log.info("OAuth login successful for provider: {}", provider);

      return ResponseEntity.ok(ApiResponse.success("OAuth login successful", loginResponse));

    } catch (Exception e) {
      log.error("OAuth login processing failed: ", e);
      return ResponseEntity.internalServerError()
          .body(ApiResponse.error("OAuth login processing failed"));
    }
  }

  @Operation(summary = "Get OAuth user info", description = "Get current OAuth user information")
  @GetMapping("/me")
  public ResponseEntity<ApiResponse<Object>> getCurrentOAuthUser(
      @AuthenticationPrincipal OAuth2User oAuth2User) {

    if (oAuth2User == null) {
      return ResponseEntity.badRequest().body(ApiResponse.error("Not authenticated with OAuth"));
    }

    return ResponseEntity.ok(ApiResponse.success("OAuth user info", oAuth2User.getAttributes()));
  }

  @Operation(
      summary = "OAuth success handler",
      description = "Handle OAuth success and determine provider")
  @GetMapping("/success")
  public ResponseEntity<ApiResponse<LoginResponse>> oauthSuccess(
      @AuthenticationPrincipal OAuth2User oAuth2User) {

    if (oAuth2User == null) {
      return ResponseEntity.badRequest().body(ApiResponse.error("OAuth authentication failed"));
    }

    try {
      // OAuth 제공자 자동 감지
      String provider = detectProvider(oAuth2User);
      LoginResponse loginResponse = oAuthService.processOAuthLogin(oAuth2User, provider);

      log.info("OAuth success for provider: {}", provider);
      return ResponseEntity.ok(ApiResponse.success("OAuth login successful", loginResponse));

    } catch (Exception e) {
      log.error("OAuth success processing failed: ", e);
      return ResponseEntity.internalServerError()
          .body(ApiResponse.error("OAuth login processing failed"));
    }
  }

  @Operation(summary = "OAuth failure handler", description = "Handle OAuth failure")
  @GetMapping("/failure")
  public ResponseEntity<ApiResponse<String>> oauthFailure(
      @RequestParam(required = false) String error) {

    log.error("OAuth login failed: {}", error);
    return ResponseEntity.badRequest().body(ApiResponse.error("OAuth login failed: " + error));
  }

  private String detectProvider(OAuth2User oAuth2User) {
    Map<String, Object> attributes = oAuth2User.getAttributes();

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
