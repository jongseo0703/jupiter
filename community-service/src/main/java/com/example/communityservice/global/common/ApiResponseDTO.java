package com.example.communityservice.global.common;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

// API 응답을 위한 공통 래퍼 클래스
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApiResponseDTO<T> {

  private boolean success; // 성공 여부
  private String message; // 응답 메시지
  private T data; // 실제 데이터

  // 성공 응답 생성
  public static <T> ApiResponseDTO<T> success(T data) {
    return ApiResponseDTO.<T>builder().success(true).message("요청이 성공적으로 처리되었습니다.").data(data).build();
  }

  // 성공 응답 생성 (메시지 커스텀)
  public static <T> ApiResponseDTO<T> success(String message, T data) {
    return ApiResponseDTO.<T>builder().success(true).message(message).data(data).build();
  }

  // 실패 응답 생성
  public static <T> ApiResponseDTO<T> error(String message) {
    return ApiResponseDTO.<T>builder().success(false).message(message).data(null).build();
  }
}