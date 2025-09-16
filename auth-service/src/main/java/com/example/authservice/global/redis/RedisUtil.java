package com.example.authservice.global.redis;

import java.util.concurrent.TimeUnit;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;

/**
 * Redis 유틸리티 클래스임.
 *
 * <p>- RedisTemplate을 사용하여 Redis에 데이터를 쉽게 저장할 수 있는 기능 제공 - TTL(Time To Live) 설정 가능
 *
 * <p>사용 예: - 로그인 시 Refresh Token을 Redis에 저장하고 만료시간 설정 - 캐시 데이터 저장 및 만료 관리
 */
@Component
@RequiredArgsConstructor
public class RedisUtil {

  private final RedisTemplate<String, String> redisTemplate;

  /**
   * Redis에 데이터를 저장하고 만료시간(Time To Live)을 설정
   *
   * @param key Redis에 저장할 Key
   * @param value Redis에 저장할 Value
   * @param durationInSeconds TTL, 초 단위
   */
  public void setDataExpire(String key, String value, long durationInSeconds) {
    redisTemplate.opsForValue().set(key, value, durationInSeconds, TimeUnit.SECONDS);
  }
}
