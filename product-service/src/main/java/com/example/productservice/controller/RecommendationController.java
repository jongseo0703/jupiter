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
     * GET /api/recommendations/comprehensive/{userId}
     */
    @GetMapping("/comprehensive/{userId}")
    public ResponseEntity<RecommendationResponseDTO> getComprehensiveRecommendations(
            @PathVariable Long userId) {
        Map<String, List<ProductDto>> recommendations = recommendationService.getComprehensiveRecommendations(userId);
        return ResponseEntity.ok(new RecommendationResponseDTO(
                recommendations,
                "Comprehensive recommendations generated successfully"
        ));
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
