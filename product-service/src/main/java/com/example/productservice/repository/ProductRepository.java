package com.example.productservice.repository;

import com.example.productservice.domain.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product,Integer> {
    /**
     * 재고가 있고 평균 별점이 높고 리뷰수가 많은 상품들의 아이디 조회
     * @return 상품 아이디와 평균 별점 목록
     */
    @Query("SELECT p.productId FROM Product p " +
            "JOIN Stock s ON p.productId = s.product.productId " +
            "JOIN ProductShop ps ON p.productId = ps.product.productId " +
            "JOIN Review r ON ps.productShopId = r.productShop.productShopId " +
            "WHERE s.isAvailable = true " +
            "GROUP BY p.productId " +
            "ORDER BY " +
            "COUNT(r.reviewId) DESC, " +
            "AVG(r.rating) DESC ")
    List<Integer> findTopAvailableProductIdsByRating();

    /**
     * 상품정보와 하위케테고리명, 가격정보(금액과 상점명)를 조회
     * @param productId 조회할 상품 아이디
     * @return 상품정보 반환
     */
    @Query("SELECT p.productId, p.productName, p.url, p.description, " +
            "sc.subName, pr.price, s.shopName,p.alcoholPercentage, p.volume " +
            "FROM Product p " +
            "JOIN ProductShop ps ON p.productId = ps.product.productId " +
            "JOIN Price pr ON ps.productShopId = pr.productShop.productShopId " +
            "JOIN Shop s ON ps.shop.shopId = s.shopId " +
            "JOIN SubCategory sc ON p.subCategory.subcategoryId = sc.subcategoryId " +
            "WHERE p.productId = :productId " +
            "ORDER BY pr.price ASC LIMIT 3")
    List<Object[]> findProductWithPricesByProductId(Integer productId);

    @Query("SELECT p.productId FROM Product p" +
            "  JOIN Stock s ON p.productId = s.product.productId" +
            " LEFT JOIN ProductShop ps ON ps.product.productId = p.productId" +
            " LEFT JOIN Review r ON r.productShop.productShopId = ps.productShopId" +
            "  WHERE s.isAvailable = true " +
            "GROUP BY p.productId " +
            " ORDER BY " +
            "CASE WHEN COUNT(r.reviewId) > 0 THEN 0 ELSE 1 END, " +
            "COUNT(r.reviewId) DESC")
    List<Integer> findAvailableProductIdsByProductId();

}
