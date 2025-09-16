package com.example.gptservice.service;

import org.springframework.stereotype.Service;

import com.example.gptservice.config.OpenAiProperties;
import com.example.gptservice.dto.PricePredictionResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.openai.client.OpenAIClient;
import com.openai.models.chat.completions.ChatCompletion;
import com.openai.models.chat.completions.ChatCompletionCreateParams;

import lombok.RequiredArgsConstructor;

/** AI 응답 → Jackson으로 DTO 변환 */
@RequiredArgsConstructor
@Service
public class PricePredictionService {
  private final OpenAIClient openAIClient;
  private final OpenAiProperties properties; // 객체에 바인딩 시킨 properties 값 사용
  private final ObjectMapper objectMapper = new ObjectMapper(); // Jackson 변환기

  public PricePredictionResponse predictPrice(
      String productName, double currentPrice, String trendData) throws Exception {
    // 입력 값 검증
    if (productName == null || productName.trim().isEmpty()) {
      throw new IllegalArgumentException("상품명은 필수입니다.");
    }
    if (currentPrice <= 0) {
      throw new IllegalArgumentException("현재 가격은 0보다 커야 합니다.");
    }
    if (trendData == null || trendData.trim().isEmpty()) {
      throw new IllegalArgumentException("가격 추이 데이터는 필수입니다.");
    }
    // AI에게 줄 프롬프트: 반드시 JSON 형식으로 응답하도록 강제
    String prompt =
        String.format(
            """
                상품명: %s
                현재 가격: %.2f
                최근 가격 추이: %s
                → 앞으로 4주간 예측 가격을 반드시 JSON 형태로만 출력해:
                { "week1": ..., "week2": ..., "week3": ..., "week4": ..., "explanation": "..." }""",
            productName, currentPrice, trendData);

    // OpenAI 요청 생성
    ChatCompletionCreateParams params =
        ChatCompletionCreateParams.builder()
            .model(properties.getModel())
            .addUserMessage(prompt)
            .build();

    // OpenAI API 호출
    ChatCompletion completion = openAIClient.chat().completions().create(params);
    // 첫번째 응답 텍스트 꺼내기 (Optional<String> → String)
    String content = completion.choices().getFirst().message().content().orElse("");

    // OpenAI API가 응답을 마크다운 코드블록으로 감싸서 보낼 때를 대비한 안전 장치
    if (content.startsWith("```json")) {
      content = content.substring(7, content.length() - 3).trim();
    } else if (content.startsWith("```")) {
      content = content.substring(3, content.length() - 3).trim();
    }

    // Jackson으로 JSON 문자열 → DTO 변환
    return objectMapper.readValue(content, PricePredictionResponse.class);
  }
}
