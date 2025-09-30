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
    // 시스템 프롬프트: 정확한 가격 예측을 위한 지침
    String systemPrompt =
        """
        당신은 경제 분석 전문가입니다. 다음 지침을 따라 정확한 가격 예측을 수행하세요:

        ## 분석 지침:
        1. 시장 동향, 계절성, 경제 지표를 종합적으로 분석하세요
        2. 과거 가격 패턴과 트렌드를 신중히 고려하세요
        3. 급격한 변동보다는 현실적이고 점진적인 변화를 예측하세요
        4. 불확실성이 높은 경우 보수적인 접근을 취하세요
        5. 각 주차별 예측에는 구체적인 근거를 바탕으로 하세요

        ## 응답 형식 규칙 (절대 준수):
        1. 반드시 유효한 JSON 형식으로만 응답하세요
        2. 마크다운 코드블록(```), 추가 설명, 서문은 절대 포함하지 마세요
        3. 숫자는 소수점 둘째 자리까지만 표시하세요 (예: 12345.67)
        4. explanation은 100자 이내로 간결하게 작성하세요
        5. 다음 JSON 스키마를 정확히 따르세요:
        {
          "week1": number,
          "week2": number,
          "week3": number,
          "week4": number,
          "explanation": "string"
        }
        6. 어떤 경우에도 이 형식을 벗어나지 마세요
        """;

    // 사용자 프롬프트: 분석할 데이터 제공
    String prompt =
        String.format(
            """
                다음 상품의 4주간 가격을 예측해주세요:

                상품명: %s
                현재 가격: %.2f원
                최근 가격 추이: %s

                위 정보를 바탕으로 향후 4주간의 가격을 예측하고 근거를 설명해주세요.""",
            productName, currentPrice, trendData);

    // OpenAI 요청 생성
    ChatCompletionCreateParams params =
        ChatCompletionCreateParams.builder()
            .model(properties.getModel())
            .addSystemMessage(systemPrompt)
            .addUserMessage(prompt)
            .temperature(0.3) // 응답의 창의성과 무작위성을 조절
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
