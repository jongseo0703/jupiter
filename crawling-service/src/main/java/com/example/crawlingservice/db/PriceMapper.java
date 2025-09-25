package com.example.crawlingservice.db;

import com.example.crawlingservice.domain.Price;
import org.apache.ibatis.annotations.*;

/**
 * insert 저장<br>
 * selectByProductShopId 상품_상점 아디로 가격 조회<br>
 * upate 가격과 배송비 업데이트
 */
@Mapper
public interface PriceMapper {
    /**
     * price 테이블에 저장하는 쿼리문
     * @param price 저장할 가격 정보
     * @return
     */
    @Insert("insert into price(price,delivery_fee,product_shop_id) " +
            "values(#{price},#{deliveryFee},#{productShop.productShopId}) ")
    @Options(useGeneratedKeys = true,keyProperty = "priceId")
    int insert(Price price);

    /**
     * 상품_상점 아이디로 조회하는 쿼리문
     * @param productShopId 상품_상점 아이디
     * @return Price 반환
     */
    @Select("select * from price where product_shop_id = #{productShopId}")
    Price selectByProductShopId(int productShopId);

    /**
     * 가격과 배송비 업데이트 쿼리문
     * @param price 가격 클래스
     * @return
     */
    @Update("update price set price = #{price}, delivery_fee  = #{deliveryFee } where product_shop_id = #{productShop.productShopId}")
    int update(Price price);

}
