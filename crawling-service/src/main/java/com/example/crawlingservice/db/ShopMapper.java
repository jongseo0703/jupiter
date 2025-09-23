package com.example.crawlingservice.db;

import com.example.crawlingservice.domain.Shop;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Options;
import org.apache.ibatis.annotations.Select;

/**
 * insert 상점 정보 저장<br>
 * selectByShopName 상점명으로 조회
 */
@Mapper
public interface ShopMapper {
    /**
     * 상점 정보 저장
     * @param shop 상점 정보
     */
    @Insert("insert into shop(shop_name,logo_icon)" +
            " values (#{shopName},#{icon})")
    @Options(useGeneratedKeys = true,keyProperty = "shop_id")
    void insert(Shop shop);

    /**
     * 상점명으로 상점정보 조회
     * @param shopName 상점명
     * @return 상점정보 저장
     */
    @Select("select * from shop where shop_name=#{shopName}")
    Shop selectByShopName(String shopName);
}
