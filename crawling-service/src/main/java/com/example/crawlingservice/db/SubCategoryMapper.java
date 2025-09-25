package com.example.crawlingservice.db;

import com.example.crawlingservice.domain.SubCategory;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Options;
import org.apache.ibatis.annotations.Select;


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
    @Insert("insert into subcategory(sub_name,topcategory_id) values (#{subName},#{topCategory.topCategoryId})")
    @Options(useGeneratedKeys = true,keyProperty = "subCategoryId")
    void insert(SubCategory subCategory);

    /**
     * 하위 카테고리명으로 조회
     * @param subName 카테고리명
     * @return 하위 카테고리
     */
    @Select("select * from subcategory s inner join topcategory t on s.topcategory_id =t.topcategory_id " +
            "where s.sub_name = #{subName}")
    SubCategory getSubCategoryByName(String subName);
}
