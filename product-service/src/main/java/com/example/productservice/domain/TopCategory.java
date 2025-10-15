package com.example.productservice.domain;

import jakarta.persistence.*;
import lombok.Data;

/**
 * 상위 카테고리 테이블의 엔티티 클래스
 * <ui>
 *     <li>topcategoryId : 상위 카테고리의 고유 아이디</li>
 *     <li>topName : 상위 카테고리명</li>
 * </ui>
 */
@Data
@Entity
@Table(name = "topcategory")
public class TopCategory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "topcategory_id")
    private int topcategoryId;

    private String topName;
}
