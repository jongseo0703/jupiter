package com.example.productservice.domain;

import jakarta.persistence.*;
import lombok.Data;

/**
 * 사용자별 상품 점수 엔티티 클래스
 * <ul>
 *     <li>id : 고유 아이디</li>
 *     <li>userId : 사용자 아이디</li>
 *     <li>productId : 상품 아이디</li>
 *     <li>score : 누적 점수</li>
 * </ul>
 */
@Data
@Entity
@Table(name = "user_product_score",
       uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "product_id"}))
public class UserProductScore {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "product_id")
    private Integer productId;

    @Column(nullable = false, columnDefinition = "DOUBLE DEFAULT 0.0")
    private Double score = 0.0;
}
