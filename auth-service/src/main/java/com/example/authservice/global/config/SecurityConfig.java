package com.example.authservice.global.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.example.authservice.auth.oauth.handler.OAuth2AuthenticationSuccessHandler;
import com.example.authservice.auth.security.JwtAccessDeniedHandler;
import com.example.authservice.auth.security.JwtAuthenticationEntryPoint;
import com.example.authservice.auth.security.JwtAuthenticationFilter;

import lombok.RequiredArgsConstructor;

/** 보안을 담당하는 SecurityConfig임. */
@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

  private final JwtAuthenticationFilter jwtAuthenticationFilter;
  private final JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;
  private final JwtAccessDeniedHandler jwtAccessDeniedHandler;
  private final OAuth2AuthenticationSuccessHandler oAuth2AuthenticationSuccessHandler;

  // BCrypt방식을 사용하는 PasswordEncoder 등록
  @Bean
  public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
  }

  // AuthenticationManager 등록
  @Bean
  public AuthenticationManager authenticationManager(AuthenticationConfiguration config)
      throws Exception {
    return config.getAuthenticationManager();
  }

  // Spring Security의 처리를 담당함.
  @Bean
  public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    return http.csrf(AbstractHttpConfigurer::disable)
        .cors(AbstractHttpConfigurer::disable)
        .sessionManagement(
            session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .authorizeHttpRequests(
            auth ->
                auth
                    // 공개 엔드포인트
                    .requestMatchers("/api/v1/auth/**")
                    .permitAll()
                    .requestMatchers("/h2-console/**")
                    .permitAll()
                    .requestMatchers("/actuator/**")
                    .permitAll()
                    // 서비스 간 통신을 위한 엔드포인트
                    .requestMatchers("/api/v1/favorites/products/*/users")
                    .permitAll()
                    .requestMatchers("/api/notification-settings/**")
                    .permitAll()

                    // 웹 페이지들
                    .requestMatchers("/", "/login", "/register", "/dashboard")
                    .permitAll()

                    // OAuth 엔드포인트
                    .requestMatchers("/oauth2/**", "/login/oauth2/**")
                    .permitAll()

                    // Swagger/OpenAPI 문서
                    .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html")
                    .permitAll()

                    // 관리자 전용 엔드포인트
                    .requestMatchers("/api/v1/admin/**")
                    .hasRole("ADMIN")

                    // 나머지는 인증 필요
                    .anyRequest()
                    .authenticated())
        .oauth2Login(
            oauth2 ->
                oauth2
                    .successHandler(oAuth2AuthenticationSuccessHandler)
                    .failureUrl("/api/v1/auth/oauth/failure?error=true"))
        .exceptionHandling(
            exceptions ->
                exceptions
                    .authenticationEntryPoint(jwtAuthenticationEntryPoint)
                    .accessDeniedHandler(jwtAccessDeniedHandler))
        .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
        .build();
  }
}
