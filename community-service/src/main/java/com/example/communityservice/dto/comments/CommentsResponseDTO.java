package com.example.communityservice.dto.comments;

import java.time.LocalDateTime;

import com.example.communityservice.entity.Comments;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** 댓글 응답용 DTO - 댓글 정보를 클라이언트에게 전송할 때 사용 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommentsResponseDTO {

  private Long commentId;
  private Long postId;
  private String content;
  private String authorName;
  private Boolean isAnonymous;
  private LocalDateTime createdAt;
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
