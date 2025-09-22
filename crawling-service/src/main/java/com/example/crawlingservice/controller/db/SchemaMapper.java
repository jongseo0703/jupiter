package com.example.crawlingservice.controller.db;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Update;

/**
 * 데이터베이스를 스키마를 생성하는 Mapper interface<br>
 * 테이블이 존재하지 않을때 자동으로 생성
 *  <ul>
 *      <li>상위카테고리 테이블</li>
 *      <li>하위카테고리 테이블</li>
 *      <li>상품 테이블</li>
 *      <li>상점 테이블</li>
 *      <li>가격 테이블</li>
 *      <li>리뷰 테이블</li>
 *  </ul>
 */
@Mapper
public interface SchemaMapper {
    /**
     * 상위카테고리 테이블을 생성하는 메서드<br>
     * 부모 테이블
     */
    @Update("""
        CREATE TABLE IF NOT EXISTS topCategory (
            top_category_id INT AUTO_INCREMENT PRIMARY KEY,
            top_name VARCHAR(100) NOT NULL
        )
        """)
    void createTopCategory();

    /**
     * 하위 카테고리 테이블을 생성하는 메서드<br>
     * 상위 카테고리 테이블 참조
     */
    @Update("""
        CREATE TABLE IF NOT EXISTS subCategory (
            sub_category_id INT AUTO_INCREMENT PRIMARY KEY COMMENT,
            sub_name VARCHAR(100) NOT NULL,
            top_category_id INT NOT NULL,
            FOREIGN KEY (top_category_id) REFERENCES top_category(top_category_id) 
                ON DELETE CASCADE 
                ON UPDATE CASCADE
        )
        """)
    void createSubCategoryTable();

    /**
     * 상품 테이블을 생성하는 메서드<br>
     * 하위 카테고리 테이블 참조
     */
    @Update("""
        CREATE TABLE IF NOT EXISTS product (
            product_id INT AUTO_INCREMENT PRIMARY KEY,
            product_name VARCHAR(200) NOT NULL,
            description TEXT,
            brand VARCHAR(100),
            alcohol_percentage DOUBLE,
            url VARCHAR(500),
            volume Int,
            sub_category_id INT NOT NULL,
            FOREIGN KEY (sub_category_id) REFERENCES sub_category(sub_category_id)
                ON DELETE CASCADE
                ON UPDATE CASCADE
        )
        """)
    void createProductTable();

    /**
     * 상점 테이블을 생성하는 메서드<br>
     * 상품 테이블 참조
     */
    @Update("""
        CREATE TABLE IF NOT EXISTS shop (
            shop_id INT AUTO_INCREMENT PRIMARY KEY,
            shop_name VARCHAR(100) NOT NULL,
            link VARCHAR(500),
            logo_icon VARCHAR(500),
            product_id INT NOT NULL,
            FOREIGN KEY (product_id) REFERENCES product(product_id)
                ON DELETE SET NULL
                ON UPDATE CASCADE
        )
        """)
    void createShopTable();

    /**
     * 가격 테이블을 생성하는 메서드<br>
     * 상점 테이블 참조
     */
    @Update("""
        CREATE TABLE IF NOT EXISTS price (
            price_id INT AUTO_INCREMENT PRIMARY KEY,
            price INT NOT NULL,
            delivery_fee INT DEFAULT 0,
            shop_id INT NOT NULL,
            FOREIGN KEY (shop_id) REFERENCES shop(shop_id)
                ON DELETE CASCADE
                ON UPDATE CASCADE
        )
        """)
    void createPriceTable();

    /**
     * 리뷰 테이블을 생성하는 메서드<br>
     * 상품 상점 테이블
     */
    @Update("""
        CREATE TABLE IF NOT EXISTS review (
            review_id INT AUTO_INCREMENT PRIMARY KEY,
            writer VARCHAR(100) NOT NULL,
            rating INT,
            title VARCHAR(200),
            comment TEXT,
            review_date VARCHAR(50),
            product_id INT NOT NULL,
            FOREIGN KEY (product_id) REFERENCES product(product_id)
                ON DELETE CASCADE
                ON UPDATE CASCADE,
        )
        """)
    void createReviewTable();

    /**
     * 모든 테이블을 순서대로 생성하는 메서드
     */
    default void createAllTables() {
        createTopCategory();
        createSubCategoryTable();
        createProductTable();
        createShopTable();
        createPriceTable();
        createReviewTable();
    }

}
