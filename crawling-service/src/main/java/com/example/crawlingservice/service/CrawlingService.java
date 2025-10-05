package com.example.crawlingservice.service;

import com.example.crawlingservice.config.WebDriverPool;
import com.example.crawlingservice.dto.ProductDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.openqa.selenium.WebDriver;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * 여러 쇼핑몰을 크롤링하는 메인 서비스
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class CrawlingService {
    private final List<ShopCrawlingService> shopCrawlers; // Spring이 자동으로 모든 구현체 주입
    private final WebDriverPool driverPool;

    /**
     * 모든 쇼핑몰 크롤링 (현재는 키햐만)
     * @return 전체 쇼핑몰의 상품 리스트
     */
    public List<ProductDTO> crawlAllShops() {
        List<ProductDTO> allProducts = new ArrayList<>();
        WebDriver driver = null;

        try {
            // WebDriver 대여
            driver = driverPool.borrowDriver();

            // 각 쇼핑몰 크롤러 실행
            for (ShopCrawlingService crawler : shopCrawlers) {
                try {
                    log.info("==========쇼핑몰 크롤링 시작 ==========");

                    // 쇼핑몰 크롤링
                    List<ProductDTO> shopProducts = crawler.getProducts(driver);
                    allProducts.addAll(shopProducts);

                    log.info("========== 쇼핑몰 크롤링 완료: {}개 상품 ==========", shopProducts.size());

                } catch (Exception e) {
                    log.error("쇼핑몰 크롤링 실패: {}", e.getMessage(), e);
                    // 한 쇼핑몰 실패해도 다음 쇼핑몰 계속 진행
                }
            }

            log.info("========== 전체 크롤링 완료: 총 {}개 상품 ==========", allProducts.size());

        } catch (Exception e) {
            log.error("크롤링 서비스 오류: {}", e.getMessage(), e);
        } finally {
            // WebDriver 반납
            if (driver != null) {
                driverPool.returnDriver(driver);
            }
        }

        return allProducts;
    }
}
