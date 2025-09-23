package com.example.authservice.user.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.authservice.global.common.ApiResponse;
import com.example.authservice.user.dto.SecuritySettingsRequest;
import com.example.authservice.user.dto.SecuritySettingsResponse;
import com.example.authservice.user.entity.User;
import com.example.authservice.user.service.SecuritySettingsService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/v1/user/security")
@RequiredArgsConstructor
@Tag(name = "Security Settings", description = "보안 설정 API")
@SecurityRequirement(name = "bearerAuth")
public class SecuritySettingsController {

  private final SecuritySettingsService securitySettingsService;

  @Operation(summary = "보안 설정 조회", description = "사용자의 보안 설정을 조회합니다")
  @GetMapping
  public ResponseEntity<ApiResponse<SecuritySettingsResponse>> getSecuritySettings(
      @AuthenticationPrincipal User userDetails) {
    log.info("보안 설정 조회 요청 - 사용자 ID: {}", userDetails.getId());

    try {
      SecuritySettingsResponse settings =
          securitySettingsService.getSecuritySettings(userDetails.getId());
      return ResponseEntity.ok(ApiResponse.success("보안 설정 조회 성공", settings));

    } catch (Exception e) {
      log.error("보안 설정 조회 중 오류 발생 - 사용자 ID: {}", userDetails.getId(), e);
      return ResponseEntity.internalServerError().body(ApiResponse.error("보안 설정 조회에 실패했습니다"));
    }
  }

  @Operation(summary = "보안 설정 업데이트", description = "사용자의 보안 설정을 업데이트합니다")
  @PutMapping
  public ResponseEntity<ApiResponse<SecuritySettingsResponse>> updateSecuritySettings(
      @AuthenticationPrincipal User userDetails, @RequestBody SecuritySettingsRequest request) {
    log.info("보안 설정 업데이트 요청 - 사용자 ID: {}, 요청: {}", userDetails.getId(), request);

    try {
      SecuritySettingsResponse settings =
          securitySettingsService.updateSecuritySettings(userDetails.getId(), request);
      return ResponseEntity.ok(ApiResponse.success("보안 설정 업데이트 성공", settings));

    } catch (Exception e) {
      log.error("보안 설정 업데이트 중 오류 발생 - 사용자 ID: {}", userDetails.getId(), e);
      return ResponseEntity.internalServerError().body(ApiResponse.error("보안 설정 업데이트에 실패했습니다"));
    }
  }

  @Operation(summary = "2FA 활성화", description = "2단계 인증을 활성화하고 시크릿을 반환합니다")
  @PostMapping("/2fa/enable")
  public ResponseEntity<ApiResponse<String>> enableTwoFactor(
      @AuthenticationPrincipal User userDetails) {
    log.info("2FA 활성화 요청 - 사용자 ID: {}", userDetails.getId());

    try {
      String secret = securitySettingsService.enableTwoFactor(userDetails.getId());
      return ResponseEntity.ok(ApiResponse.success("2FA 활성화 성공", secret));

    } catch (Exception e) {
      log.error("2FA 활성화 중 오류 발생 - 사용자 ID: {}", userDetails.getId(), e);
      return ResponseEntity.internalServerError().body(ApiResponse.error("2FA 활성화에 실패했습니다"));
    }
  }

  @Operation(summary = "2FA 비활성화", description = "2단계 인증을 비활성화합니다")
  @PostMapping("/2fa/disable")
  public ResponseEntity<ApiResponse<Void>> disableTwoFactor(
      @AuthenticationPrincipal User userDetails) {
    log.info("2FA 비활성화 요청 - 사용자 ID: {}", userDetails.getId());

    try {
      securitySettingsService.disableTwoFactor(userDetails.getId());
      return ResponseEntity.ok(ApiResponse.success("2FA 비활성화 성공", null));

    } catch (Exception e) {
      log.error("2FA 비활성화 중 오류 발생 - 사용자 ID: {}", userDetails.getId(), e);
      return ResponseEntity.internalServerError().body(ApiResponse.error("2FA 비활성화에 실패했습니다"));
    }
  }
}
