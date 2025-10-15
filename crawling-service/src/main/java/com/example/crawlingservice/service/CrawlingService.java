package com.example.crawlingservice.service;

import com.example.crawlingservice.dto.ProductDTO;
import com.example.crawlingservice.service.danawa.DanawaCrawlingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * 다나와 크롤링 메인 서비스
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class CrawlingService {
    private final DanawaCrawlingService danawaCrawlingService;

    /**
     * 다나와 크롤링 실행
     * @return 크롤링된 상품 리스트
     */
    public List<ProductDTO> crawlAllShops() {
        log.info("========== 다나와 크롤링 시작 ==========");

        try {
            // 다나와 크롤링 실행
            List<ProductDTO> products = danawaCrawlingService.crawlDanawa();

            log.info("========== 다나와 크롤링 완료: 총 {}개 상품 ==========", products.size());

            return products;

        } catch (Exception e) {
            log.error("크롤링 서비스 오류: {}", e.getMessage(), e);
            return List.of();
        }
    }

}
