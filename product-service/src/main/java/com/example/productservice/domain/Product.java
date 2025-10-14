package com.example.productservice.domain;

import jakarta.persistence.*;
import lombok.Data;

/**
 * 상품 엔티티 클래스
 * <ul>
 *     <li>productId : 상품 고유아이디</li>
 *     <li>productName : 상품명</li>
 *     <li>description : 상품 설명</li>
 *     <li>brand : 브랜드</li>
 *     <li>alcoholPercentage : 도수</li>
 *     <li>volume : ml 기준의 용량</li>
 *     <li>url : 상품 이미지</li>
 *     <li>subCategory : 하위 카테고리 참조</li>
 * </ul>
 */
@Data
@Table(name = "product")
@Entity
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int productId;

    private String productName;

    private String description;

    private String brand;

    private double alcoholPercentage;

    private int volume;

    private String url;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subcategory_id")
    private SubCategory subCategory;

}
