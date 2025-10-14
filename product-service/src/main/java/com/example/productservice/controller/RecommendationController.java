package com.example.productservice.controller;

import com.example.productservice.domain.UserActivity;
import com.example.productservice.domain.UserProductScore;
import com.example.productservice.dto.ProductDto;
import com.example.productservice.dto.RecommendationResponseDTO;
import com.example.productservice.service.RecommendationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 추천 시스템 RESTful API 컨트롤러
 */
@RestController
@RequestMapping("/api/recommendations")
@RequiredArgsConstructor
public class RecommendationController {

    private final RecommendationService recommendationService;

    /**
     * 기본 추천 조회 (비로그인 사용자용 - 인기 상품 또는 설문 기반 추천)
     * GET /api/recommendations
     * @param subcategoryIds - 쉼표로 구분된 서브카테고리 ID 목록 (예: "1,3,5")
     */
    @GetMapping
    public ResponseEntity<RecommendationResponseDTO> getRecommendations(
            @RequestParam(required = false) String subcategoryIds) {

        List<ProductDto> products;
        String message;

        if (subcategoryIds != null && !subcategoryIds.isEmpty()) {
            // 설문 기반 추천 (복수 카테고리)
            products = recommendationService.getSurveyBasedRecommendations(subcategoryIds, 10);
            message = "Survey-based recommendations retrieved successfully";
        } else {
            // 인기 상품 추천
            products = recommendationService.getPopularProducts(10);
            message = "Popular products retrieved successfully";
        }

        Map<String, List<ProductDto>> recommendations = new HashMap<>();
        recommendations.put("products", products);

        return ResponseEntity.ok(new RecommendationResponseDTO(recommendations, message));
    }

    /**
     * 개인 맞춤 추천 조회 (로그인 사용자용)
     * Gateway에서 JWT를 검증하고 X-User-Id 헤더로 userId 전달
     * GET /api/recommendations/personalized
     */
    @GetMapping("/personalized")
    public ResponseEntity<RecommendationResponseDTO> getPersonalizedRecommendations(
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader) {

        // X-User-Id 헤더가 없으면 401 응답
        if (userIdHeader == null) {
            return ResponseEntity.status(401).build();
        }

        try {
            Long userId = Long.parseLong(userIdHeader);
            Map<String, List<ProductDto>> recommendations = recommendationService.getComprehensiveRecommendations(userId);
            return ResponseEntity.ok(new RecommendationResponseDTO(
                    recommendations,
                    "Personalized recommendations generated successfully"
            ));
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * 사용자 활동 기록 (상품 클릭, 즐겨찾기 등)
     * POST /api/recommendations/activities
     * Gateway에서 JWT를 검증하고 X-User-Id 헤더로 userId 전달
     */
    @PostMapping("/activities")
    public ResponseEntity<Map<String, String>> recordActivity(
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader,
            @RequestBody Map<String, Object> activityData) {

        // X-User-Id 헤더가 없으면 401 응답
        if (userIdHeader == null) {
            return ResponseEntity.status(401).build();
        }

        try {
            Long userId = Long.parseLong(userIdHeader);
            Integer productId = Integer.parseInt(activityData.get("productId").toString());
            String activityTypeStr = activityData.get("activityType").toString();

            UserActivity.ActivityType activityType = UserActivity.ActivityType.valueOf(activityTypeStr);

            recommendationService.recordUserActivity(userId, productId, activityType);

            return ResponseEntity.ok(Map.of(
                    "message", "Activity recorded successfully",
                    "userId", userId.toString(),
                    "productId", productId.toString(),
                    "activityType", activityTypeStr
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Invalid request: " + e.getMessage()
            ));
        }
    }

    /**
     * 사용자 추천 점수 계산 (개발/디버깅용)
     * POST /api/recommendations/users/{userId}/scores
     */
    @PostMapping("/users/{userId}/scores")
    public ResponseEntity<Map<String, String>> calculateUserScores(@PathVariable Long userId) {
        recommendationService.calculateAllUserProductScores(userId);
        return ResponseEntity.ok(Map.of(
                "message", "Scores calculated successfully",
                "userId", userId.toString()
        ));
    }

    /**
     * 사용자 추천 점수 조회 (개발/디버깅용)
     * GET /api/recommendations/users/{userId}/scores
     */
    @GetMapping("/users/{userId}/scores")
    public ResponseEntity<Map<String, Object>> getUserScores(@PathVariable Long userId) {
        List<UserProductScore> scores = recommendationService.getUserAllScores(userId);
        return ResponseEntity.ok(Map.of(
                "userId", userId,
                "scores", scores,
                "message", "User scores retrieved successfully"
        ));
    }
}
