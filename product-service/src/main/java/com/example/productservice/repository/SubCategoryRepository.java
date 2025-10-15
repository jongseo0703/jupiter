package com.example.productservice.repository;

import com.example.productservice.domain.SubCategory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SubCategoryRepository extends JpaRepository<SubCategory,Integer> {
    List<SubCategory> findByTopCategoryTopcategoryId(int topCategoryTopcategoryId);
    Optional<SubCategory> findBySubNameAndTopCategory_TopcategoryId(String subName, int topCategoryId);
}
