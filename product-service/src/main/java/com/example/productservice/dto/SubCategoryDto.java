package com.example.productservice.dto;

import lombok.Data;
/**
 * 하위 케티고리 DTO
 * <ul>
 *     <li>subCategoryId : 아이디</li>
 *     <li>subName : 카테고리명</li>
 *     <li>topCategoryDto : 참조한 상위 카테고리</li>
 * </ul>
 */
@Data
public class SubCategoryDto {
    private int subCategoryId;
    private String subName;
    private TopCategoryDto topCategoryDto;
}
