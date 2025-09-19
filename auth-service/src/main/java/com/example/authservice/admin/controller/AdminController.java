package com.example.authservice.admin.controller;

import jakarta.validation.Valid;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.example.authservice.admin.dto.AdminNotificationResponse;
import com.example.authservice.admin.service.AdminNotificationService;
import com.example.authservice.admin.service.AdminService;
import com.example.authservice.global.common.ApiResponse;
import com.example.authservice.global.common.PageResponse;
import com.example.authservice.user.dto.UserResponse;
import com.example.authservice.user.dto.UserUpdateRequest;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/** 관리자의 로직을 매핑하는 컨트롤러임. */
@Slf4j
@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@Tag(name = "Admin Management", description = "Admin management APIs")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

  private final AdminService adminService;
  private final AdminNotificationService adminNotificationService;

  // 모든 유저를 가져오기 위한 매핑
  @GetMapping("/users")
  @Operation(summary = "Get all users", description = "Get all users with pagination")
  public ResponseEntity<ApiResponse<PageResponse<UserResponse>>> getAllUsers(
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "10") int size,
      @RequestParam(defaultValue = "id") String sortBy,
      @RequestParam(defaultValue = "asc") String sortDir) {
    try {
      log.info("Admin: Getting all users - page: {}, size: {}", page, size);

      Sort sort =
          sortDir.equalsIgnoreCase("desc")
              ? Sort.by(sortBy).descending()
              : Sort.by(sortBy).ascending();
      Pageable pageable = PageRequest.of(page, size, sort);

      PageResponse<UserResponse> users = adminService.getAllUsers(pageable);
      return ResponseEntity.ok(ApiResponse.success("Users retrieved successfully", users));
    } catch (Exception ex) {
      log.error("Admin: Failed to get all users: ", ex);
      throw ex;
    }
  }

  // 해당 유저 한 명에대한 정보를 가져오기 위한 매핑
  @GetMapping("/users/{id}")
  @Operation(summary = "Get user by ID", description = "Get a specific user by their ID")
  public ResponseEntity<ApiResponse<UserResponse>> getUserById(@PathVariable Long id) {
    try {
      log.info("Admin: Getting user by ID: {}", id);
      UserResponse user = adminService.getUserById(id);
      return ResponseEntity.ok(ApiResponse.success("User retrieved successfully", user));
    } catch (Exception ex) {
      log.error("Admin: Failed to get user by ID: ", ex);
      throw ex;
    }
  }

  // 해당 유저 한 명을 바꾸기 위한 매핑
  @PutMapping("/users/{id}")
  @Operation(summary = "Update user", description = "Update a user's information")
  public ResponseEntity<ApiResponse<UserResponse>> updateUser(
      @PathVariable Long id, @Valid @RequestBody UserUpdateRequest request) {
    try {
      log.info("Admin: Updating user ID: {}", id);
      UserResponse user = adminService.updateUser(id, request);
      return ResponseEntity.ok(ApiResponse.success("User updated successfully", user));
    } catch (Exception ex) {
      log.error("Admin: Failed to update user: ", ex);
      throw ex;
    }
  }

  // 해당 유저 한 명을 삭제하기 위한 매핑
  @DeleteMapping("/users/{id}")
  @Operation(summary = "Delete user", description = "Delete a user account")
  public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long id) {
    try {
      log.info("Admin: Deleting user ID: {}", id);
      adminService.deleteUser(id);
      return ResponseEntity.ok(ApiResponse.success("User deleted successfully", null));
    } catch (Exception ex) {
      log.error("Admin: Failed to delete user: ", ex);
      throw ex;
    }
  }

  // 관리자 알림 조회
  @GetMapping("/notifications")
  @Operation(
      summary = "Get admin notifications",
      description = "Get all admin notifications with pagination")
  public ResponseEntity<ApiResponse<PageResponse<AdminNotificationResponse>>> getNotifications(
      @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) {
    try {
      log.info("Admin: Getting notifications - page: {}, size: {}", page, size);

      Sort sort = Sort.by("createdAt").descending();
      Pageable pageable = PageRequest.of(page, size, sort);

      var notifications = adminNotificationService.getAllNotifications(pageable);

      PageResponse<AdminNotificationResponse> pageResponse =
          PageResponse.of(
              notifications.getContent(),
              notifications.getNumber(),
              notifications.getSize(),
              notifications.getTotalElements());

      return ResponseEntity.ok(
          ApiResponse.success("Notifications retrieved successfully", pageResponse));
    } catch (Exception ex) {
      log.error("Admin: Failed to get notifications: ", ex);
      throw ex;
    }
  }

  // 읽지 않은 알림 수 조회
  @GetMapping("/notifications/unread-count")
  @Operation(
      summary = "Get unread notification count",
      description = "Get count of unread admin notifications")
  public ResponseEntity<ApiResponse<Long>> getUnreadNotificationCount() {
    try {
      long count = adminNotificationService.getUnreadCount();
      return ResponseEntity.ok(ApiResponse.success("Unread count retrieved successfully", count));
    } catch (Exception ex) {
      log.error("Admin: Failed to get unread notification count: ", ex);
      throw ex;
    }
  }

  // 알림 읽음 처리
  @PutMapping("/notifications/{id}/read")
  @Operation(
      summary = "Mark notification as read",
      description = "Mark a specific notification as read")
  public ResponseEntity<ApiResponse<AdminNotificationResponse>> markNotificationAsRead(
      @PathVariable Long id) {
    try {
      log.info("Admin: Marking notification as read: {}", id);
      AdminNotificationResponse notification = adminNotificationService.markAsRead(id);
      return ResponseEntity.ok(ApiResponse.success("Notification marked as read", notification));
    } catch (Exception ex) {
      log.error("Admin: Failed to mark notification as read: ", ex);
      throw ex;
    }
  }

  // 모든 알림 읽음 처리
  @PutMapping("/notifications/read-all")
  @Operation(
      summary = "Mark all notifications as read",
      description = "Mark all notifications as read")
  public ResponseEntity<ApiResponse<Void>> markAllNotificationsAsRead() {
    try {
      log.info("Admin: Marking all notifications as read");
      adminNotificationService.markAllAsRead();
      return ResponseEntity.ok(ApiResponse.success("All notifications marked as read", null));
    } catch (Exception ex) {
      log.error("Admin: Failed to mark all notifications as read: ", ex);
      throw ex;
    }
  }

  // 알림 삭제
  @DeleteMapping("/notifications/{id}")
  @Operation(summary = "Delete notification", description = "Delete a specific notification")
  public ResponseEntity<ApiResponse<Void>> deleteNotification(@PathVariable Long id) {
    try {
      log.info("Admin: Deleting notification: {}", id);
      adminNotificationService.deleteNotification(id);
      return ResponseEntity.ok(ApiResponse.success("Notification deleted successfully", null));
    } catch (Exception ex) {
      log.error("Admin: Failed to delete notification: ", ex);
      throw ex;
    }
  }
}
