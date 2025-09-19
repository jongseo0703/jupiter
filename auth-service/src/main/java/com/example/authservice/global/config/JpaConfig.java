package com.example.authservice.global.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

/** JPA의 설정을 담당하는 JpaConfig */
@Configuration
@EnableJpaAuditing
public class JpaConfig {}
