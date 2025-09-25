package com.example.authservice.admin.service;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.authservice.global.common.PageResponse;
import com.example.authservice.global.exception.BusinessException;
import com.example.authservice.security.repository.LoginHistoryRepository;
import com.example.authservice.security.repository.SuspiciousActivityRepository;
import com.example.authservice.user.dto.UserResponse;
import com.example.authservice.user.dto.UserUpdateRequest;
import com.example.authservice.user.entity.User;
import com.example.authservice.user.repository.SecuritySettingsRepository;
import com.example.authservice.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/** AdminService를 구현하는 AdminServiceImpl임. 관리자 관련 로직을 담당함. */
@Slf4j
@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

  private final UserRepository userRepository;
  private final SecuritySettingsRepository securitySettingsRepository;
  private final LoginHistoryRepository loginHistoryRepository;
  private final SuspiciousActivityRepository suspiciousActivityRepository;
  private final PasswordEncoder passwordEncoder;

  @Override
  @Transactional(readOnly = true)
  public PageResponse<UserResponse> getAllUsers(Pageable pageable) {
    log.info("Admin: Getting all users");
    Page<User> userPage = userRepository.findAll(pageable);
    List<UserResponse> userResponses =
        userPage.getContent().stream().map(UserResponse::from).toList();

    return PageResponse.of(
        userResponses, userPage.getNumber(), userPage.getSize(), userPage.getTotalElements());
  }

  @Override
  @Transactional(readOnly = true)
  public UserResponse getUserById(Long id) {
    log.info("Admin: Getting user by ID: {}", id);
    User user =
        userRepository
            .findById(id)
            .orElseThrow(() -> new BusinessException("User not found", 404, "USER_NOT_FOUND"));
    return UserResponse.from(user);
  }

  @Override
  @Transactional
  public UserResponse updateUser(Long id, UserUpdateRequest request) {
    log.info("Admin: Updating user ID: {}", id);

    User user =
        userRepository
            .findById(id)
            .orElseThrow(() -> new BusinessException("User not found", 404, "USER_NOT_FOUND"));

    if (request.username() != null && !request.username().equals(user.getUsername())) {
      user.setUsername(request.username());
    }

    if (request.email() != null && !request.email().equals(user.getEmail())) {
      if (userRepository.existsByEmail(request.email())) {
        throw new BusinessException("Email already exists", 409, "DUPLICATE_EMAIL");
      }
      user.setEmail(request.email());
    }

    if (request.password() != null) {
      user.setPassword(passwordEncoder.encode(request.password()));
    }

    User updateUser = userRepository.save(user);
    log.info("Admin: User updated successfully {}", id);

    return UserResponse.from(updateUser);
  }

  @Override
  @Transactional
  public void deleteUser(Long id) {

    log.info("Admin: Deleting User ID: {}", id);

    User user =
        userRepository
            .findById(id)
            .orElseThrow(() -> new BusinessException("User not found", 404, "USER_NOT_FOUND"));

    // 관련 데이터 삭제 (외래키 순서대로)
    log.info("Admin: Deleting related data for user ID: {}", id);

    // 1. 로그인 히스토리 삭제
    loginHistoryRepository.deleteByUser(user);

    // 2. 의심스러운 활동 기록 삭제
    suspiciousActivityRepository.deleteByUser(user);

    // 3. 보안 설정 삭제
    securitySettingsRepository.deleteByUser(user);

    // 4. 사용자 삭제
    userRepository.delete(user);
    log.info("Admin: User and all related data deleted successfully: {}", id);
  }
}
