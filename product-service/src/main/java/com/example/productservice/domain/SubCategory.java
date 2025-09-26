package com.example.productservice.domain;

import jakarta.persistence.*;
import lombok.Data;

/**
 * 하위 카테고리 테이블의 엔티티 클래스
 * <ul>
 *     <li>subcategoryId : 하위 카테고리의 고유 아이디</li>
 *     <li>subName : 하위 카테고리명</li>
 *     <li>topCategory : 상위 카테고리 참조</li>
 * </ul>
 */
@Entity
@Data
@Table(name = "subcategory")
public class SubCategory {
    @Id
    @Column(name = "subcategory_id")
    private int subcategoryId;
    
    private String subName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "topcategory_id")
    private TopCategory topCategory;
}
