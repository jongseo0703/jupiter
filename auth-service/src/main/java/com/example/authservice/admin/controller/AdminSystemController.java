package com.example.authservice.admin.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.authservice.admin.dto.SystemStatusResponse;
import com.example.authservice.admin.service.SystemMonitoringService;
import com.example.authservice.global.common.ApiResponse;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/v1/admin/system")
@RequiredArgsConstructor
@Tag(name = "Admin System", description = "관리자 시스템 모니터링 API")
@SecurityRequirement(name = "bearerAuth")
public class AdminSystemController {

  private final SystemMonitoringService systemMonitoringService;

  @Operation(summary = "시스템 상태 조회", description = "시스템의 전반적인 상태와 기본 메트릭스를 조회합니다")
  @GetMapping("/status")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<ApiResponse<SystemStatusResponse>> getSystemStatus() {
    log.info("시스템 상태 조회 요청");

    try {
      SystemStatusResponse status = systemMonitoringService.getSystemStatus();
      return ResponseEntity.ok(ApiResponse.success("시스템 상태 조회 성공", status));

    } catch (Exception e) {
      log.error("시스템 상태 조회 중 오류 발생", e);
      return ResponseEntity.internalServerError().body(ApiResponse.error("시스템 상태 조회에 실패했습니다"));
    }
  }

  @Operation(summary = "상세 메트릭스 조회", description = "시스템의 상세한 메트릭스 정보를 조회합니다")
  @GetMapping("/metrics")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<ApiResponse<Map<String, Object>>> getDetailedMetrics() {
    log.info("상세 메트릭스 조회 요청");

    try {
      Map<String, Object> metrics = systemMonitoringService.getDetailedMetrics();
      return ResponseEntity.ok(ApiResponse.success("메트릭스 조회 성공", metrics));

    } catch (Exception e) {
      log.error("상세 메트릭스 조회 중 오류 발생", e);
      return ResponseEntity.internalServerError().body(ApiResponse.error("메트릭스 조회에 실패했습니다"));
    }
  }

  @Operation(summary = "헬스체크", description = "시스템 헬스체크를 수행합니다")
  @GetMapping("/health")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<ApiResponse<String>> healthCheck() {
    log.info("관리자 헬스체크 요청");

    try {
      SystemStatusResponse status = systemMonitoringService.getSystemStatus();
      String healthStatus = status.status();

      if ("UP".equals(healthStatus)) {
        return ResponseEntity.ok(ApiResponse.success("헬스체크 성공", "시스템이 정상적으로 작동 중입니다"));
      } else {
        return ResponseEntity.ok(ApiResponse.success("헬스체크 완료", "시스템에 문제가 있습니다: " + healthStatus));
      }

    } catch (Exception e) {
      log.error("헬스체크 중 오류 발생", e);
      return ResponseEntity.internalServerError().body(ApiResponse.error("헬스체크에 실패했습니다"));
    }
  }
}
