package com.example.communityservice.global.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/** 웹 MVC 설정 - 정적 리소스 핸들링 등 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

  @Value("${file.upload.path}")
  private String uploadPath;

  @Override
  public void addResourceHandlers(ResourceHandlerRegistry registry) {
    // /uploads/** 경로로 요청되는 파일들을 실제 업로드 디렉토리에서 서빙
    registry
        .addResourceHandler("/uploads/**")
        .addResourceLocations("file:" + uploadPath + "/")
        .setCachePeriod(3600); // 1시간 캐시
  }
}
