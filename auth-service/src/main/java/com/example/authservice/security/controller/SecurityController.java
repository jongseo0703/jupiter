package com.example.authservice.security.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.example.authservice.global.common.ApiResponse;
import com.example.authservice.security.entity.LoginHistory;
import com.example.authservice.security.entity.SuspiciousActivity;
import com.example.authservice.security.service.SuspiciousActivityService;
import com.example.authservice.user.entity.User;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/v1/security")
@RequiredArgsConstructor
public class SecurityController {

  private final SuspiciousActivityService suspiciousActivityService;

  @GetMapping("/suspicious-activities")
  public ResponseEntity<ApiResponse<List<SuspiciousActivity>>> getSuspiciousActivities(
      @AuthenticationPrincipal User user) {
    List<SuspiciousActivity> activities = suspiciousActivityService.getSuspiciousActivities(user);
    return ResponseEntity.ok(ApiResponse.success("Suspicious activities retrieved", activities));
  }

  @GetMapping("/login-history")
  public ResponseEntity<ApiResponse<List<LoginHistory>>> getLoginHistory(
      @AuthenticationPrincipal User user) {
    List<LoginHistory> history = suspiciousActivityService.getLoginHistory(user);
    return ResponseEntity.ok(ApiResponse.success("Login history retrieved", history));
  }
}
