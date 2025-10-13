package com.example.productservice.repository;

import com.example.productservice.domain.PriceLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface PriceLogRepository extends JpaRepository<PriceLog, Integer> {

    /**
     * 특정 상품의 어제 가격 로그 조회
     * @param productId 상품 ID
     * @param startOfYesterday 어제 시작 시간
     * @param endOfYesterday 어제 끝 시간
     * @return 어제의 가격 로그 목록
     */
    @Query("SELECT pl FROM PriceLog pl " +
           "JOIN FETCH pl.price p " +
           "JOIN p.productShop ps " +
           "WHERE ps.product.productId = :productId " +
           "AND pl.createdAt >= :startOfYesterday " +
           "AND pl.createdAt < :endOfYesterday " +
           "ORDER BY pl.createdAt DESC")
    List<PriceLog> findYesterdayPriceLogsByProductId(
        @Param("productId") Integer productId,
        @Param("startOfYesterday") LocalDateTime startOfYesterday,
        @Param("endOfYesterday") LocalDateTime endOfYesterday
    );
}
