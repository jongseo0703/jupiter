package com.example.crawlingservice.db;

import com.example.crawlingservice.domain.Stock;
import org.apache.ibatis.annotations.*;

/**
 *insert 재고 정보 저장<br>
 * selectByProductId 상품 아이디로 조회
 */
@Mapper
public interface StockMapper {
    /**
     * 재고 정보 저장<br>
     * is_available - 재고가 있을 시 true, 재고가 없으면 false
     * @param stock 재고 정보
     * @return 성공 시 1, 실패 시 0
     */
    @Insert("INSERT INTO stock(is_available,product_id) VALUES (#{isAvailable},#{product.productId})")
    @Options(useGeneratedKeys = true,keyProperty = "stockId")
    int insert(Stock stock);

    /**
     * 상품명으로 조회
     * @param productName 상품명
     * @return 재고 정보
     */
    @Select("SELECT s.* FROM stock s " +
            "JOIN product p ON p.product_id = s.product_id WHERE p.product_name = #{productName} ")
    Stock selectByProductName(String productName);

    /**
     * 상품명으로 is_available 값 변경
     * @param result true/false
     * @param productName 상품명
     */
    @Update("UPDATE stock s " +
            "JOIN product p ON p.product_id = s.product_id " +
            "SET s.is_available = #{result} "+
            "WHERE p.product_name = #{productName}")
    void updateProduct(boolean result,String productName);
}
