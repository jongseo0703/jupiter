package com.example.productservice.repository;

import com.example.productservice.domain.TopCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface TopCategoryRepository extends JpaRepository<TopCategory,Integer> {
    Optional<TopCategory> findByTopName(String topName);
    /**
     * 하위 카테고리 명으로 상위 카테고리 명을 조회 (첫 번째 결과만 반환)
     * @param subName 하위 카테고리 명
     * @return 상위 카테고리 명
     */
    @Query("select DISTINCT t.topName from TopCategory t " +
            "inner join SubCategory s on s.topCategory.topcategoryId =t.topcategoryId " +
            "where s.subName = :subName " +
            "order by t.topcategoryId limit 1")
    String findByTopCategoryTopcategoryName(String subName);
}
