package com.example.productservice.repository;

import com.example.productservice.domain.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product,Integer> {
    /**
     * 재고가 있고 평균 별점이 높은 상품 아이디와 평균 별점 6개 조회
     * @return 상품 아이디와 평균 별점 목록
     */
    @Query("SELECT p.productId FROM Product p " +
            "JOIN Stock s ON p.productId = s.product.productId " +
            "JOIN ProductShop ps ON p.productId = ps.product.productId " +
            "JOIN Review r ON ps.productShopId = r.productShop.productShopId " +
            "WHERE s.isAvailable = true " +
            "GROUP BY p.productId " +
            "ORDER BY AVG(r.rating) DESC " +
            "LIMIT 6")
    List<Integer> findTop6AvailableProductIdsByRating();

    /**
     * 상품정보(아이디,상품명,URL,설명)과 하위케테고리명과 가격정보(금액과 상점명)를 조회
     * @param productId 조회할 상품 아이디
     * @return 상품정보 반환
     */
    @Query("SELECT p.productId, p.productName, p.url, p.description, " +
            "sc.subName, pr.price, s.shopName " +
            "FROM Product p " +
            "JOIN ProductShop ps ON p.productId = ps.product.productId " +
            "JOIN Price pr ON ps.productShopId = pr.productShop.productShopId " +
            "JOIN Shop s ON ps.shop.shopId = s.shopId " +
            "JOIN SubCategory sc ON p.subCategory.subcategoryId = sc.subcategoryId " +
            "WHERE p.productId = :productId " +
            "ORDER BY pr.price ASC LIMIT 3")
    List<Object[]> findProductWithPricesByProductId(Integer productId);

}
