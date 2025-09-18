package com.example.authservice.auth.token;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {

  private final RefreshTokenRepository refreshTokenRepository;

  @Transactional
  public void saveTokenInfo(String email, String refreshToken, String accessToken) {
    refreshTokenRepository.save(new RefreshToken(email, accessToken, refreshToken));
  }

  @Transactional
  public void removeRefreshToken(String accessToken) {
    RefreshToken refreshToken =
        refreshTokenRepository
            .findByAccessToken(accessToken)
            .orElseThrow(IllegalArgumentException::new);

    refreshTokenRepository.delete(refreshToken);
  }
}
