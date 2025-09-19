package com.example.communityservice.global.exception;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

// 에러 응답용 DTO
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ErrorResponseDto {

  private boolean success;
  private String code;
  private String message;
  private LocalDateTime timestamp;

  public static ErrorResponseDto of(ErrorCode errorCode) {
    return ErrorResponseDto.builder()
        .success(false)
        .code(errorCode.getCode())
        .message(errorCode.getMessage())
        .timestamp(LocalDateTime.now())
        .build();
  }

  public static ErrorResponseDto of(ErrorCode errorCode, String message) {
    return ErrorResponseDto.builder()
        .success(false)
        .code(errorCode.getCode())
        .message(message)
        .timestamp(LocalDateTime.now())
        .build();
  }

  public static ErrorResponseDto of(String code, String message) {
    return ErrorResponseDto.builder()
        .success(false)
        .code(code)
        .message(message)
        .timestamp(LocalDateTime.now())
        .build();
  }
}
