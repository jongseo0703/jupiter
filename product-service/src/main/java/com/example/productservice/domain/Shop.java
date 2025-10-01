package com.example.productservice.domain;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

/**
 * 상점 엔티티 클래스
 * <ul>
 *     <li>shopId : 상점 고유 아이디</li>
 *     <li>shopName : 상점명</li>
 *     <li>logoIcon : 상점로고 URL</li>
 * </ul>
 */
@Entity
@Data
@Table(name = "shop")
public class Shop {
    @Id
    private int shopId;

    private String shopName;

    private String logoIcon;
}
