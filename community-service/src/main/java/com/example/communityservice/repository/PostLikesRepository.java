package com.example.communityservice.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.communityservice.entity.PostLikes;

/** PostLikes 엔티티 데이터베이스 접근 인터페이스 게시글 좋아요 관리 및 배치 조회 기능 제공 */
@Repository
public interface PostLikesRepository extends JpaRepository<PostLikes, Long> {

  // 사용자가 특정 게시글에 좋아요 눌렀는지 여부
  boolean existsByUserIdAndPostPostId(Long userId, Long postId);

  // 좋아요 삭제
  @Modifying
  @Query("DELETE FROM PostLikes pl WHERE pl.userId = :userId AND pl.post.postId = :postId")
  void deleteByUserIdAndPostId(@Param("userId") Long userId, @Param("postId") Long postId);

  // 특정 게시글들 중 사용자가 좋아요한 것들의 ID 목록
  // TODO: 게시물 목록 UI에서 각 게시물마다 좋아요 여부에 따른 ♥/♡ 표시를 하려면 필요
  @Query(
      "SELECT pl.post.postId FROM PostLikes pl WHERE pl.userId = :userId AND pl.post.postId IN :postIds")
  List<Long> findLikedPostIdsByUserIdAndPostIds(
      @Param("userId") Long userId, @Param("postIds") List<Long> postIds);
}
