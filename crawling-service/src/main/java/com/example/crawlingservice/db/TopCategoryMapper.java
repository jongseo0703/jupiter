package com.example.crawlingservice.db;

import com.example.crawlingservice.domain.TopCategory;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Options;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/**
 * topcategory 테이블의 Mapper 인터페이스
 */
@Mapper
public interface TopCategoryMapper {
    /**
     * 상위 카테고리 이름을 받아 데이터베이스에 저장
     * @param topCategory 상위 카테고리
     */
    @Insert("insert into topcategory(top_name) values (#{topName})")
    @Options(useGeneratedKeys = true,keyProperty = "topCategoryId")
    void insert(TopCategory topCategory);

    /**
     * 상위 카테고리명을 받아 조회
     * @param topName 조회할 상위카테고리명
     * @return topCategory 반환
     */
    @Select("select * from topcategory where top_name=#{topName}")
    TopCategory getTopCategory(String topName);


}
