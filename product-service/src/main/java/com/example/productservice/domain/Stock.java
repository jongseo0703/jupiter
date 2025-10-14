package com.example.productservice.domain;

import jakarta.persistence.*;
import lombok.Data;

/**
 * 재고 엔티티 클래스
 * <ul>
 *     <li>stockId : 재고 고유 아이디</li>
 *     <li>isAvailable : 재고 존재 여부
 *     <br>품절일 경우 false</li>
 *     <li>product : 상품 참조</li>
 * </ul>
 */
@Data
@Entity
@Table(name = "stock")
public class Stock {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int stockId;

    private boolean isAvailable;

    @OneToOne
    @JoinColumn(name = "product_id")
    private Product product;
}
