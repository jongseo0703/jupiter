package com.example.authservice.global.common;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/** 공통 API 응답 포맷을 정의하는 클래스. 모든 컨트롤러 응답은 이 클래스를 통해 감싸서 반환되며, 성공/실패 여부, 메시지, 데이터, 타임스탬프를 포함함. */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApiResponse<T> {
  private String result;
  private String message;
  private T data;
  private LocalDateTime timestamp;

  /** 성공 응답을 생성함. */
  public static <T> ApiResponse<T> success(String message, T data) {
    return new ApiResponse<>("SUCCESS", message, data, LocalDateTime.now());
  }

  /** 에러 응답을 생성함. (데이터 없음) */
  public static <T> ApiResponse<T> error(String message) {
    return new ApiResponse<>("ERROR", message, null, LocalDateTime.now());
  }

  /** 에러 응답을 생성함 (데이터 포함) */
  public static <T> ApiResponse<T> error(String message, T data) {
    return new ApiResponse<>("ERROR", message, data, LocalDateTime.now());
  }
}
