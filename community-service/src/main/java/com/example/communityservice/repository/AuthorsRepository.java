package com.example.communityservice.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.communityservice.entity.Authors;

/** Authors 엔티티에 대한 데이터 접근 계층 (Repository) */
@Repository
public interface AuthorsRepository extends JpaRepository<Authors, Long> {

  Optional<Authors> findByUserId(Long userId);
}
