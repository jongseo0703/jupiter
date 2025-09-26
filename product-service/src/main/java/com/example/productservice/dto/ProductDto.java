package com.example.productservice.dto;

import lombok.Data;

import java.util.List;

/**
 * 상품 DTO 클래스
 * <ul>
 *     <li>productId : 상품 아이디</li>
 *     <li>productName : 상품명</li>
 *     <li>description : 상품 설명</li>
 *     <li>alcoholPercentage : 도수</li>
 *     <li>volume : 용량</li>
 *     <li>url : 이미지</li>
 *     <li>subCategoryDto : 참조한 하위 카테고리</li>
 *     <li>priceDtoList : 가격목록</li>
 *     <li>reviewDtoList : 리뷰 목록</li>
 * </ul>
 */
@Data
public class ProductDto {
    private int productId;
    private String productName;
    private String description;
    private double alcoholPercentage;
    private int volume;
    private String url;
    private SubCategoryDto subCategoryDto;
    List<PriceDto> priceDtoList;
    List<ReviewDto> reviewDtoList;
}
