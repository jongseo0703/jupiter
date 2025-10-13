package com.example.productservice.config;

import com.example.productservice.domain.UserActivity;
import com.example.productservice.repository.UserActivityRepository;
import com.example.productservice.service.RecommendationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * 애플리케이션 시작 시 초기 데이터 처리
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements ApplicationRunner {

    private final UserActivityRepository userActivityRepository;
    private final RecommendationService recommendationService;

    @Override
    public void run(ApplicationArguments args) {
        log.info("Starting initial score calculation...");

        // user_activity 테이블에 있는 모든 고유 사용자 ID 추출
        List<Long> userIds = userActivityRepository.findAll().stream()
                .map(UserActivity::getUserId)
                .distinct()
                .toList();

        log.info("Found {} users with activity data", userIds.size());

        // 각 사용자별로 점수 계산
        for (Long userId : userIds) {
            try {
                recommendationService.calculateAllUserProductScores(userId);
                log.info("Score calculation completed for user {}", userId);
            } catch (Exception e) {
                log.error("Failed to calculate scores for user {}: {}", userId, e.getMessage());
            }
        }

        log.info("Initial score calculation completed for {} users", userIds.size());
    }
}
