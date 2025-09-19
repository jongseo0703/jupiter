package com.example.authservice.auth.oauth.service;

import java.util.Map;
import java.util.Optional;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.authservice.admin.service.AdminNotificationService;
import com.example.authservice.auth.dto.LoginResponse;
import com.example.authservice.auth.oauth.dto.OAuthUserInfo;
import com.example.authservice.auth.security.JwtTokenProvider;
import com.example.authservice.auth.token.RefreshTokenService;
import com.example.authservice.user.entity.Role;
import com.example.authservice.user.entity.User;
import com.example.authservice.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class OAuthService {

  private final UserRepository userRepository;
  private final JwtTokenProvider jwtTokenProvider;
  private final RefreshTokenService refreshTokenService;
  private final AdminNotificationService adminNotificationService;

  @Transactional
  public LoginResponse processOAuthLogin(OAuth2User oAuth2User, String provider) {
    log.info("Processing OAuth login for provider: {}", provider);

    // OAuth 사용자 정보 추출
    OAuthUserInfo oAuthUserInfo = extractUserInfo(oAuth2User, provider);
    log.info(
        "Extracted OAuth user info: email={}, provider={}",
        oAuthUserInfo.email(),
        oAuthUserInfo.provider());

    // 기존 사용자 확인 또는 새 사용자 생성
    User user = findOrCreateUser(oAuthUserInfo);

    // JWT 토큰 생성
    Authentication authentication =
        new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities());

    String accessToken = jwtTokenProvider.generateAccessToken(authentication);
    String refreshToken = jwtTokenProvider.generateRefreshToken(user.getId());

    // Refresh Token 저장
    refreshTokenService.saveTokenInfo(user.getEmail(), refreshToken, accessToken);

    log.info("OAuth login successful for user: {}", user.getUsername());
    return LoginResponse.of(accessToken, refreshToken);
  }

  private OAuthUserInfo extractUserInfo(OAuth2User oAuth2User, String provider) {
    Map<String, Object> attributes = oAuth2User.getAttributes();

    return switch (provider.toLowerCase()) {
      case "google" -> {
        String oauthId = (String) attributes.get("sub");
        String email = (String) attributes.get("email");
        String name = (String) attributes.get("name");
        yield OAuthUserInfo.fromGoogle(oauthId, email, name);
      }
      case "naver" -> {
        @SuppressWarnings("unchecked")
        Map<String, Object> response = (Map<String, Object>) attributes.get("response");
        String oauthId = (String) response.get("id");
        String email = (String) response.get("email");
        String name = (String) response.get("name");
        yield OAuthUserInfo.fromNaver(oauthId, email, name);
      }
      case "kakao" -> {
        String oauthId = String.valueOf(attributes.get("id"));
        @SuppressWarnings("unchecked")
        Map<String, Object> properties = (Map<String, Object>) attributes.get("properties");
        @SuppressWarnings("unchecked")
        Map<String, Object> kakaoAccount = (Map<String, Object>) attributes.get("kakao_account");

        String name = properties != null ? (String) properties.get("nickname") : null;
        String email = kakaoAccount != null ? (String) kakaoAccount.get("email") : null;
        // 카카오에서 이메일을 제공하지 않는 경우 대체 이메일 생성
        if (email == null || email.isEmpty()) {
          email = "kakao_" + oauthId + "@oauth.local";
        }
        yield OAuthUserInfo.fromKakao(oauthId, email, name);
      }
      default -> throw new IllegalArgumentException("Unsupported OAuth provider: " + provider);
    };
  }

  private User findOrCreateUser(OAuthUserInfo oAuthUserInfo) {
    Optional<User> existingUser = userRepository.findByEmail(oAuthUserInfo.email());

    if (existingUser.isPresent()) {
      log.info("Found existing user: {}", existingUser.get().getUsername());
      return existingUser.get();
    }

    // 새 사용자 생성
    User newUser =
        User.builder()
            .username(generateUsername(oAuthUserInfo.name(), oAuthUserInfo.email()))
            .email(oAuthUserInfo.email())
            .password("OAUTH_USER_NO_PASSWORD_12345678") // OAuth 사용자용 더미 패스워드
            .role(Role.USER)
            .enabled(true)
            .accountNonExpired(true)
            .accountNonLocked(true)
            .credentialsNonExpired(true)
            .build();

    User savedUser = userRepository.save(newUser);
    log.info("Created new OAuth user: {}", savedUser.getUsername());

    // 관리자에게 OAuth 회원가입 알림 생성
    adminNotificationService.createUserRegistrationNotification(
        savedUser.getId(), savedUser.getUsername());

    return savedUser;
  }

  private String generateUsername(String name, String email) {
    // 이름이 있으면 사용, 없으면 이메일의 로컬 파트 사용
    String baseUsername =
        (name != null && !name.trim().isEmpty())
            ? name.replaceAll("\\s+", "").toLowerCase()
            : email.split("@")[0];

    if (baseUsername.length() < 3) {
      baseUsername = "user" + baseUsername;
    }

    if (baseUsername.length() > 50) {
      baseUsername = baseUsername.substring(0, 50);
    }

    // 중복 확인 및 처리
    String username = baseUsername;
    int counter = 1;
    while (userRepository.existsByUsername(username)) {
      // 카운터 추가 시에도 50자 제한 확인
      String candidateUsername = baseUsername + counter;
      if (candidateUsername.length() > 50) {
        // 기본 이름을 줄여서 카운터 공간 확보
        int maxBaseLength = 50 - String.valueOf(counter).length();
        candidateUsername = baseUsername.substring(0, maxBaseLength) + counter;
      }
      username = candidateUsername;

      counter++;
    }

    return username;
  }
}
