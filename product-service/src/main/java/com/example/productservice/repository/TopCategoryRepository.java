package com.example.productservice.repository;

import com.example.productservice.domain.TopCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface TopCategoryRepository extends JpaRepository<TopCategory,Integer> {
    Optional<TopCategory> findByTopName(String topName);
    /**
     * 하위 카테고리 명으로 상위 카테고리 명을 조회
     * @param subName 하위 카테고리 명
     * @return 상위 카테고리 명
     */
    @Query("select t.topName from TopCategory t " +
            "inner join SubCategory s on s.topCategory.topcategoryId =t.topcategoryId " +
            "where s.subName = :subName")
    String findByTopCategoryTopcategoryName(String subName);
}
