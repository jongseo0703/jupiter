package com.example.crawlingservice.db;

import com.example.crawlingservice.domain.Product;
import org.apache.ibatis.annotations.*;

import java.util.List;

/**
 * insert 상품 저장<br>
 * selectByProductName 상품명과 브랜드로 Product 조회
 */
@Mapper
public interface ProductMapper {
    /**
     * 상품 저장 쿼리문
     * @param product
     */
    @Insert("insert into product(product_name,brand,alcohol_percentage,volume,description,url,subcategory_id)" +
            " values (#{productName},#{brand},#{alcoholPercentage},#{volume},#{description},#{url},#{subCategory.subCategoryId})")
    @Options(useGeneratedKeys = true,keyProperty = "productId")
    void insert(Product product);

    /**
     * 상품명과 브랜드로 상품정보 조회
     * @param productName
     * @param brand
     * @return Product 반환
     */
    @Select("select * from product where product_name = #{productName} and brand = #{brand}")
    Product selectByProductName(String productName,String brand);

    /**
     * 모든 상품 조회
     * @return 상품 목록
     */
    @Select("SELECT * FROM product")
    List<Product> selectAll();

    /**
     * 상품명으로 조회
     * @param productName
     * @return 상품
     */
    @Select("select * from product where product_name = #{productName}")
    Product selectByProduct(String productName);

    /**
     * 상품 이미지 업데이트
     * @param productId 상품 아이디
     * @param url 이미지 URL
     */
    @Update("UPDATE product SET url =#{url} Where product_id = #{productId}")
    void updateUrl(@Param("productId") int productId,@Param("url") String url);
}
