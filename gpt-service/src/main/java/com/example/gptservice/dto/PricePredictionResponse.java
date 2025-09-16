package com.example.gptservice.dto;

import lombok.Getter;
import lombok.Setter;

/** AI 응답(JSON 문자열)을 매핑할 DTO */
@Getter
@Setter
public class PricePredictionResponse {
  private int week1;
  private int week2;
  private int week3;
  private int week4;
  private String explanation;
}
