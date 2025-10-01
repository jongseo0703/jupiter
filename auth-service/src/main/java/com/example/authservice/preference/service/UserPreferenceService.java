package com.example.authservice.preference.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.authservice.global.exception.BusinessException;
import com.example.authservice.preference.dto.UserPreferenceRequest;
import com.example.authservice.preference.dto.UserPreferenceResponse;
import com.example.authservice.preference.entity.UserPreference;
import com.example.authservice.preference.repository.UserPreferenceRepository;
import com.example.authservice.user.entity.User;
import com.example.authservice.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserPreferenceService {

  private final UserPreferenceRepository preferenceRepository;
  private final UserRepository userRepository;

  @Transactional
  public UserPreferenceResponse savePreference(Long userId, UserPreferenceRequest request) {
    User user =
        userRepository
            .findById(userId)
            .orElseThrow(() -> new BusinessException("User not found", 404, "USER_NOT_FOUND"));

    // 기존 선호도가 있으면 업데이트, 없으면 생성
    UserPreference preference =
        preferenceRepository
            .findByUserId(userId)
            .orElse(UserPreference.builder().user(user).build());

    preference.setPreferredCategoriesList(request.preferredCategories());
    preference.setPriceRange(request.priceRange());
    preference.setAlcoholStrength(request.alcoholStrength());
    preference.setSurveyCompleted(true);

    UserPreference saved = preferenceRepository.save(preference);
    log.info("User preference saved for user: {}", userId);

    return UserPreferenceResponse.from(saved);
  }

  @Transactional
  public void skipSurvey(Long userId) {
    User user =
        userRepository
            .findById(userId)
            .orElseThrow(() -> new BusinessException("User not found", 404, "USER_NOT_FOUND"));

    // 건너뛰기 시 기본값으로 설정
    UserPreference preference =
        preferenceRepository
            .findByUserId(userId)
            .orElse(UserPreference.builder().user(user).build());

    preference.setSurveyCompleted(false); // 설문 미완료로 표시
    preferenceRepository.save(preference);
    log.info("User {} skipped preference survey", userId);
  }

  @Transactional(readOnly = true)
  public UserPreferenceResponse getPreference(Long userId) {
    UserPreference preference =
        preferenceRepository
            .findByUserId(userId)
            .orElseThrow(
                () -> new BusinessException("Preference not found", 404, "PREFERENCE_NOT_FOUND"));

    return UserPreferenceResponse.from(preference);
  }

  @Transactional(readOnly = true)
  public boolean hasCompletedSurvey(Long userId) {
    return preferenceRepository
        .findByUserId(userId)
        .map(UserPreference::isSurveyCompleted)
        .orElse(false);
  }
}
