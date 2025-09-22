package com.example.communityservice.dto.auth;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** 인증 서비스에서 받은 사용자 기본 정보 DTO 사용자 식별에 필요한 ID, 사용자명, 이메일 포함 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class UserInfoResponse {
  private Long id;
  private String username;
  private String email;
}
