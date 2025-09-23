package com.example.communityservice.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.communityservice.entity.PostLikes;
import com.example.communityservice.entity.Posts;

@Repository
public interface PostLikesRepository extends JpaRepository<PostLikes, Long> {

  // 사용자가 특정 게시글에 좋아요 눌렀는지 확인
  Optional<PostLikes> findByUserIdAndPostPostId(Long userId, Long postId);

  // 사용자가 특정 게시글에 좋아요 눌렀는지 여부
  boolean existsByUserIdAndPostPostId(Long userId, Long postId);

  // 게시글의 총 좋아요 수
  long countByPostPostId(Long postId);

  // 사용자가 좋아요한 게시글 목록 (최신순)
  @Query("SELECT pl.post FROM PostLikes pl WHERE pl.userId = :userId ORDER BY pl.createdAt DESC")
  Page<Posts> findLikedPostsByUserId(@Param("userId") Long userId, Pageable pageable);

  // 특정 게시글들 중 사용자가 좋아요한 것들의 ID 목록
  @Query(
      "SELECT pl.post.postId FROM PostLikes pl WHERE pl.userId = :userId AND pl.post.postId IN :postIds")
  List<Long> findLikedPostIdsByUserIdAndPostIds(
      @Param("userId") Long userId, @Param("postIds") List<Long> postIds);

  // 좋아요 삭제
  @Modifying
  @Query("DELETE FROM PostLikes pl WHERE pl.userId = :userId AND pl.post.postId = :postId")
  void deleteByUserIdAndPostId(@Param("userId") Long userId, @Param("postId") Long postId);
}
