package com.example.communityservice.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "comments",
        indexes = {
            @Index(name = "idx_post_id", columnList = "post_id") // 특정 게시글의 댓글 조회
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Comments {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "comment_id")
    private Long commentId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id", nullable = false)
    private Posts post;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", nullable = false)
    private Authors authors;

    @Column(name = "content", nullable = false, columnDefinition = "TEXT")
    private String content;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    // 비즈니스 메서드
    public void updateContent(String content) {
        if (content.trim().isEmpty()) {
            throw new IllegalArgumentException("댓글 내용은 비어있을 수 없습니다");
        }
        if (content.trim().length() > 1000) {
            throw new IllegalArgumentException("댓글은 1000자를 초과할 수 없습니다");
        }
        this.content = content.trim();
    }

    // 작성자 정보 조회 편의 메서드
    public String getAuthorName() {
        return authors.getAuthorName();
    }

    public boolean isAnonymous() {
        return authors.getIsAnonymous();
    }
}