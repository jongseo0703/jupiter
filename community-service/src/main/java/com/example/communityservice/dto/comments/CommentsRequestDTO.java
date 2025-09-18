package com.example.communityservice.dto.comments;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** 댓글 생성/수정 요청용 DTO - 클라이언트에서 서버로 댓글 데이터를 전송할 때 사용 - Bean Validation 어노테이션으로 입력값 검증 */
@Schema(description = "댓글 작성/수정 요청 DTO")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommentsRequestDTO {

  @Schema(description = "게시글 ID", example = "1")
  @NotNull(message = "게시글 ID는 필수입니다")
  private Long postId;

  @Schema(description = "댓글 내용", example = "좋은 정보 감사합니다! 저도 한번 시도해보겠어요.", maxLength = 1000)
  @NotBlank(message = "댓글 내용은 필수입니다")
  @Size(max = 1000, message = "댓글은 1000자를 초과할 수 없습니다")
  private String content;

  @Schema(description = "회원 작성자 ID (회원인 경우)", example = "123")
  private Long authorId;

  @Schema(description = "익명 사용자 여부", example = "true")
  private Boolean isAnonymous;

  @Schema(description = "작성자명 (익명인 경우)", example = "익명456", maxLength = 100)
  @Size(max = 100, message = "작성자명은 100자를 초과할 수 없습니다")
  private String authorName;

  @Schema(description = "익명 사용자 이메일", example = "commenter@example.com")
  private String anonymousEmail;

  @Schema(description = "익명 사용자 비밀번호", example = "password456")
  private String anonymousPassword;
}
