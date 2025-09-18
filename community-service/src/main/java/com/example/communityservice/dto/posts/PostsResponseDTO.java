package com.example.communityservice.dto.posts;

import java.time.LocalDateTime;
import java.util.List;

import com.example.communityservice.dto.comments.CommentsResponseDTO;
import com.example.communityservice.entity.PostCategory;
import com.example.communityservice.entity.Posts;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** 게시글 상세 조회용 응답 DTO - 게시글의 모든 정보를 포함하여 클라이언트에게 전송 - 상세 보기 페이지에서 사용 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PostsResponseDTO {

  private Long postId;
  private PostCategory category;
  private String title;
  private String content;
  private String authorName;
  private Boolean isAnonymous;
  private Integer views;
  private Integer likes;
  private Integer commentsCount;
  private String tags;
  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;
  private List<CommentsResponseDTO> comments; // 댓글 목록

  /**
   * Posts 엔티티를 PostsResponseDto로 변환하는 정적 팩토리 메서드
   *
   * @param post 변환할 Posts 엔티티
   * @return PostsResponseDto 객체
   */
  public static PostsResponseDTO from(Posts post) {
    return PostsResponseDTO.builder()
        .postId(post.getPostId())
        .category(post.getCategory())
        .title(post.getTitle())
        .content(post.getContent())
        .authorName(post.getAuthors().getDisplayAuthorName())
        .isAnonymous(post.getAuthors().getIsAnonymous())
        .views(post.getViews())
        .likes(post.getLikes())
        .commentsCount(post.getCommentsCount())
        .tags(post.getTags())
        .createdAt(post.getCreatedAt())
        .updatedAt(post.getUpdatedAt())
        .build();
  }
}
