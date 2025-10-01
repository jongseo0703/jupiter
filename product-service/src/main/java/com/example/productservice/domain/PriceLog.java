package com.example.productservice.domain;

import jakarta.persistence.*;
import lombok.Data;

import java.sql.Timestamp;

/**
 * 가격로그 엔티티 클래스
 * <ul>
 *     <li>priceLogId : 가격로그 고유아이디</li>
 *     <li>newPrice : 가격</li>
 *     <li>createdAt : 생성날짜</li>
 *     <li>price :가격 테이블 참조</li>
 * </ul>
 */
@Data
@Entity
@Table(name = "price_log")
public class PriceLog {
    @Id
    private int priceLogId;

    @Column(name = "price")
    private int newPrice;

    private Timestamp createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "price_id")
    private Price price;
}
