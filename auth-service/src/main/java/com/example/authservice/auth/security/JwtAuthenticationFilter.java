package com.example.authservice.auth.security;

import java.io.IOException;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import com.example.authservice.auth.token.BlacklistTokenService;
import com.example.authservice.user.entity.User;
import com.example.authservice.user.repository.UserRepository;

import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * JWT 인증 필터임.
 *
 * <p>- 요청마다 한 번 실행 - Authorization 헤더에서 JWT를 추출하고 유효성을 검사 - 유효한 토큰이면 SecurityContext에 인증 정보 설정
 *
 * <p>사용 흐름: 1. 요청 헤더에서 JWT 추출 2. 토큰 유효성 검사 3. 토큰에서 사용자 ID 추출 4. DB에서 사용자 정보 조회 5. Spring Security
 * Authentication 객체 생성 및 SecurityContext에 설정
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

  private final JwtTokenProvider jwtTokenProvider;
  private final UserRepository userRepository;
  private final BlacklistTokenService blacklistTokenService;

  @Override
  protected void doFilterInternal(
      @NonNull HttpServletRequest request,
      @NonNull HttpServletResponse response,
      @NonNull FilterChain filterChain)
      throws ServletException, IOException {

    try {
      // 요청에서 JWT 토큰 추출
      String jwt = getJwtFromRequest(request);

      log.debug("🔍 JWT Filter - Token extracted: {}", jwt != null ? "present" : "null");

      // 토큰이 존재하고 유효한 경우 인증 처리
      if (StringUtils.hasText(jwt) && jwtTokenProvider.validateToken(jwt)) {

        // 블랙리스트에 있는지 확인
        if (blacklistTokenService.isBlacklisted(jwt)) {
          log.warn("⚠️ This token is blacklisted and cannot be used.");
          throw new BadCredentialsException("This token is blacklisted and cannot be used.");
        } else {
          log.debug("✅ JWT Filter - Token validation successful");

          // 토큰에서 사용자 ID 추출
          Long userId = jwtTokenProvider.getUserIdAsLongFromToken(jwt);
          log.debug("🔍 JWT Filter - User ID extracted: {}", userId);

          // 사용자 ID로 사용자 상세 정보 로드
          User user =
              userRepository
                  .findById(userId)
                  .orElseThrow(
                      () -> new UsernameNotFoundException("User not found with id: " + userId));

          log.debug("✅ JWT Filter - User found: {}", user.getUsername());

          // Spring Security 인증 객체 생성
          UsernamePasswordAuthenticationToken authentication =
              new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities());

          // 요청 상세 정보 설정
          authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

          // SecurityContext에 인증 정보 설정 (강화된 설정)
          SecurityContextHolder.getContext().setAuthentication(authentication);

          log.debug("🔐 JWT authentication successful for user: {}", user.getUsername());
          log.debug(
              "🔐 SecurityContext set: {}",
              SecurityContextHolder.getContext().getAuthentication().getName());
        }
      }
    } catch (Exception ex) {
      log.error("Could not set user authentication in security context : {}", ex.getMessage());
    }

    filterChain.doFilter(request, response);
  }

  private String getJwtFromRequest(HttpServletRequest request) {
    String bearerToken = request.getHeader("Authorization");
    if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
      return bearerToken.substring(7);
    }
    return null;
  }
}
