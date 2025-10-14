package com.example.productservice.repository;

import com.example.productservice.domain.ProductShop;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProductShopRepository extends JpaRepository<ProductShop, Integer> {
    Optional<ProductShop> findByProduct_ProductIdAndShop_ShopId(Integer productId, Integer shopId);
}
