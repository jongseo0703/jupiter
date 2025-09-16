package com.example.authservice.user.service;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;

import com.example.authservice.global.exception.BusinessException;
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

          if (request.password() != null) {
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
}
