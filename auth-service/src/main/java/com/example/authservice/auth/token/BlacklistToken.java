package com.example.authservice.auth.token;

import java.io.Serializable;

import org.springframework.data.annotation.Id;
import org.springframework.data.redis.core.RedisHash;

import lombok.AllArgsConstructor;
import lombok.Getter;

@RedisHash(value = "jwtBlacklist", timeToLive = 60 * 60 * 24)
@Getter
@AllArgsConstructor
public class BlacklistToken implements Serializable {

  @Id private String accessToken;
}
