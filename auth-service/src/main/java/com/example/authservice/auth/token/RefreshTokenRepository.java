package com.example.authservice.auth.token;

import java.util.Optional;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RefreshTokenRepository extends CrudRepository<RefreshToken, String> {

  // accessToken으로 RefreshToken을 찾아옴.
  Optional<RefreshToken> findByAccessToken(String accessToken);
}
