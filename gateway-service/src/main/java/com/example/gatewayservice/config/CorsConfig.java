package com.example.gatewayservice.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsWebFilter;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;

@Configuration
public class CorsConfig {

    @Bean
    public CorsWebFilter corsWebFilter() {
        CorsConfiguration corsConfig = new CorsConfiguration();
        // 개발 환경에서 일반적인 Frontend 포트들만 허용
        corsConfig.addAllowedOrigin("http://localhost:3000");  // React 기본 포트
        corsConfig.addAllowedOrigin("http://localhost:3001");  // 현재 사용 포트
        corsConfig.addAllowedOrigin("http://localhost:3002");  // 포트 충돌 시
        corsConfig.addAllowedOrigin("http://localhost:3003");  // 포트 충돌 시
        corsConfig.addAllowedOrigin("http://localhost:5173");  // Vite 기본 포트
        corsConfig.addAllowedOrigin("http://localhost:5174");  // Vite 포트 충돌 시
        corsConfig.addAllowedMethod("GET");
        corsConfig.addAllowedMethod("POST");
        corsConfig.addAllowedMethod("PUT");
        corsConfig.addAllowedMethod("DELETE");
        corsConfig.addAllowedMethod("OPTIONS");
        corsConfig.addAllowedHeader("*");
        corsConfig.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", corsConfig);

        return new CorsWebFilter(source);
    }
}