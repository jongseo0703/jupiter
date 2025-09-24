package com.example.crawlingservice.db;

import com.example.crawlingservice.domain.PriceLog;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Options;
import org.apache.ibatis.annotations.Select;

/**
 * insert 가격로그 저장 <br>
 * getPriceLog 상품아이디로 가격로그 조회
 */
@Mapper
public interface PriceLogMapper {
    /**
     * 가격로그 저장 메서드
     * @param priceLog 가격로그 정보
     * @return 성공 시 1, 실패 시 0
     */
    @Insert("INSERT INTO price_log(price, price_id) VALUES (#{newPrice},#{price.priceId})")
    @Options(useGeneratedKeys = true,keyProperty = "priceLogId")
    int insert(PriceLog priceLog);
}
