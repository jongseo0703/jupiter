package com.example.authservice.auth.security;

import java.util.Date;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import com.example.authservice.user.entity.User;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;

/**
 * JwtTokenProvider
 *
 * <p>로그인 성공 시 JWT(JSON Web Token) 및 Refresh Token을 생성하고, 토큰 검증 및 사용자 정보 추출 기능을 제공하는 컴포넌트임.
 *
 * <p>특징: - JWT는 Base64URL 인코딩 형식으로 생성됨. - SecretKey는 UTF-8 바이트 배열로 HMAC-SHA 알고리즘 서명에 사용됨. - Access
 * Token과 Refresh Token의 만료 시간을 각각 설정할 수 있음.
 */
@Slf4j
@Component
public class JwtTokenProvider {

  // HMAC-SHA 서명을 위한 비밀키
  private final SecretKey key;
  // JWT 만료시간
  private final long jwtExpiration;
  // Refresh Token 만료시간
  private final long refreshExpiration;

  // JWT + RefreshToken 만료시간 설정 및 암호화 알고리즘 설정(HMAC-SHA 알고리즘)
  public JwtTokenProvider(
      @Value("${jwt.secret:mySecretKeyForJwtTokenGenerationAndValidation}") String secretKey,
      @Value("${jwt.expiration:86400000}") long jwtExpiration,
      @Value("${jwt.refresh-expiration:604800000}") long refreshExpiration) {
    this.key = Keys.hmacShaKeyFor(secretKey.getBytes());
    this.jwtExpiration = jwtExpiration;
    this.refreshExpiration = refreshExpiration;
  }

  // Access Token 생성
  public String generateAccessToken(Authentication authentication) {
    User userPrincipal = (User) authentication.getPrincipal();
    Date expiryDate = new Date(System.currentTimeMillis() + jwtExpiration);

    String userId = String.valueOf(userPrincipal.getId());

    return Jwts.builder()
        .subject(userId)
        .issuedAt(new Date())
        .expiration(expiryDate)
        .signWith(key)
        .compact();
  }

  // Refresh Token 생성
  public String generateRefreshToken(Long userId) {
    Date expiryDate = new Date(System.currentTimeMillis() + refreshExpiration);

    return Jwts.builder()
        .subject(String.valueOf(userId))
        .issuedAt(new Date())
        .expiration(expiryDate)
        .signWith(key)
        .compact();
  }

  // 토큰 검증(서명, 만료 포함)
  public boolean validateToken(String token) {
    try {
      Jwts.parser().verifyWith(key).build().parseSignedClaims(token);
      return true;
    } catch (JwtException ex) {
      log.error("Invalid JWT Token : {}", ex.getMessage());
    } catch (IllegalArgumentException ex) {
      log.error("JWT claims string is empty");
    }
    return false;
  }

  // JWT에서 사용자 Id 추출
  public String getUserIdFromToken(String token) {
    Claims claims = Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload();
    return claims.getSubject();
  }

  // JWT에서 사용자 Id를 Long 타입으로 추출
  public Long getUserIdAsLongFromToken(String token) {
    String userIdStr = getUserIdFromToken(token);
    try {
      return Long.parseLong(userIdStr);
    } catch (NumberFormatException e) {
      throw new IllegalArgumentException("Invalid user ID in token: " + userIdStr, e);
    }
  }

  public long getRemainingMillis(String token) {
    Date expiration =
        Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload().getExpiration();
    return expiration.getTime() - System.currentTimeMillis();
  }

  /** 2FA를 위한 임시 토큰 생성 (5분 유효) */
  public String generateTempToken(Long userId, String email) {
    Date now = new Date();
    Date expiration = new Date(now.getTime() + 5 * 60 * 1000); // 5분

    return Jwts.builder()
        .subject(email)
        .claim("userId", userId.toString())
        .claim("type", "temp") // 임시 토큰 표시
        .issuedAt(now)
        .expiration(expiration)
        .signWith(key)
        .compact();
  }

  /** 임시 토큰에서 사용자 ID 추출 */
  public Long getUserIdFromTempToken(String token) {
    try {
      log.debug("Parsing temp token: {}", token);
      Claims claims = Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload();

      // 임시 토큰인지 확인
      String tokenType = claims.get("type", String.class);
      log.debug("Token type: {}", tokenType);
      if (!"temp".equals(tokenType)) {
        throw new IllegalArgumentException("Invalid token type");
      }

      String userIdStr = claims.get("userId", String.class);
      log.debug("UserIdStr from temp token: {}", userIdStr);
      return Long.parseLong(userIdStr);
    } catch (NumberFormatException e) {
      log.error("Number format error in temp token parsing: {}", e.getMessage());
      throw new IllegalArgumentException("Invalid user ID in temp token", e);
    } catch (Exception e) {
      log.error("Error parsing temp token: {}", e.getMessage());
      throw e;
    }
  }
}
