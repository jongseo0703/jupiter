package com.example.productservice.dto;

import lombok.Data;

/**
 * <ul> 상위 카테고리 DTO 클래스
 *     <li>topCategoryId : 아이디</li>
 *     <li>topName : 카테고리명</li>
 * </ul>
 */
@Data
public class TopCategoryDto {
    private int topCategoryId;
    private String topName;
}
