package com.example.communityservice.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.communityservice.entity.Authors;

/** Authors 엔티티에 대한 데이터 접근 계층 (Repository) - 작성자 정보를 관리하는 Repository - 회원/익명 사용자 구분하여 조회 기능 제공 */
@Repository
public interface AuthorsRepository extends JpaRepository<Authors, Long> {

  Optional<Authors> findByUserId(Long userId);

  Optional<Authors> findByAnonymousEmailAndAnonymousPwd(String email, String password);

  boolean existsByAnonymousEmail(String email);
}
