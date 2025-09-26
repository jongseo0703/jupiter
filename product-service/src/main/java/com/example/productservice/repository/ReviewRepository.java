package com.example.productservice.repository;

import com.example.productservice.domain.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

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
}
