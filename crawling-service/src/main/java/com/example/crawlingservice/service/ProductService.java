package com.example.crawlingservice.service;

import com.example.crawlingservice.db.*;
import com.example.crawlingservice.domain.Product;
import com.example.crawlingservice.domain.SubCategory;
import com.example.crawlingservice.dto.ProductDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 상품 정보 저장하는 클래스
 */
@Service
@Transactional
@Slf4j
@RequiredArgsConstructor
public class ProductService {
    private final ProductMapper productMapper;

    /**
     *  상품정보 저장하는 메서드
     * @param productDTO 상품 정보
     * @param subCategory 참조할 하위 카테고리
     * @return 상품 정보
     */
    public Product saveProduct(ProductDTO productDTO, SubCategory subCategory) {
        // 중복 상품 체크 (상품명 + 브랜드)
        Product existing = productMapper.selectByProductName(
                productDTO.getProductName(), productDTO.getBrand());
        if (existing != null) {
            log.debug("🔄 기존 상품 발견: {} (ID: {})", existing.getProductName(), existing.getProductId());
            return existing;
        }

        // 새 상품 객체 생성 및 데이터 매핑
        Product product = new Product();
        product.setProductName(productDTO.getProductName());
        product.setDescription(productDTO.getContent());
        product.setBrand(productDTO.getBrand());
        product.setAlcoholPercentage(productDTO.getAlcohol());
        product.setUrl(productDTO.getImageUrl());
        product.setVolume(productDTO.getVolume());
        product.setSubCategory(subCategory);

        productMapper.insert(product);
        log.debug("🆕 새 상품 생성: {} (ID: {})", product.getProductName(), product.getProductId());

        return product;
    }

}
