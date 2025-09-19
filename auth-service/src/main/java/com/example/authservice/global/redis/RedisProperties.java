package com.example.authservice.global.redis;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import lombok.Getter;

/**
 * Redis 데이터베이스의 관련 설정 - port는 application-dev.properties에 존재 - host는 application-dev.properties에 존재
 */
@Component
@Getter
public class RedisProperties {
  @Value("${spring.data.redis.port}")
  private int port;

  @Value("${spring.data.redis.host}")
  private String host;

  @Value("${spring.data.redis.password}")
  private String password;
}
