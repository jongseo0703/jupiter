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
    @Query(value = "SELECT DISTINCT tc.top_name FROM topcategory tc " +
            "INNER JOIN subcategory sc ON sc.topcategory_id = tc.topcategory_id " +
            "WHERE sc.sub_name = :subName " +
            "LIMIT 1", nativeQuery = true)
    String findByTopCategoryTopcategoryName(String subName);
}
