package com.example.productservice.domain;

import jakarta.persistence.*;
import lombok.Data;

/**
 * 상품_상점 엔티티 클래스
 * <ul>
 *     <li>productShopId : 상품_상점 고유 아이디</li>
 *     <li>link : 구매링크</li>
 *     <li>product : 상품 참조</li>
 *     <li>shop : 상점 참조</li>
 * </ul>
 */
@Entity
@Data
@Table(name = "product_shop")
public class ProductShop {
    @Id
    private int productShopId;

    private String link;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shop_id")
    private Shop shop;
}
