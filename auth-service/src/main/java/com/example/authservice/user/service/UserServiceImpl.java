package com.example.authservice.user.service;

import java.util.Objects;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;

import com.example.authservice.auth.service.SmsService;
import com.example.authservice.global.exception.BusinessException;
import com.example.authservice.user.dto.PasswordChangeRequest;
import com.example.authservice.user.dto.UserResponse;
import com.example.authservice.user.dto.UserUpdateRequest;
import com.example.authservice.user.entity.User;
import com.example.authservice.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

  private final UserRepository userRepository;
  private final PasswordEncoder passwordEncoder;
  private final TransactionTemplate transactionTemplate;
  private final SecuritySettingsService securitySettingsService;
  private final SmsService smsService;

  @Override
  @Transactional(readOnly = true)
  public UserResponse getUserById(Long id) {
    User user =
        userRepository
            .findById(id)
            .orElseThrow(() -> new BusinessException("User not found", 404, "USER_NOT_FOUND"));
    return UserResponse.from(user);
  }

  @Override
  public UserResponse updateCurrentUser(Long userId, UserUpdateRequest request) {
    if (userId == null) {
      throw new IllegalArgumentException("User ID cannot be null");
    }
    if (request == null) {
      throw new IllegalArgumentException("Update request cannot be null");
    }

    return transactionTemplate.execute(
        status -> {
          log.info("🎯 Optimized user self-updating profile: User ID: {}", userId);

          User user =
              userRepository
                  .findById(userId)
                  .orElseThrow(
                      () -> new BusinessException("User not found", 404, "USER_NOT_FOUND"));

          if (request.username() != null && !request.username().trim().isEmpty()) {
            user.setUsername(request.username());
          }

          if (request.email() != null && !request.email().trim().isEmpty()) {
            // 이메일 중복 체크
            if (!user.getEmail().equals(request.email())
                && userRepository.findByEmail(request.email()).isPresent()) {
              throw new BusinessException("Email already exists", 400, "EMAIL_ALREADY_EXISTS");
            }
            user.setEmail(request.email());
          }

          if (request.phone() != null && !request.phone().trim().isEmpty()) {
            // 하이픈 제거된 번호로 정규화
            String normalizedPhone = request.normalizedPhone();
            // 기존 휴대폰 번호와 다른 경우에만 인증 확인
            if (!Objects.equals(user.getPhone(), normalizedPhone)) {
              if (!smsService.isPhoneVerified(normalizedPhone)) {
                throw new BusinessException("휴대폰 인증이 완료되지 않았습니다", 400, "PHONE_NOT_VERIFIED");
              }
              user.setPhone(normalizedPhone);
              // 휴대폰 인증 사용 완료 처리
              smsService.markVerificationAsUsed(normalizedPhone);
            }
          }

          if (request.password() != null && !request.password().trim().isEmpty()) {
            user.setPassword(passwordEncoder.encode(request.password()));
          }

          User updatedUser = userRepository.save(user);

          log.info(
              "🎯 Optimized user self-updated profile successfully: User ID: {}",
              updatedUser.getId());

          return UserResponse.from(updatedUser);
        });
  }

  @Override
  @Transactional
  public void deleteCurrentUser(Long userId) {
    log.info("Deleting user: {}", userId);

    User user =
        userRepository
            .findById(userId)
            .orElseThrow(() -> new BusinessException("User not found", 404, "USER_NOT_FOUND"));

    userRepository.delete(user);

    log.info("User deleted successfully: {}", userId);
  }

  @Override
  @Transactional(readOnly = true)
  public UserResponse getUserByEmail(String email) {
    User user =
        userRepository
            .findByEmail(email)
            .orElseThrow(() -> new BusinessException("User not found", 404, "USER_NOT_FOUND"));
    return UserResponse.from(user);
  }

  @Override
  @Transactional(readOnly = true)
  public User findUserByEmail(String email) {
    return userRepository
        .findByEmail(email)
        .orElseThrow(() -> new BusinessException("User not found", 404, "USER_NOT_FOUND"));
  }

  @Override
  @Transactional(readOnly = true)
  public User getCurrentUser() {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

    if (authentication == null || !authentication.isAuthenticated()) {
      throw new BusinessException("User not authenticated", 401, "USER_NOT_AUTHENTICATED");
    }

    Object principal = authentication.getPrincipal();
    if (principal instanceof User) {
      return (User) principal;
    }

    String email = authentication.getName();
    return userRepository
        .findByEmail(email)
        .orElseThrow(() -> new BusinessException("User not found", 404, "USER_NOT_FOUND"));
  }

  @Override
  @Transactional
  public UserResponse changePassword(Long userId, PasswordChangeRequest request) {
    if (userId == null) {
      throw new IllegalArgumentException("User ID cannot be null");
    }
    if (request == null) {
      throw new IllegalArgumentException("Password change request cannot be null");
    }

    return transactionTemplate.execute(
        status -> {
          log.info("🔒 Changing password for user ID: {}", userId);

          User user =
              userRepository
                  .findById(userId)
                  .orElseThrow(
                      () -> new BusinessException("User not found", 404, "USER_NOT_FOUND"));

          // 현재 비밀번호 검증
          if (!passwordEncoder.matches(request.currentPassword(), user.getPassword())) {
            throw new BusinessException(
                "Current password is incorrect", 400, "INVALID_CURRENT_PASSWORD");
          }

          // 새 비밀번호 설정
          user.setPassword(passwordEncoder.encode(request.newPassword()));
          User updatedUser = userRepository.save(user);

          // 보안 설정의 lastPasswordChange 업데이트
          securitySettingsService.updateLastPasswordChange(updatedUser.getId());

          log.info("🔒 Password changed successfully for user ID: {}", updatedUser.getId());

          return UserResponse.from(updatedUser);
        });
  }
}
