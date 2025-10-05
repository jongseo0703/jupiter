package com.example.crawlingservice.service;

import com.example.crawlingservice.dto.ProductDTO;
import org.openqa.selenium.WebDriver;

import java.util.List;

/**
 * 쇼핑몰 크롤링 서비스 인터페이스
 */
public interface ShopCrawlingService {

    /**
     * 쇼핑몰의 상품 목록 크롤링
     * @param driver WebDriver
     * @return 상품 리스트
     */
    List<ProductDTO> getProducts(WebDriver driver);
}
