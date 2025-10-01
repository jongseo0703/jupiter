package com.example.authservice.preference.entity;

import java.util.List;

import jakarta.persistence.*;

import com.example.authservice.global.common.BaseEntity;
import com.example.authservice.user.entity.User;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.*;

/** 사용자 주류 선호도 엔티티 */
@Entity
@Table(name = "user_preferences")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserPreference extends BaseEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @OneToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", nullable = false, unique = true)
  private User user;

  // 선호하는 주류 카테고리 (JSON 배열로 저장: ["소주", "맥주", "와인"])
  @Column(name = "preferred_categories", columnDefinition = "JSON")
  private String preferredCategories;

  // 선호하는 가격대 (LOW, MEDIUM, HIGH)
  @Enumerated(EnumType.STRING)
  @Column(name = "price_range")
  private PriceRange priceRange;

  // 선호하는 도수 (LOW: ~15%, MEDIUM: 15-30%, HIGH: 30%+)
  @Enumerated(EnumType.STRING)
  @Column(name = "alcohol_strength")
  private AlcoholStrength alcoholStrength;

  // 설문 완료 여부
  @Builder.Default
  @Column(name = "survey_completed", nullable = false)
  private boolean surveyCompleted = false;

  public enum PriceRange {
    LOW, // ~20,000원
    MEDIUM, // 20,000~50,000원
    HIGH // 50,000원+
  }

  public enum AlcoholStrength {
    LOW, // ~15%
    MEDIUM, // 15-30%
    HIGH // 30%+
  }

  // JSON 변환 헬퍼 메서드
  private static final ObjectMapper objectMapper = new ObjectMapper();

  public List<String> getPreferredCategoriesList() {
    if (preferredCategories == null || preferredCategories.isEmpty()) {
      return List.of();
    }
    try {
      return objectMapper.readValue(preferredCategories, new TypeReference<List<String>>() {});
    } catch (JsonProcessingException e) {
      return List.of();
    }
  }

  public void setPreferredCategoriesList(List<String> categories) {
    if (categories == null || categories.isEmpty()) {
      this.preferredCategories = null;
      return;
    }
    try {
      this.preferredCategories = objectMapper.writeValueAsString(categories);
    } catch (JsonProcessingException e) {
      this.preferredCategories = null;
    }
  }
}
