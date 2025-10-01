package com.example.productservice.repository;

import com.example.productservice.domain.SubCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface SubCategoryRepository extends JpaRepository<SubCategory,Integer> {
    List<SubCategory> findByTopCategoryTopcategoryId(int topCategoryTopcategoryId);
}
