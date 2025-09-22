package com.example.crawlingservice.db;

import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

/**
 * topcategory 테이블의 Mapper 인터페이스
 */
@Mapper
public interface TopCategoryMapper {
    /**
     * 상위 카테고리 이름을 받아 데이터베이스에 저장
     * @param topName 상위 카테고리
     */
    @Insert("insert into topcategory(top_name) values (#{topName})")
    void insert(String topName);


}
