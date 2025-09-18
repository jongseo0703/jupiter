package com.example.authservice.auth.token;

import java.util.concurrent.TimeUnit;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BlacklistTokenService {

  private final RedisTemplate<String, String> redisTemplate;

  @Transactional
  public void addToBlacklist(String accessToken, long ttlInSeconds) {
    redisTemplate.opsForValue().set(accessToken, "blacklisted", ttlInSeconds, TimeUnit.SECONDS);
  }

  public boolean isBlacklisted(String accessToken) {
    return redisTemplate.hasKey(accessToken);
  }
}
