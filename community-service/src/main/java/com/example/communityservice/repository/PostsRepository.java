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

  // 전체 게시글 목록 조회 (조회수 순)
  Page<Posts> findAllByOrderByViewsDesc(Pageable pageable);

  // 카테고리별 게시글 목록 조회 (조회수 순)
  Page<Posts> findByCategoryOrderByViewsDesc(PostCategory category, Pageable pageable);

  // 전체 게시글 목록 조회 (좋아요 순)
  Page<Posts> findAllByOrderByLikesDesc(Pageable pageable);

  // 카테고리별 게시글 목록 조회 (좋아요 순)
  Page<Posts> findByCategoryOrderByLikesDesc(PostCategory category, Pageable pageable);

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

  // 태그 검색을 위한 쿼리 메서드

  // 태그로 게시글 검색 (JSON_CONTAINS 사용)
  @Query(value = "SELECT * FROM posts WHERE JSON_CONTAINS(tags, :tag)", nativeQuery = true)
  Page<Posts> findByTagsContaining(@Param("tag") String tag, Pageable pageable);

  // 모든 태그 목록 조회 (사용 빈도 높은 순)
  @Query(
      value =
          "SELECT JSON_UNQUOTE(JSON_EXTRACT(tags, CONCAT('$[', n.n, ']'))) as tag_name, "
              + "COUNT(*) as usage_count "
              + "FROM posts p "
              + "CROSS JOIN (SELECT 0 n UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) n "
              + "WHERE JSON_EXTRACT(tags, CONCAT('$[', n.n, ']')) IS NOT NULL "
              + "GROUP BY tag_name "
              + "ORDER BY usage_count DESC",
      nativeQuery = true)
  List<Object[]> findAllTags();

  // 특정 사용자가 좋아요한 게시글 목록 조회 (최신순)
  @Query(
      "SELECT p FROM Posts p "
          + "JOIN PostLikes pl ON p.postId = pl.post.postId "
          + "WHERE pl.userId = :userId "
          + "ORDER BY pl.createdAt DESC")
  Page<Posts> findLikedPostsByUserId(@Param("userId") Long userId, Pageable pageable);

  // 특정 사용자가 작성한 게시글 목록 조회 (최신순)
  Page<Posts> findByAuthors_UserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
}
