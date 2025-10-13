package com.example.crawlingservice.service;

import com.example.crawlingservice.config.WebDriverPool;
import com.example.crawlingservice.dto.PriceDTO;
import com.example.crawlingservice.dto.ProductDTO;
import com.example.crawlingservice.dto.ReviewDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.openqa.selenium.WebDriver;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 여러 쇼핑몰을 크롤링하는 메인 서비스
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class CrawlingService {
    private final List<ShopCrawlingService> shopCrawlers;
    private final WebDriverPool driverPool;

    /**
     * 모든 쇼핑몰 크롤링 및 통합
     * @return 전체 쇼핑몰의 상품 리스트 (중복 제거 및 통합)
     */
    public List<ProductDTO> crawlAllShops() {
        Map<String, ProductDTO> productMap = new HashMap<>();
        WebDriver driver = null;

        try {
            // WebDriver 대여
            driver = driverPool.borrowDriver();

            // 각 쇼핑몰 크롤러 실행
            for (ShopCrawlingService crawler : shopCrawlers) {
                try {
                    log.info("========== 쇼핑몰 크롤링 시작 ==========");

                    // 쇼핑몰 크롤링
                    List<ProductDTO> shopProducts = crawler.getProducts(driver);

                    // 상품 통합
                    for (ProductDTO newProduct : shopProducts) {
                        mergeProduct(productMap, newProduct);
                    }

                    log.info("========== 쇼핑몰 크롤링 완료: {}개 상품 ==========", shopProducts.size());

                } catch (Exception e) {
                    log.error("쇼핑몰 크롤링 실패: {}", e.getMessage(), e);
                    // 한 쇼핑몰 실패해도 다음 쇼핑몰 계속 진행
                }
            }

            List<ProductDTO> allProducts = new ArrayList<>(productMap.values());
            log.info("========== 전체 크롤링 완료: 총 {}개 상품 (중복 제거 후) ==========", allProducts.size());

            return allProducts;

        } catch (Exception e) {
            log.error("크롤링 서비스 오류: {}", e.getMessage(), e);
        } finally {
            // WebDriver 반납
            if (driver != null) {
                driverPool.returnDriver(driver);
            }
        }

        return new ArrayList<>();
    }

    /**
     * 상품 통합 로직
     * - 같은 상품명이면 가격 및 리뷰 목록 추가
     * - 다른 상품명이면 새로 추가
     * - null 값은 null이 아닌 값으로 교체
     * @param productMap 기존 상품 맵
     * @param newProduct 새로 크롤링한 상품
     */
    private void mergeProduct(Map<String, ProductDTO> productMap, ProductDTO newProduct) {
        if (newProduct == null || newProduct.getProductName() == null) {
            return;
        }

        String productName = newProduct.getProductName().trim();

        if (productMap.containsKey(productName)) {
            // 같은 상품명인 경우: 기존 상품에 가격 및 리뷰 추가, null 값 업데이트
            ProductDTO existingProduct = productMap.get(productName);

            // 가격 정보 추가
            if (newProduct.getPrices() != null && !newProduct.getPrices().isEmpty()) {
                for (PriceDTO newPrice : newProduct.getPrices()) {
                    existingProduct.getPrices().add(newPrice);
                }
            }

            // 리뷰 정보 추가
            if (newProduct.getReviews() != null && !newProduct.getReviews().isEmpty()) {
                for (ReviewDTO newReview : newProduct.getReviews()) {
                    existingProduct.getReviews().add(newReview);
                }
            }

            // null 값 업데이트
            updateNullFields(existingProduct, newProduct);

            log.debug("상품 통합: {} (가격 {}개, 리뷰 {}개)",
                    productName,
                    existingProduct.getPrices().size(),
                    existingProduct.getReviews().size());

        } else {
            // 다른 상품명인 경우: 새로운 상품으로 추가
            productMap.put(productName, newProduct);
            log.debug("새 상품 추가: {}", productName);
        }
    }

    /**
     * 기존 상품의 null 필드를 새 상품의 non-null 값으로 업데이트
     * @param existing 기존 상품
     * @param newProduct 새로운 상품
     */
    private void updateNullFields(ProductDTO existing, ProductDTO newProduct) {
        //브랜드
        if (existing.getBrand() == null && newProduct.getBrand() != null) {
            existing.setBrand(newProduct.getBrand());
        }
        //상위 카테고리
        if (existing.getCategory() == null && newProduct.getCategory() != null) {
            existing.setCategory(newProduct.getCategory());
        }
        //하위 카테고리
        if (existing.getProductKind() == null && newProduct.getProductKind() != null) {
            existing.setProductKind(newProduct.getProductKind());
        }
        //상품 이미지
        if (existing.getImageUrl() == null && newProduct.getImageUrl() != null) {
            existing.setImageUrl(newProduct.getImageUrl());
        }
        //상품 정보
        if (existing.getContent() == null && newProduct.getContent() != null) {
            existing.setContent(newProduct.getContent());
        }
        //도수
        if (existing.getAlcohol() == 0 && newProduct.getAlcohol() != 0) {
            existing.setAlcohol(newProduct.getAlcohol());
        }
        //용량
        if (existing.getVolume() == 0 && newProduct.getVolume() != 0) {
            existing.setVolume(newProduct.getVolume());
        }
    }
}
