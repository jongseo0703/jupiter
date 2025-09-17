package com.example.authservice.auth.controller;

import java.util.Optional;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import com.example.authservice.auth.dto.ForgotPasswordRequest;
import com.example.authservice.auth.dto.ForgotPasswordResponse;
import com.example.authservice.auth.dto.LoginRequest;
import com.example.authservice.auth.dto.LoginResponse;
import com.example.authservice.auth.dto.RegisterRequest;
import com.example.authservice.auth.security.JwtTokenProvider;
import com.example.authservice.auth.service.AuthService;
import com.example.authservice.auth.token.BlacklistTokenService;
import com.example.authservice.auth.token.RefreshToken;
import com.example.authservice.auth.token.RefreshTokenRepository;
import com.example.authservice.auth.token.RefreshTokenService;
import com.example.authservice.global.common.ApiResponse;
import com.example.authservice.global.exception.BusinessException;
import com.example.authservice.user.dto.PasswordChangeRequest;
import com.example.authservice.user.dto.UserResponse;
import com.example.authservice.user.dto.UserUpdateRequest;
import com.example.authservice.user.entity.User;
import com.example.authservice.user.service.UserService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/** 로그인, 회원가입을 매핑하는 컨트롤러임. */
@Slf4j
@Tag(name = "Authentication", description = "User authentication APIs")
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

  private final AuthService authService;
  private final RefreshTokenRepository tokenRepository;
  private final RefreshTokenService tokenService;
  private final BlacklistTokenService blacklistTokenService;
  private final JwtTokenProvider jwtTokenProvider;
  private final UserService userService;

  // 회원가입을 처리하는 매핑임.
  @Operation(summary = "Register user", description = "Register a new user")
  @PostMapping("/register")
  public ResponseEntity<ApiResponse<UserResponse>> register(
      @Valid @RequestBody RegisterRequest request) {
    try {
      UserResponse userResponse = authService.register(request);
      return ResponseEntity.status(HttpStatus.CREATED)
          .body(ApiResponse.success("User registered successfully", userResponse));
    } catch (Exception e) {
      log.error("Registration failed: ", e);
      throw e;
    }
  }

  // 로그인을 처리하는 매핑임.
  @Operation(summary = "Login", description = "User login")
  @PostMapping("/login")
  public ResponseEntity<ApiResponse<LoginResponse>> login(
      @Valid @RequestBody LoginRequest request) {
    try {
      LoginResponse response = authService.login(request);
      return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    } catch (Exception e) {
      log.error("Login failed: ", e);
      throw e;
    }
  }

  @Operation(summary = "Logout", description = "User logout")
  @PostMapping("/logout")
  public ResponseEntity<ApiResponse<Void>> logout(
      @RequestHeader("Authorization") final String accessToken) {

    String token = extractToken(accessToken);

    // 엑세스 토큰으로 현재 Redis 정보 삭제
    tokenService.removeRefreshToken(token);

    // 블랙리스트에 등록
    long ttl = jwtTokenProvider.getRemainingMillis(token) / 1000;
    blacklistTokenService.addToBlacklist(token, ttl);

    return ResponseEntity.ok(ApiResponse.success("logout successful", null));
  }

  @Operation(summary = "Refresh token", description = "Refresh access token")
  @PostMapping("/refresh")
  public ResponseEntity<ApiResponse<LoginResponse>> refresh(
      @RequestHeader("Authorization") final String accessToken) {

    String token = extractToken(accessToken);
    if (token == null) {
      throw new BusinessException("Invalid token", 401, "INVALID_TOKEN");
    }

    // 1. 액세스 토큰으로 Refresh 토큰 객체를 조회
    Optional<RefreshToken> refreshTokenOptional = tokenRepository.findByAccessToken(token);

    if (refreshTokenOptional.isEmpty()) {
      return ResponseEntity.badRequest()
          .body(ApiResponse.error("Invalid or expired refresh token"));
    }

    RefreshToken oldRefreshToken = refreshTokenOptional.get();

    // 2. RefreshToken의 유효성 검증
    if (!jwtTokenProvider.validateToken(oldRefreshToken.getRefreshToken())) {
      tokenRepository.delete(oldRefreshToken); // 만료된 토큰은 삭제
      return ResponseEntity.badRequest()
          .body(ApiResponse.error("Invalid or expired refresh token"));
    }

    // 3. 사용자 정보 조회
    User user = userService.findUserByEmail(oldRefreshToken.getId());

    // 4. 새로운 토큰 생성 (Access, Refresh 둘 다)
    UsernamePasswordAuthenticationToken authentication =
        new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities());

    String newAccessToken = jwtTokenProvider.generateAccessToken(authentication);
    String newRefreshToken = jwtTokenProvider.generateRefreshToken(user.getId());

    // 5. 기존 Refresh Token 삭제 (Rotation)
    tokenRepository.delete(oldRefreshToken);

    // 6. 새로운 Refresh Token 저장
    tokenService.saveTokenInfo(user.getEmail(), newRefreshToken, newAccessToken);

    log.info("Token refreshed and rotated for user: {}", user.getUsername());

    // 7. 새로운 토큰 반환
    return ResponseEntity.ok(
        ApiResponse.success(
            "Token refreshed successfully", LoginResponse.of(newAccessToken, newRefreshToken)));
  }

  @Operation(
      summary = "Get current user",
      description = "Get current authenticated user information")
  @GetMapping("/me")
  public ResponseEntity<ApiResponse<UserResponse>> getCurrentUser() {
    try {
      User currentUser = userService.getCurrentUser();
      UserResponse userResponse = UserResponse.from(currentUser);
      return ResponseEntity.ok(ApiResponse.success("User information retrieved", userResponse));
    } catch (Exception e) {
      log.error("Failed to get current user: ", e);
      throw e;
    }
  }

  @Operation(summary = "비밀번호 찾기", description = "이메일로 임시 비밀번호를 발송합니다")
  @PostMapping("/forgot-password")
  public ResponseEntity<ApiResponse<ForgotPasswordResponse>> forgotPassword(
      @Valid @RequestBody ForgotPasswordRequest request) {
    try {
      ForgotPasswordResponse response = authService.forgotPassword(request);
      return ResponseEntity.ok(ApiResponse.success("임시 비밀번호 발송 완료", response));
    } catch (Exception e) {
      log.error("비밀번호 찾기 실패: ", e);
      throw e;
    }
  }

  @Operation(summary = "프로필 업데이트", description = "현재 사용자의 프로필 정보를 업데이트합니다")
  @PutMapping("/profile")
  public ResponseEntity<ApiResponse<UserResponse>> updateProfile(
      @Valid @RequestBody UserUpdateRequest request) {
    try {
      User currentUser = userService.getCurrentUser();
      UserResponse userResponse = userService.updateCurrentUser(currentUser.getId(), request);
      return ResponseEntity.ok(ApiResponse.success("프로필이 성공적으로 업데이트되었습니다", userResponse));
    } catch (Exception e) {
      log.error("프로필 업데이트 실패: ", e);
      throw e;
    }
  }

  @Operation(summary = "비밀번호 변경", description = "현재 사용자의 비밀번호를 변경합니다")
  @PutMapping("/change-password")
  public ResponseEntity<ApiResponse<UserResponse>> changePassword(
      @Valid @RequestBody PasswordChangeRequest request) {
    try {
      User currentUser = userService.getCurrentUser();
      UserResponse userResponse = userService.changePassword(currentUser.getId(), request);
      return ResponseEntity.ok(ApiResponse.success("비밀번호가 성공적으로 변경되었습니다", userResponse));
    } catch (Exception e) {
      log.error("비밀번호 변경 실패: ", e);
      throw e;
    }
  }

  private String extractToken(String bearerToken) {
    if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
      return bearerToken.substring(7);
    }
    return null;
  }
}
