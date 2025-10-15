package com.example.productservice.domain;

import jakarta.persistence.*;
import lombok.Data;

/**
 * 가격 엔티티 클래스
 * <ul>
 *     <li>priceId : 가격 고유아이디</li>
 *     <li>price : 가격</li>
 *     <li>deliveryFee : 배송비</li>
 *     <li>productShop : 상품_상점 참조</li>
 * </ul>
 */
@Data
@Entity
@Table(name = "price")
public class Price {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int priceId;

    private int price;

    private int deliveryFee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_shop_id")
    private ProductShop productShop;
}
