package com.example.crawlingservice.service;

import com.example.crawlingservice.dto.ProductDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

/**
 * Product-service와 통신하는 클라이언트 서비스
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class ProductServiceClient {

    private final RestTemplate restTemplate;

    @Value("${product-service.url:http://localhost:8085}")
    private String productServiceUrl;

    /**
     * Product-service에 크롤링 데이터를 벌크로 전송
     * @param products 상품 목록
     * @return 성공 여부
     */
    public boolean sendBulkProducts(List<ProductDTO> products) {
        try {
            String url = productServiceUrl + "/api/products/bulk";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<List<ProductDTO>> request = new HttpEntity<>(products, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(url, request, Map.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                log.info("Product-service로 데이터 전송 성공: {}", response.getBody());
                return true;
            } else {
                log.error("Product-service 데이터 전송 실패: {}", response.getStatusCode());
                return false;
            }
        } catch (Exception e) {
            log.error("Product-service 호출 중 오류 발생: {}", e.getMessage());
            return false;
        }
    }
}