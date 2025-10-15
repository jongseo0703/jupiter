package com.example.productservice.service;

import com.example.productservice.domain.*;
import com.example.productservice.dto.ProductDto;
import com.example.productservice.dto.SubCategoryDto;
import com.example.productservice.dto.TopCategoryDto;
import com.example.productservice.dto.PriceDto;
import com.example.productservice.dto.ShopDto;
import com.example.productservice.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

/**
 * 사용자 추천 알고리즘 서비스
 * <p>
 * 점수 부여 기준:
 * - CLICK (상품 상세 페이지 조회): 3점
 * - FAVORITE (즐겨찾기): 5점
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class RecommendationService {

    private final UserActivityRepository userActivityRepository;
    private final UserProductScoreRepository userProductScoreRepository;
    private final ProductRepository productRepository;
    private final PriceRepository priceRepository;

    // 점수 가중치
    private static final double CLICK_SCORE = 3.0;
    private static final double FAVORITE_SCORE = 5.0;

    /**
     * 사용자 행동 기록
     */
    @Transactional
    public void recordUserActivity(Long userId, Integer productId, UserActivity.ActivityType activityType) {
        // 행동 기록 저장
        UserActivity activity = new UserActivity();
        activity.setUserId(userId);
        activity.setProductId(productId);
        activity.setActivityType(activityType);
        userActivityRepository.save(activity);

        // 점수 업데이트
        updateUserProductScore(userId, productId, activityType);

        log.info("User {} performed {} on product {}", userId, activityType, productId);
    }

    /**
     * 사용자-상품 점수 업데이트
     */
    @Transactional
    public void updateUserProductScore(Long userId, Integer productId, UserActivity.ActivityType activityType) {
        double scoreIncrement = getScoreByActivityType(activityType);

        UserProductScore userScore = userProductScoreRepository
                .findByUserIdAndProductId(userId, productId)
                .orElse(new UserProductScore());

        userScore.setUserId(userId);
        userScore.setProductId(productId);
        userScore.setScore(userScore.getScore() == null ? scoreIncrement : userScore.getScore() + scoreIncrement);

        userProductScoreRepository.save(userScore);
    }

    /**
     * 행동 타입별 점수 반환
     */
    private double getScoreByActivityType(UserActivity.ActivityType activityType) {
        return switch (activityType) {
            case CLICK -> CLICK_SCORE;
            case FAVORITE -> FAVORITE_SCORE;
        };
    }

    /**
     * 사용자별 상품 점수 일괄 계산 (기존 행동 데이터 기반)
     */
    @Transactional
    public void calculateAllUserProductScores(Long userId) {
        List<UserActivity> activities = userActivityRepository.findByUserId(userId);

        // 상품별로 그룹화하여 점수 계산
        Map<Integer, Double> productScores = new HashMap<>();

        for (UserActivity activity : activities) {
            double score = getScoreByActivityType(activity.getActivityType());
            productScores.merge(activity.getProductId(), score, Double::sum);
        }

        // UserProductScore 업데이트
        for (Map.Entry<Integer, Double> entry : productScores.entrySet()) {
            UserProductScore userScore = userProductScoreRepository
                    .findByUserIdAndProductId(userId, entry.getKey())
                    .orElse(new UserProductScore());

            userScore.setUserId(userId);
            userScore.setProductId(entry.getKey());
            userScore.setScore(entry.getValue());

            userProductScoreRepository.save(userScore);
        }

        log.info("Calculated scores for user {} on {} products", userId, productScores.size());
    }

    /**
     * Product 엔티티를 ProductDto로 변환
     */
    private ProductDto convertToDto(Product product) {
        if (product == null) {
            return null;
        }

        ProductDto dto = new ProductDto();
        dto.setProductId(product.getProductId());
        dto.setProductName(product.getProductName());
        dto.setBrand(product.getBrand());
        dto.setDescription(product.getDescription());
        dto.setAlcoholPercentage(product.getAlcoholPercentage());
        dto.setVolume(product.getVolume());
        dto.setUrl(product.getUrl());

        // SubCategory 변환
        if (product.getSubCategory() != null) {
            SubCategoryDto subCategoryDto = new SubCategoryDto();
            subCategoryDto.setSubCategoryId(product.getSubCategory().getSubcategoryId());
            subCategoryDto.setSubName(product.getSubCategory().getSubName());

            // TopCategory 변환
            if (product.getSubCategory().getTopCategory() != null) {
                TopCategoryDto topCategoryDto = new TopCategoryDto();
                topCategoryDto.setTopCategoryId(product.getSubCategory().getTopCategory().getTopcategoryId());
                topCategoryDto.setTopName(product.getSubCategory().getTopCategory().getTopName());
                subCategoryDto.setTopCategoryDto(topCategoryDto);
            }

            dto.setSubCategoryDto(subCategoryDto);
        }

        // Price 정보 추가
        try {
            List<Object[]> priceList = priceRepository.findByProductId(product.getProductId());
            List<PriceDto> priceDtoList = new ArrayList<>();
            for (Object[] price : priceList) {
                if (price != null && price.length >= 6) {
                    PriceDto priceDto = new PriceDto();
                    priceDto.setPriceId((Integer) price[0]);
                    priceDto.setPrice((Integer) price[1]);
                    priceDto.setDeliveryFee(price[2] != null ? (Integer) price[2] : 0);
                    priceDto.setLink(price[3] != null ? price[3].toString() : "");

                    ShopDto shopDto = new ShopDto();
                    shopDto.setShopName(price[4] != null ? (String) price[4] : "알 수 없음");
                    shopDto.setLogoIcon(price[5] != null ? (String) price[5] : "");
                    priceDto.setShopDto(shopDto);

                    priceDtoList.add(priceDto);
                }
            }
            dto.setPriceDtoList(priceDtoList);
        } catch (Exception e) {
            log.error("Failed to load price info for product {}: {}", product.getProductId(), e.getMessage());
            dto.setPriceDtoList(new ArrayList<>());
        }

        return dto;
    }

    /**
     * 사용자 맞춤 추천 상품 조회 (점수 기반)
     */
    public List<ProductDto> getRecommendedProducts(Long userId, int limit) {
        List<UserProductScore> topScores = userProductScoreRepository.findTopProductsByUserId(userId);

        return topScores.stream()
                .limit(limit)
                .map(score -> productRepository.findById(score.getProductId()).orElse(null))
                .filter(Objects::nonNull)
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * 카테고리 기반 추천 (사용자가 좋아하는 카테고리의 다른 상품 추천)
     */
    public List<ProductDto> getRecommendedProductsByCategory(Long userId, int limit) {
        // 사용자가 높은 점수를 준 상품들의 카테고리 파악
        List<UserProductScore> userScores = userProductScoreRepository.findTopProductsByUserId(userId);

        if (userScores.isEmpty()) {
            return Collections.emptyList();
        }

        // 상위 점수 상품의 서브카테고리 추출
        Set<Integer> preferredSubcategoryIds = userScores.stream()
                .limit(3)
                .map(score -> productRepository.findById(score.getProductId()).orElse(null))
                .filter(Objects::nonNull)
                .map(product -> product.getSubCategory().getSubcategoryId())
                .collect(Collectors.toSet());

        // 상위 3개 상품만 제외 (나머지는 추천 가능)
        Set<Integer> topScoredProductIds = userScores.stream()
                .limit(3)
                .map(UserProductScore::getProductId)
                .collect(Collectors.toSet());

        return productRepository.findAll().stream()
                .filter(product -> preferredSubcategoryIds.contains(product.getSubCategory().getSubcategoryId()))
                .filter(product -> !topScoredProductIds.contains(product.getProductId()))
                .limit(limit)
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * 종합 추천 (점수 기반 + 카테고리 기반)
     */
    public Map<String, List<ProductDto>> getComprehensiveRecommendations(Long userId) {
        Map<String, List<ProductDto>> recommendations = new HashMap<>();

        // 1. 사용자 행동 기반 추천 (점수가 높은 상품) - 5개
        recommendations.put("userBased", getRecommendedProducts(userId, 5));

        // 2. 카테고리 기반 추천 - 10개
        recommendations.put("categoryBased", getRecommendedProductsByCategory(userId, 10));

        return recommendations;
    }

    /**
     * 사용자의 전체 점수 조회
     */
    public List<UserProductScore> getUserAllScores(Long userId) {
        return userProductScoreRepository.findTopProductsByUserId(userId);
    }

    /**
     * 인기상품 추천 (비로그인 사용자용)
     * 전체 상품 중 상위 N개 반환 (productId 순)
     */
    @Transactional(readOnly = true)
    public List<ProductDto> getPopularProducts(int limit) {
        return productRepository.findAll().stream()
                .limit(limit)
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * 설문기반 추천 (신규회원용 - 복수 카테고리 지원)
     * 사용자가 선호하는 카테고리들의 상품 추천
     * @param subcategoryIds - 쉼표로 구분된 서브카테고리 ID 목록 (예: "1,3,5")
     * @param limit - 반환할 최대 상품 수
     */
    public List<ProductDto> getSurveyBasedRecommendations(String subcategoryIds, int limit) {
        if (subcategoryIds == null || subcategoryIds.isEmpty()) {
            // 서브카테고리가 없으면 전체 인기 상품 반환
            return getPopularProducts(limit);
        }

        // 쉼표로 구분된 문자열을 Integer Set으로 변환
        Set<Integer> categoryIdSet = Arrays.stream(subcategoryIds.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .map(Integer::parseInt)
                .collect(Collectors.toSet());

        if (categoryIdSet.isEmpty()) {
            return getPopularProducts(limit);
        }

        // 선택된 서브카테고리들의 상품 반환
        return productRepository.findAll().stream()
                .filter(product -> product.getSubCategory() != null
                        && categoryIdSet.contains(product.getSubCategory().getSubcategoryId()))
                .limit(limit)
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
}
