package com.example.productservice.controller;

import com.example.productservice.domain.UserProductScore;
import com.example.productservice.dto.ProductDto;
import com.example.productservice.dto.RecommendationResponseDTO;
import com.example.productservice.service.RecommendationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 추천 시스템 API 컨트롤러
 */
@RestController
@RequestMapping("/api/recommendations")
@RequiredArgsConstructor
public class RecommendationController {

    private final RecommendationService recommendationService;

    /**
     * 사용자별 점수 일괄 계산 (개발/디버깅용)
     * POST /api/recommendations/calculate/{userId}
     */
    @PostMapping("/calculate/{userId}")
    public ResponseEntity<String> calculateScores(@PathVariable Long userId) {
        recommendationService.calculateAllUserProductScores(userId);
        return ResponseEntity.ok("Scores calculated for user " + userId);
    }

    /**
     * 종합 추천 (점수 기반 + 카테고리 기반)
     * Gateway에서 JWT를 검증하고 X-User-Id 헤더로 userId 전달
     * GET /api/recommendations/comprehensive
     */
    @GetMapping("/comprehensive")
    public ResponseEntity<RecommendationResponseDTO> getComprehensiveRecommendations(
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
                    "Comprehensive recommendations generated successfully"
            ));
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * 사용자의 전체 점수 조회 (개발/디버깅용)
     * GET /api/recommendations/scores/{userId}
     */
    @GetMapping("/scores/{userId}")
    public ResponseEntity<List<UserProductScore>> getUserScores(@PathVariable Long userId) {
        List<UserProductScore> scores = recommendationService.getUserAllScores(userId);
        return ResponseEntity.ok(scores);
    }
}
