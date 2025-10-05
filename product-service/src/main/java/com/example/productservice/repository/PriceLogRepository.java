package com.example.productservice.repository;

import com.example.productservice.domain.PriceLog;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PriceLogRepository extends JpaRepository<PriceLog, Integer> {
}
