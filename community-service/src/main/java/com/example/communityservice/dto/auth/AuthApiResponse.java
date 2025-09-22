package com.example.communityservice.dto.auth;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * auth-service로부터 받는 API 응답을 감싸는 DTO
 * API 호출의 전반적인 결과(성공/실패), 메시지, 그리고 실제 데이터 페이로드 포함
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class AuthApiResponse {
  private String result;
  private String message;
  private UserInfoResponse data;

  public boolean isSuccess() {
    return "SUCCESS".equalsIgnoreCase(result);
  }
}
