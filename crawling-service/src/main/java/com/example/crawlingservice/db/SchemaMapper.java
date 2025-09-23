package com.example.crawlingservice.db;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Update;

/**
 * 데이터베이스를 스키마를 생성하는 Mapper interface<br>
 * 테이블이 존재하지 않을때 자동으로 생성
 *  <ul>
 *      <li>상위카테고리 테이블</li>
 *      <li>하위카테고리 테이블</li>
 *      <li>상품 테이블</li>
 *      <li>상품-상점 테이블</li>
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
        CREATE TABLE IF NOT EXISTS topcategory (
            topcategory_id INT AUTO_INCREMENT PRIMARY KEY,
            top_name VARCHAR(100) NOT NULL
        )
        """)
    void createTopCategory();

    /**
     * 하위 카테고리 테이블을 생성하는 메서드<br>
     * 상위 카테고리 테이블 참조
     */
    @Update("""
        CREATE TABLE IF NOT EXISTS subcategory (
            subcategory_id INT AUTO_INCREMENT PRIMARY KEY,
            sub_name VARCHAR(100) NOT NULL,
            topcategory_id INT NOT NULL,
            FOREIGN KEY (topcategory_id) REFERENCES topcategory(topcategory_id) 
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
            volume INT,
            subcategory_id INT NOT NULL,
            FOREIGN KEY (subcategory_id) REFERENCES subcategory(subcategory_id)
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
            logo_icon VARCHAR(500)
        )
        """)
    void createShopTable();

    @Update("""
        CREATE TABLE IF NOT EXISTS product_shop (
            product_shop_id INT AUTO_INCREMENT PRIMARY KEY,
            product_id INT NOT NULL,
            shop_id INT NOT NULL,
            link VARCHAR(500),
            FOREIGN KEY (product_id) REFERENCES product(product_id)
                ON DELETE CASCADE
                ON UPDATE CASCADE,
            FOREIGN KEY (shop_id) REFERENCES shop(shop_id)
                ON DELETE CASCADE
                ON UPDATE CASCADE,
            UNIQUE(product_id, shop_id)
        )
        """)
    void createProductShopTable();

    /**
     * 가격 테이블을 생성하는 메서드<br>
     * 상점 테이블 참조
     */
    @Update("""
        CREATE TABLE IF NOT EXISTS price (
            price_id INT AUTO_INCREMENT PRIMARY KEY,
            price INT NOT NULL,
            delivery_fee INT DEFAULT 0,
            product_shop_id INT NOT NULL,
            FOREIGN KEY (product_shop_id) REFERENCES product_shop(product_shop_id)
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
            product_shop_id INT NOT NULL,
            FOREIGN KEY (product_shop_id) REFERENCES product_shop(product_shop_id)
                ON DELETE CASCADE
                ON UPDATE CASCADE
        )
        """)
    void createReviewTable();

    /**
     * 모든 테이블을 순서대로 생성하는 메서드
     */
    default void createAllTables() {
        createTopCategory();
        createSubCategoryTable();
        createShopTable();
        createProductTable();
        createProductShopTable();
        createPriceTable();
        createReviewTable();
    }

}
