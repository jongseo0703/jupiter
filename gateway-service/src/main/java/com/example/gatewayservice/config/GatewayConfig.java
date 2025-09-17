package com.example.gatewayservice.config;

import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GatewayConfig {

    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
        return builder.routes()
                .route("auth-service", r -> r.path("/auth/**")
                        .uri("http://localhost:8081"))
                .route("gpt-service", r -> r.path("/gpt/**")
                        .filters(f -> f.stripPrefix(1))
                        .uri("http://localhost:8082"))
                .route("crawling-service", r -> r.path("/crawling/**")
                        .uri("http://localhost:8083"))
                .route("community-service", r -> r.path("/community/**")
                        .uri("http://localhost:8084"))
                .build();
    }
}