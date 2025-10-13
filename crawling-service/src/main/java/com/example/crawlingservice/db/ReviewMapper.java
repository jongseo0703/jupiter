package com.example.crawlingservice.db;

import com.example.crawlingservice.domain.Review;
import org.apache.ibatis.annotations.*;

/**
 * insert 리뷰정보 저장<br>
 * selectByProductShopId 상품_상점 아디와 작성자로 리뷰 조회
 */
@Mapper
public interface ReviewMapper {
    /**
     * 리뷰 정보 저장
     * @param review
     * @return
     */
    @Insert("insert review(writer,rating,title,comment,review_date,product_shop_id)" +
            " values (#{writer},#{rating},#{title},#{comment},#{reviewDate},#{productShop.productShopId})")
    @Options(useGeneratedKeys = true,keyProperty = "reviewId")
    int insert(Review review);


    /**
     * 상품_상점 아이디와 리뷰 내용으로 리뷰정보 조회
     * @param productShopId 상품_상점아이디
     * @param content 리뷰 내용
     * @return 리뷰 정보 반환
     */
    @Select("select * from review where product_shop_id = #{productShopId} and comment = #{content}")
    Review selectByProductShopIdAndContent(int productShopId, String content);

}
