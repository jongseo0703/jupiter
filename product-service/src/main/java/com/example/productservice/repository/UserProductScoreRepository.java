package com.example.productservice.repository;

import com.example.productservice.domain.UserProductScore;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserProductScoreRepository extends JpaRepository<UserProductScore, Long> {
    Optional<UserProductScore> findByUserIdAndProductId(Long userId, Integer productId);

    @Query("SELECT ups FROM UserProductScore ups WHERE ups.userId = :userId ORDER BY ups.score DESC")
    List<UserProductScore> findTopProductsByUserId(Long userId);
}
