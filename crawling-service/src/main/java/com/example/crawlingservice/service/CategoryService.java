package com.example.crawlingservice.service;

import com.example.crawlingservice.db.SubCategoryMapper;
import com.example.crawlingservice.db.TopCategoryMapper;
import com.example.crawlingservice.domain.SubCategory;
import com.example.crawlingservice.domain.TopCategory;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

/**
 * 상위 및 하위 카테고리 저장하는 서비스
 */
@Service
@Transactional
@Slf4j
@RequiredArgsConstructor
public class CategoryService {
    private final TopCategoryMapper topCategoryMapper;
    private final SubCategoryMapper subCategoryMapper;

    /**
     * 상위 및 하위 카테고리에 데이터를 파싱 후 저장<br>
     * 주종 =null 이면 상위카테고리 ="기타"로 파싱<br>
     * 상품 종류 = null 이면 상위카테고리 ="기타", 하위카테고리 = 주종으로 파싱
     * @param category 주종
     * @param productKind 상품 종류
     * @return 하위 카테고리
     */
    public SubCategory saveCategory(String category, String productKind) {
        //주종이 null일 경우 "기타"로 파싱
        if(!StringUtils.hasText(category)){
            category = "기타";
        }

        String topName;
        String subName;
        //상품 종류 =null일 경우 topName = "기타"로 파싱
        if(StringUtils.hasText(productKind)){
            topName = category;
            subName = productKind;
        }else {
            topName = "기타";
            subName = category;
        }
        //상위 카테고리 저장
        TopCategory topCategory = saveTopCategory(topName);
        //하위 카테고리 저장
        SubCategory subCategory = saveSubCategory(subName,topCategory);

        return subCategory;
    }

    /**
     * 상위 카테고리를 저장하는 메서드<br>
     * 카테고리명이 존재할 경우 무시
     * @param topName 카테고리명
     * @return 상위 카테고리
     */
    public TopCategory saveTopCategory(String topName) {
        // 먼저 기존 카테고리 조회
        TopCategory existing = topCategoryMapper.getTopCategory(topName);
        if (existing != null) {
            log.debug("📁 기존 상위카테고리 사용: {} (ID: {})", topName, existing.getTopCategoryId());
            return existing;
        }

        // 없으면 새로 생성
        TopCategory newTopCategory = new TopCategory();
        newTopCategory.setTopName(topName);

        topCategoryMapper.insert(newTopCategory);
        log.debug("🆕 새 상위카테고리 생성: {} (ID: {})", topName, newTopCategory.getTopCategoryId());

        return newTopCategory;
    }

    /**
     * 하위 카테고리 저장하는 메서드<br>
     * 카테고리명이 존재 할 경우 무시
     * @param subName 카테고리명
     * @param topCategory 참조된 상위 카테고리
     * @return 하위 카테고리
     */
    public SubCategory saveSubCategory(String subName, TopCategory topCategory) {
        // 먼저 기존 카테고리 조회
        SubCategory existing = subCategoryMapper.getSubCategory(subName);
        if (existing != null) {
            log.debug("📂 기존 하위카테고리 사용: {} (ID: {})", subName, existing.getSubCategoryId());
            return existing;
        }

        // 없으면 새로 생성
        SubCategory newSubCategory = new SubCategory();
        newSubCategory.setSubName(subName);
        newSubCategory.setTopCategory(topCategory);

        subCategoryMapper.insert(newSubCategory);
        log.debug("🆕 새 하위카테고리 생성: {} (ID: {})", subName, newSubCategory.getSubCategoryId());

        return newSubCategory;
    }
}
