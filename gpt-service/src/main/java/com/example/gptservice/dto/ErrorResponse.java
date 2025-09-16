package com.example.gptservice.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ErrorResponse {
  private String errorCode;
  private String message;
  private LocalDateTime timestamp;

  public ErrorResponse(String errorCode, String message) {
    this.errorCode = errorCode;
    this.message = message;
    this.timestamp = LocalDateTime.now();
  }
}
