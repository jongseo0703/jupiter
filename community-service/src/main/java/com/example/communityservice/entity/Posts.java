package com.example.communityservice.entity;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.*;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import lombok.*;

@Entity
@Table(
    name = "posts",
    indexes = {
      @Index(name = "idx_author_id", columnList = "author_id"), // 작성자별 게시글 조회
      @Index(name = "idx_category", columnList = "category"), // 카테고리별 게시글 목록
      @Index(name = "idx_created_at", columnList = "created_at") // 최신순 정렬
    })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Posts {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "post_id")
  private Long postId;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "author_id", nullable = false)
  private Authors authors;

  @Column(name = "category", nullable = false, length = 50)
  @Enumerated(EnumType.STRING)
  private PostCategory category;

  @Column(name = "title", nullable = false, length = 500)
  private String title;

  @Column(name = "content", nullable = false, columnDefinition = "TEXT")
  private String content;

  @Column(name = "views", nullable = false)
  @Builder.Default
  private Integer views = 0;

  @Column(name = "likes", nullable = false)
  @Builder.Default
  private Integer likes = 0;

  @Column(name = "tags", columnDefinition = "JSON")
  private String tags;

  @CreationTimestamp
  @Column(name = "created_at", nullable = false, updatable = false)
  private LocalDateTime createdAt;

  @UpdateTimestamp
  @Column(name = "updated_at", nullable = false)
  private LocalDateTime updatedAt;

  // 연관관계 매핑
  @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
  @Builder.Default
  private List<Comments> comments = new ArrayList<>();

  @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
  @Builder.Default
  private List<PostAttachments> attachments = new ArrayList<>();

  // 비즈니스 메서드
  public void increaseViews() {
    this.views++;
  }

  public void increaseLikes() {
    this.likes++;
  }

  public void updatePost(String title, String content, PostCategory category, String tags) {
    this.title = title;
    this.content = content;
    this.category = category;
    this.tags = tags;
  }

  public int getCommentsCount() {
    return comments.size();
  }
}
