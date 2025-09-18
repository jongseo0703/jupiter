package com.example.communityservice.dto.posts;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import com.example.communityservice.entity.PostCategory;
import com.example.communityservice.entity.Posts;

/**
 * 게시글 목록 조회용 요약 DTO
 * - 게시글 목록에서 보여줄 기본 정보만 포함
 * - content(내용)는 제외하여 데이터 전송량 최적화
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PostsSummaryDTO {

  private Long postId;
  private PostCategory category;
  private String title;
  private String authorName;
  private Boolean isAnonymous;
  private Integer views;
  private Integer likes;
  private Integer commentsCount;
  private LocalDateTime createdAt;

  /**
   * Posts 엔티티를 PostsSummaryDto로 변환하는 정적 팩토리 메서드
   * @param post 변환할 Posts 엔티티
   * @return PostsSummaryDto 객체
   */
  public static PostsSummaryDTO from(Posts post) {
    return com.example.communityservice.dto.posts.PostsSummaryDTO.builder()
        .postId(post.getPostId())
        .category(post.getCategory())
        .title(post.getTitle())
        .authorName(post.getAuthors().getDisplayAuthorName())
        .isAnonymous(post.getAuthors().getIsAnonymous())
        .views(post.getViews())
        .likes(post.getLikes())
        .commentsCount(post.getCommentsCount())
        .createdAt(post.getCreatedAt())
        .build();
  }
}