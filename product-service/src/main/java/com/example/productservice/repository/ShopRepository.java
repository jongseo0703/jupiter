package com.example.productservice.repository;

import com.example.productservice.domain.Shop;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ShopRepository extends JpaRepository<Shop, Integer> {
    Optional<Shop> findByShopName(String shopName);
}
