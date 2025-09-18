package com.example.communityservice.dto.comments;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** 댓글 생성/수정 요청용 DTO - 클라이언트에서 서버로 댓글 데이터를 전송할 때 사용 - Bean Validation 어노테이션으로 입력값 검증 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommentsRequestDTO {

  @NotNull(message = "게시글 ID는 필수입니다")
  private Long postId;

  @NotBlank(message = "댓글 내용은 필수입니다")
  @Size(max = 1000, message = "댓글은 1000자를 초과할 수 없습니다")
  private String content;

  // 회원 작성자 정보 (회원인 경우)
  private Long authorId;

  // 익명 작성자 정보 (익명인 경우)
  private Boolean isAnonymous;

  @Size(max = 100, message = "작성자명은 100자를 초과할 수 없습니다")
  private String authorName;

  private String anonymousEmail;

  private String anonymousPassword;
}
