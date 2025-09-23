package com.example.crawlingservice.db;

import com.example.crawlingservice.domain.SubCategory;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Options;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/**
 * insert 하위 카테고리 정보 저장<br>
 * getSubCategory 하위 카테고리명으로 조회<br>
 * getSubCategories 같은 상위 카테고리를 가진 하위 카테고리 목록
 */
@Mapper
public interface SubCategoryMapper {
    /**
     * 하위 카테고리 저장
     * @param subCategory 하위 카테고리 정보
     */
    @Insert("insert into subcategory(sub_name,topcategory_id) values (#{subName},#{topCategoryId})")
    @Options(useGeneratedKeys = true,keyProperty = "subcategory_id")
    void insert(SubCategory subCategory);

    /**
     * 카테고리명으로 하위 카테고리 정보 조회
     * @param subName 카테고리명
     * @return 하위 카테고리 정보
     */
    @Select("select * from subcategory where sub_name =#{subName}")
    SubCategory getSubCategory(String subName);

    /**
     * 상위 카테고리 아이디로 조회
     * @param topCategoryId 상위 카테고리 아이디
     * @return 하위 카테고리 목록
     */
    @Select("select *from subcategory where topcategory_id = #{topcategoryId}")
    List<SubCategory> getSubCategories(int topCategoryId);
}
