package com.example.crawlingservice.db;

import com.example.crawlingservice.domain.Product;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Options;
import org.apache.ibatis.annotations.Select;

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
}
