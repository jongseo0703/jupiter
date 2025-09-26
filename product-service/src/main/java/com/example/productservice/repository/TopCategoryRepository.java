package com.example.productservice.repository;

import com.example.productservice.domain.TopCategory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TopCategoryRepository extends JpaRepository<TopCategory,Integer> {
}
