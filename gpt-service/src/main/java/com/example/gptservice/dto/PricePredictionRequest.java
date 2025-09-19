package com.example.gptservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PricePredictionRequest {

  @NotBlank(message = "상품명은 필수입니다.")
  private String productName;

  @NotNull(message = "현재 가격은 필수입니다.")
  @Positive(message = "현재 가격은 양수여야 합니다.")
  private Double currentPrice;

  @NotBlank(message = "가격 추이 데이터는 필수입니다.")
  private String trendData;
}
