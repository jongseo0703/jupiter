package com.example.gptservice.config;

import jakarta.annotation.PostConstruct;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.openai.client.OpenAIClient;
import com.openai.client.okhttp.OpenAIOkHttpClient;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/** OpenAI SDK에서 쓸 수 있는 OpenAI 객체를 Bean으로 등록 */
@Slf4j
@RequiredArgsConstructor
@Configuration
public class OpenAiConfig {

  private final OpenAiProperties properties;

  @Bean
  public OpenAIClient openAIClient() {
    // OpenAI SDK(Software Development Kit) 클라이언트 생성
    return OpenAIOkHttpClient.builder()
        .apiKey(properties.getApiKey()) // API 키 주입
        .baseUrl(properties.getApiUrl())
        .build();
  }

  @PostConstruct
  public void checkKey() {
    log.debug("✅ Loaded API Key = {}", properties.getApiKey());
  }
}
