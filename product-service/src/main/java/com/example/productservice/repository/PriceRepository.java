package com.example.productservice.repository;

import com.example.productservice.domain.Price;
import com.example.productservice.domain.PriceLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PriceRepository extends JpaRepository<Price,Integer> {
    /**
     * 특정 상품의 전체 가격 정보 조회
     * @param productId 상품 아이디
     * @return 전체 가격 정보 및 상점 정보
     */
    @Query("select pc.priceId,pc.price,pc.deliveryFee,ps.link,s.shopName,s.logoIcon from Price pc inner join ProductShop ps on ps.productShopId = pc.productShop.productShopId " +
            "inner join Shop s on s.shopId =ps.shop.shopId " +
            "inner join Product p on ps.product.productId = p.productId where ps.isAvailable = true and p.productId = :productId")
    List<Object[]> findByProductId(Integer productId);

    /**
     * 특정 상품의 모든 Price 엔티티 조회 (최저가 계산용)
     * @param productId 상품 아이디
     * @return Price 엔티티 목록
     */
    @Query("SELECT p FROM Price p " +
           "JOIN p.productShop ps " +
           "WHERE ps.product.productId = :productId AND ps.isAvailable = true")
    List<Price> findAllByProductShop_Product_ProductId(@Param("productId") Integer productId);
}
