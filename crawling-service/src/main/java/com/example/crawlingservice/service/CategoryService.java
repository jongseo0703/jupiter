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
        if(StringUtils.hasText(category) && StringUtils.hasText(productKind)){
            //상품 주종, 종류 전부 존재 할 경우
            topName = category;
            subName = productKind;
        }else if(StringUtils.hasText(category) && !StringUtils.hasText(productKind)){
            //상품 종류 =null일 경우 topName = "기타"로 파싱
            topName = "기타";
            subName = category;
        }else {
            //주종,종류 모두 null일 경우 "기타" 로 파싱
            topName= "기타";
            subName = "기타";
        }

        // 상위 카테고리 접두사 제거
        if (subName.contains("-")) {
            String[] parts = subName.split("-");
            if (parts.length == 2) {
                subName = parts[1].trim();
            }
        }

        // subName이 '레드', '화이트', '로제'인 경우 와인으로 변경
        if ("레드".equals(subName)) {
            subName = "레드와인";
        } else if ("화이트".equals(subName)) {
            subName = "화이트와인";
        } else if ("로제".equals(subName)) {
            subName = "로제와인";
        }

        // subName에 '담금주' 또는 '소주'가 포함되면 topName을 '전통주'로 변경
        if (subName.contains("담금주") || subName.contains("소주")) {
            topName = "전통주";
        }
        //상위 카테고리 저장
        TopCategory topCategory = saveTopCategory(topName);
        //하위 카테고리 저장
        return saveSubCategory(subName,topCategory);
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
            return existing;
        }

        // 없으면 새로 생성
        TopCategory newTopCategory = new TopCategory();
        newTopCategory.setTopName(topName);

        topCategoryMapper.insert(newTopCategory);
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
        SubCategory existing = subCategoryMapper.getSubCategoryByName(subName);
        if (existing != null) {
            return existing;
        }

        // 없으면 새로 생성
        SubCategory newSubCategory = new SubCategory();
        newSubCategory.setSubName(subName);
        newSubCategory.setTopCategory(topCategory);

        subCategoryMapper.insert(newSubCategory);
        return newSubCategory;
    }
}
