package com.example.communityservice.dto.posts;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import com.example.communityservice.entity.PostCategory;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** 게시글 생성/수정 요청용 DTO - 클라이언트에서 서버로 게시글 데이터를 전송할 때 사용 - Bean Validation 어노테이션으로 입력값 검증 */
@Schema(description = "게시글 작성/수정 요청 DTO")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PostsRequestDTO {

  @Schema(description = "게시글 카테고리", example = "FREE_BOARD")
  @NotNull(message = "카테고리는 필수입니다")
  private PostCategory category;

  @Schema(description = "게시글 제목", example = "맛있는 전통주 추천해주세요!", maxLength = 500)
  @NotBlank(message = "제목은 필수입니다")
  @Size(max = 500, message = "제목은 500자를 초과할 수 없습니다")
  private String title;

  @Schema(description = "게시글 내용", example = "안녕하세요! 전통주 초보자인데 추천해주실 만한 전통주가 있을까요?")
  @NotBlank(message = "내용은 필수입니다")
  private String content;

  @Schema(description = "게시글 태그", example = "#전통주 #추천 #초보자", maxLength = 1000)
  @Size(max = 1000, message = "태그는 1000자를 초과할 수 없습니다")
  private String tags;

  @Schema(description = "회원 작성자 ID (회원인 경우)", example = "123")
  private Long authorId;

  @Schema(description = "익명 사용자 여부", example = "true")
  private Boolean isAnonymous;

  @Schema(description = "작성자명 (익명인 경우)", example = "익명123", maxLength = 100)
  @Size(max = 100, message = "작성자명은 100자를 초과할 수 없습니다")
  private String authorName;

  @Schema(description = "익명 사용자 이메일", example = "anonymous@example.com")
  private String anonymousEmail;

  @Schema(description = "익명 사용자 비밀번호", example = "password123")
  private String anonymousPassword;
}
