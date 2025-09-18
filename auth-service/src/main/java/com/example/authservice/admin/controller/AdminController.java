package com.example.authservice.admin.controller;

import jakarta.validation.Valid;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

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
}
