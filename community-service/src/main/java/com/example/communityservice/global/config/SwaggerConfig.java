package com.example.communityservice.global.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.servers.Server;

// Swagger API 문서 설정
@Configuration
public class SwaggerConfig {

  @Bean
  public OpenAPI openAPI() {
    return new OpenAPI()
        .components(new Components())
        .info(apiInfo())
        .addServersItem(new Server().url("/").description("Community Service"));
  }

  private Info apiInfo() {
    return new Info()
        .title("Community Service API")
        .description("커뮤니티 서비스 RESTful API 문서")
        .version("1.0.0");
  }
}
