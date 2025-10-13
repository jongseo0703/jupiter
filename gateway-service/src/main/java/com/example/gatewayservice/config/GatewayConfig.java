package com.example.gatewayservice.config;

import com.example.gatewayservice.filter.JwtAuthenticationFilter;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GatewayConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public GatewayConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
        return builder.routes()
                .route("auth-service", r -> r.path("/auth/**")
                        .filters(f -> f.stripPrefix(1))
                        .uri("http://localhost:8081"))
                .route("gpt-service", r -> r.path("/gpt/**")
                        .filters(f -> f.stripPrefix(1))
                        .uri("http://localhost:8082"))
                .route("crawling-service", r -> r.path("/crawling/**")
                        .uri("http://localhost:8083"))
                .route("community-service", r -> r.path("/community/**")
                        .filters(f -> f.stripPrefix(1))
                        .uri("http://localhost:8084"))
                .route("community-uploads", r -> r.path("/uploads/**")
                        .uri("http://localhost:8084"))
                // 추천 API - JWT 인증 필요
                .route("product-recommendations", r -> r.path("/product/api/recommendations/comprehensive/**")
                        .filters(f -> f.stripPrefix(1)
                                .filter(jwtAuthenticationFilter))
                        .uri("http://localhost:8085"))
                // 나머지 product-service - 인증 불필요
                .route("product-service", r -> r.path("/product/**")
                        .filters(f -> f.stripPrefix(1))
                        .uri("http://localhost:8085"))
                .build();
    }
}