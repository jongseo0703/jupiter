package com.example.authservice.preference.dto;

import java.util.List;

import jakarta.validation.constraints.NotNull;

import com.example.authservice.preference.entity.UserPreference;

public record UserPreferenceRequest(
    @NotNull(message = "선호 카테고리를 선택해주세요") List<String> preferredCategories,
    @NotNull(message = "가격대를 선택해주세요") UserPreference.PriceRange priceRange,
    @NotNull(message = "선호 도수를 선택해주세요") UserPreference.AlcoholStrength alcoholStrength) {}
