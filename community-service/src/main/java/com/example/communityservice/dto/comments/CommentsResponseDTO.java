package com.example.communityservice.dto.comments;

import java.time.LocalDateTime;

import com.example.communityservice.entity.Comments;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** 댓글 응답용 DTO - 댓글 정보를 클라이언트에게 전송할 때 사용 */
@Schema(description = "댓글 조회 응답 DTO")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommentsResponseDTO {

  @Schema(description = "댓글 ID", example = "1")
  private Long commentId;

  @Schema(description = "게시글 ID", example = "1")
  private Long postId;

  @Schema(description = "댓글 내용", example = "좋은 정보 감사합니다! 저도 한번 시도해보겠어요.")
  private String content;

  @Schema(description = "작성자명", example = "익명456")
  private String authorName;

  @Schema(description = "익명 사용자 여부", example = "true")
  private Boolean isAnonymous;

  @Schema(description = "작성일시", example = "2024-01-15T10:45:00")
  private LocalDateTime createdAt;

  @Schema(description = "수정일시", example = "2024-01-15T10:45:00")
  private LocalDateTime updatedAt;

  /**
   * Comments 엔티티를 CommentsResponseDTO로 변환하는 정적 팩토리 메서드
   *
   * @param comment 변환할 Comments 엔티티
   * @return CommentsResponseDTO 객체
   */
  public static CommentsResponseDTO from(Comments comment) {
    return CommentsResponseDTO.builder()
        .commentId(comment.getCommentId())
        .postId(comment.getPost().getPostId())
        .content(comment.getContent())
        .authorName(comment.getAuthorName())
        .isAnonymous(comment.isAnonymous())
        .createdAt(comment.getCreatedAt())
        .updatedAt(comment.getUpdatedAt())
        .build();
  }
}
