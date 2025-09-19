package com.example.communityservice.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** 익명 사용자 인증 요청용 DTO 인증에 필요한 필드만 검증, 불필요한 필드 요구하지 않음 */
@Schema(description = "익명 사용자 인증 요청 DTO")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnonymousAuthRequestDTO {

  @Schema(description = "익명 사용자 이메일", example = "anonymous@example.com")
  @NotBlank(message = "이메일은 필수입니다")
  @Email(message = "올바른 이메일 형식이 아닙니다")
  private String anonymousEmail;

  @Schema(description = "익명 사용자 비밀번호", example = "password123")
  @NotBlank(message = "비밀번호는 필수입니다")
  private String anonymousPassword;
}
