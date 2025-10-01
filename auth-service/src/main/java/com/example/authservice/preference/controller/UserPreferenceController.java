package com.example.authservice.preference.controller;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.example.authservice.global.common.ApiResponse;
import com.example.authservice.preference.dto.UserPreferenceRequest;
import com.example.authservice.preference.dto.UserPreferenceResponse;
import com.example.authservice.preference.service.UserPreferenceService;
import com.example.authservice.user.entity.User;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/v1/preferences")
@RequiredArgsConstructor
@Tag(name = "User Preferences", description = "사용자 주류 선호도 관리 API")
@SecurityRequirement(name = "bearerAuth")
public class UserPreferenceController {

  private final UserPreferenceService preferenceService;

  @PostMapping
  @Operation(summary = "선호도 저장", description = "사용자의 주류 선호도를 저장합니다")
  public ResponseEntity<ApiResponse<UserPreferenceResponse>> savePreference(
      @AuthenticationPrincipal User user, @Valid @RequestBody UserPreferenceRequest request) {
    log.info("Saving preference for user: {}", user.getId());
    UserPreferenceResponse response = preferenceService.savePreference(user.getId(), request);
    return ResponseEntity.ok(ApiResponse.success("선호도가 저장되었습니다", response));
  }

  @PostMapping("/skip")
  @Operation(summary = "설문 건너뛰기", description = "선호도 설문을 건너뜁니다")
  public ResponseEntity<ApiResponse<Void>> skipSurvey(@AuthenticationPrincipal User user) {
    log.info("User {} skipping preference survey", user.getId());
    preferenceService.skipSurvey(user.getId());
    return ResponseEntity.ok(ApiResponse.success("설문을 건너뛰었습니다", null));
  }

  @GetMapping
  @Operation(summary = "선호도 조회", description = "사용자의 주류 선호도를 조회합니다")
  public ResponseEntity<ApiResponse<UserPreferenceResponse>> getPreference(
      @AuthenticationPrincipal User user) {
    log.info("Getting preference for user: {}", user.getId());
    UserPreferenceResponse response = preferenceService.getPreference(user.getId());
    return ResponseEntity.ok(ApiResponse.success("선호도 조회 완료", response));
  }

  @GetMapping("/status")
  @Operation(summary = "설문 완료 여부 확인", description = "사용자가 설문을 완료했는지 확인합니다")
  public ResponseEntity<ApiResponse<Boolean>> checkSurveyStatus(
      @AuthenticationPrincipal User user) {
    boolean completed = preferenceService.hasCompletedSurvey(user.getId());
    return ResponseEntity.ok(ApiResponse.success("설문 완료 여부 조회 완료", completed));
  }
}
