package com.example.crawlingservice.db;

import com.example.crawlingservice.domain.ProductShop;
import org.apache.ibatis.annotations.*;

/**
 * insert 상품_상점 정보 저장<br>
 * selectByProductId 상품 아이디와 상점 아이디로 조회 <br>
 * updateLink 구매 링크 업데이트<br>
 * selectByShopName 상점명으로 상품_상점 정보 조회
 */
@Mapper
public interface ProductShopMapper {
    /**
     * 상품_상점 정보 저장
     * @param productShop
     * @return
     */
    @Insert("insert product_shop(product_id,shop_id,link) values (#{product.productId},#{shop.shopId},#{link})")
    @Options(useGeneratedKeys = true,keyProperty = "productShopId")
    int insert(ProductShop productShop);

    /**
     * 상품_ 상점 정보 조회
     * @param productId 상품 아이디
     * @param shopId 상점 아이디
     * @return 상품_상점 정보 반환
     */
    @Select("select *from product_shop where product_id = #{productId} and shop_id = #{shopId}")
    ProductShop selectByProductId(int productId, int shopId);

    /**
     * 구매 사이트 링크 업데이트
     *
     * @param link      변경된 링크 주소
     * @param productId 상품 아이디
     * @param shopId    상점 아이디
     */
    @Update("update product_shop set link = #{link} where product_id = #{productId} and shop_id =#{shopId}")
    void updateLink(String link, int productId, int shopId);

    /**
     * 상품_상점 아이디 얻기
     * @param shopName 상점명
     * @param productId 상품 아이디
     * @return 상품_상점 아이디 반환
     */
    @Select("SELECT ps.product_shop_id FROM product_shop ps " +
            "JOIN shop s ON ps.shop_id = s.shop_id " +
            "WHERE s.shop_name = #{shopName} AND ps.product_id = #{productId}")
    Integer getProductShopId(String shopName,int productId);

    /**
     * 상품_상점 조회
     * @param productShopId 조회할 아이디
     * @return 상품_상점 정보
     */
    @Select("SELECT * FROM product_shop WHERE product_shop_id = #{productShopId}")
    ProductShop selectByProductShopId(int productShopId);

}
