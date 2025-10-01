package com.example.authservice.preference.dto;

import java.util.List;

import com.example.authservice.preference.entity.UserPreference;

public record UserPreferenceResponse(
    Long id,
    Long userId,
    List<String> preferredCategories,
    UserPreference.PriceRange priceRange,
    UserPreference.AlcoholStrength alcoholStrength,
    boolean surveyCompleted) {

  public static UserPreferenceResponse from(UserPreference preference) {
    return new UserPreferenceResponse(
        preference.getId(),
        preference.getUser().getId(),
        preference.getPreferredCategoriesList(),
        preference.getPriceRange(),
        preference.getAlcoholStrength(),
        preference.isSurveyCompleted());
  }
}
