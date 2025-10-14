package com.example.productservice.repository;

import com.example.productservice.domain.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Review,Integer> {

    /**
     * 상품 아이디로 해당 상품의 평균 별점 조회
     * @param productId 상품 아이디
     * @return 평균 별점
     */
    @Query("SELECT AVG(r.rating) FROM Review r " +
            "JOIN ProductShop ps ON r.productShop.productShopId = ps.productShopId " +
            "WHERE ps.product.productId = :productId")
    Double findAvgRatingByProductId(Integer productId);

    /**
     * 특정 상품의 전체 리뷰 정보
     * @param productId 상품 아이디
     * @return 전체 리뷰 정보 및 상점 정보
     */
    @Query("select r.reviewId ,r.writer ,r.rating,r.reviewDate,r.title,r.comment,s.shopName,s.logoIcon from Review r " +
            "inner join ProductShop ps on ps.productShopId = r.productShop.productShopId " +
            "inner join Shop s on s.shopId =ps.shop.shopId " +
            "inner join Product p on p.productId =ps.product.productId where p.productId = :productId")
    List<Object[]> findReviewByProductId(Integer productId);

    /**
     * 특정 상품 리뷰 내용 조회
     * @param productId 상품 아이디
     * @return 리뷰 내용 목록
     */
    @Query("""
    SELECT r.comment
    FROM Review r
    JOIN r.productShop ps
    JOIN ps.product p
    WHERE p.productId = :productId""")
    List<String>findCommentsByProductId(Integer productId);
}
