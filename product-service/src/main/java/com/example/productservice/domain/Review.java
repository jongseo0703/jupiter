package com.example.productservice.domain;

import jakarta.persistence.*;
import lombok.Data;

/**
 * 리뷰 엔티티 클래스
 * <ul>
 *     <li>reviewId : 리뷰 고유아이디</li>
 *     <li>writer : 작성자</li>
 *     <li>rating : 별점</li>
 *     <li>reviewDate : 등록 날짜</li>
 *     <li>title : 제목</li>
 *     <li>content : 내용</li>
 *     <li>productShop : 상품_상점 참조</li>
 * </ul>
 */
@Data
@Entity
@Table(name = "review")
public class Review {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int reviewId;

    private String writer;

    private int rating;

    private String reviewDate;

    private String title;

    private String comment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_shop_id")
    private ProductShop productShop;
}
