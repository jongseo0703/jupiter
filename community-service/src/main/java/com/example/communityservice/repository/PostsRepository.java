package com.example.communityservice.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.communityservice.entity.PostCategory;
import com.example.communityservice.entity.Posts;

// Posts 엔티티 데이터베이스 접근 인터페이스
@Repository
public interface PostsRepository extends JpaRepository<Posts, Long> {

  // 카테고리별 게시글 목록 조회 (최신순)
  Page<Posts> findByCategoryOrderByCreatedAtDesc(PostCategory category, Pageable pageable);

  // 전체 게시글 목록 조회 (최신순)
  Page<Posts> findAllByOrderByCreatedAtDesc(Pageable pageable);

  // 특정 작성자의 게시글 목록 조회
  List<Posts> findByAuthors_AuthorId(Long authorId);

  // 제목/내용으로 게시글 검색
  @Query("SELECT p FROM Posts p WHERE p.title LIKE %:keyword% OR p.content LIKE %:keyword%")
  Page<Posts> findByTitleContainingOrContentContaining(
      @Param("keyword") String keyword, Pageable pageable);

  // 조회수 증가
  @Modifying
  @Query("UPDATE Posts p SET p.views = p.views + 1 WHERE p.postId = :postId")
  void incrementViews(@Param("postId") Long postId);

  // 좋아요 증가
  @Modifying
  @Query("UPDATE Posts p SET p.likes = p.likes + 1 WHERE p.postId = :postId")
  void incrementLikes(@Param("postId") Long postId);

  // 좋아요 감소
  @Modifying
  @Query("UPDATE Posts p SET p.likes = p.likes - 1 WHERE p.postId = :postId AND p.likes > 0")
  void decrementLikes(@Param("postId") Long postId);
}