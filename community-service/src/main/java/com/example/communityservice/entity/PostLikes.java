package com.example.communityservice.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;

import org.hibernate.annotations.CreationTimestamp;

import lombok.*;

/** 게시글 좋아요 엔티티 로그인한 사용자가 게시글에 누른 좋아요 정보를 저장 한 사용자당 하나의 게시글에 최대 1개의 좋아요만 가능 (중복 방지) */
@Entity
@Table(
    name = "post_likes",
    indexes = {
      @Index(name = "idx_user_id", columnList = "user_id"), // 사용자별 좋아요 목록 조회용
      @Index(name = "idx_post_id", columnList = "post_id"), // 게시글별 좋아요 수 조회용
      @Index(name = "idx_user_post", columnList = "user_id, post_id") // 중복 좋아요 체크용
    },
    uniqueConstraints = {
      @UniqueConstraint(
          name = "uk_user_post_like",
          columnNames = {"user_id", "post_id"}) // 사용자당 게시글당 하나의 좋아요만 허용
    })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PostLikes {

  /** 좋아요 고유 ID */
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "like_id")
  private Long likeId;

  /** auth-service의 사용자 ID (로그인한 회원만 좋아요 가능) */
  @Column(name = "user_id", nullable = false)
  private Long userId;

  /** 좋아요 대상 게시글 */
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "post_id", nullable = false)
  private Posts post;

  /** 좋아요 생성 시간 (사용자별 좋아요 목록 시간순 정렬용) */
  @CreationTimestamp
  @Column(name = "created_at", nullable = false, updatable = false)
  private LocalDateTime createdAt;

  /**
   * 좋아요 생성 팩토리 메서드
   *
   * @param userId 사용자 ID
   * @param post 게시글 엔티티
   * @return 생성된 PostLikes 엔티티
   */
  public static PostLikes create(Long userId, Posts post) {
    return PostLikes.builder().userId(userId).post(post).build();
  }
}
