package com.example.crawlingservice.util;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * 카테고리 및 상품 종류 정규화 유틸리티
 */
@Component
@Slf4j
public class CategoryParser {

    /**
     * 상품 종류(productKind)를 표준화
     * @param productKind 원본 상품 종류
     * @return 표준화된 상품 종류
     */
    public String normalizeProductKind(String productKind) {
        if (productKind == null || productKind.isEmpty()) {
            return productKind;
        }

        String normalized = productKind;

        // 위스키 - "위스키"만 추출
        if (productKind.contains("위스키")) {
            normalized = "위스키";
        }
        // 리큐르 - "리큐르"만 추출
        else if (productKind.contains("리큐르")) {
            normalized = "리큐르";
        }
        // 소주/증류주 → "소주*증류주"
        else if (productKind.contains("소주") || productKind.contains("증류주")) {
            normalized = "소주•증류주";
        }
        // 청주/약주 → "청*약주"
        else if (productKind.contains("청주") || productKind.contains("약주")) {
            normalized = "청•약주";
        }
        // 막걸리/탁주 → "막걸리"
        else if (productKind.contains("막걸리") || productKind.contains("탁주")) {
            normalized = "막걸리";
        }
        //화이트 와인으로 정의
        else if(productKind.contains("와인")){
            normalized="기타 와인";
        }
        //래드와인-> 레드와인
        else if (productKind.contains("래드 와인")) {
            normalized="레드 와인";
        } else if (productKind.contains("전통주")) {
            normalized="기타 전통주";
        }

        return normalized;
    }

    /**
     * productKind를 기반으로 category를 보정
     * @param category 원본 카테고리
     * @param productKind 상품 종류
     * @return 보정된 카테고리
     */
    public String adjustCategory(String category, String productKind) {
        if (productKind == null || productKind.isEmpty()) {
            return category;
        }

        String adjustedCategory = category;

        // productKind에 따라 category 보정
        if (productKind.contains("브랜디") ||
                productKind.contains("데킬라") ||
                productKind.contains("진") ||
                productKind.contains("보드카") ||
                productKind.contains("리큐르") ||
                productKind.contains("럼")) {
            adjustedCategory = "양주";
        }
        else if (productKind.contains("소주")||
                productKind.contains("전통주")||
                productKind.contains("일반증류주")||
                productKind.contains("약주")) {
            adjustedCategory = "전통주";
        }
        else if (productKind.contains("와인")) {
            adjustedCategory="와인";
        }
        else if(productKind.contains("복분자주")){
            adjustedCategory= "과실주";
        }

        return adjustedCategory;
    }
}
