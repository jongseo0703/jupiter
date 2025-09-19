package com.example.gptservice.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import lombok.Getter;
import lombok.Setter;

/**
 * @ConfigurationProperties를 이용해 application-dev.properties에 있는 openai.* 값을 자바 객체에 자동 바인딩
 */
@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "openai") // openai.* 값 매핑
public class OpenAiProperties {
  private String apiKey;
  private String apiUrl;
  private String model;
}
