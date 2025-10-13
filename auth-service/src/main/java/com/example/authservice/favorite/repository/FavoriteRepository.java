package com.example.authservice.favorite.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.authservice.favorite.entity.Favorite;

@Repository
public interface FavoriteRepository extends JpaRepository<Favorite, Long> {

  List<Favorite> findByUserId(Long userId);

  Optional<Favorite> findByUserIdAndProductId(Long userId, Integer productId);

  boolean existsByUserIdAndProductId(Long userId, Integer productId);

  void deleteByUserIdAndProductId(Long userId, Integer productId);

  @Query("SELECT f FROM Favorite f JOIN FETCH f.user WHERE f.productId = :productId")
  List<Favorite> findByProductIdWithUser(@Param("productId") Integer productId);
}
