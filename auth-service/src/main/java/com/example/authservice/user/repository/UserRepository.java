package com.example.authservice.user.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.authservice.user.entity.User;

/** JPA를 사용하는 UserRepository임. */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
  // username으로 존재하는지 체크.
  boolean existsByUsername(String username);

  // email로 존재하는지 체크.
  boolean existsByEmail(String email);

  // username으로 유저를 찾음.
  Optional<User> findByUsername(String username);

  // email로 유저를 찾음.
  Optional<User> findByEmail(String email);

  // OAuth 제공자와 OAuth ID로 유저를 찾음.
  Optional<User> findByOauthProviderAndOauthId(String oauthProvider, String oauthId);
}
