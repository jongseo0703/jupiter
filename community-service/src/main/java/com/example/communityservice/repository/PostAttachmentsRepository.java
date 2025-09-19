package com.example.communityservice.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.communityservice.entity.PostAttachments;

/** 첨부파일 관련 데이터베이스 접근 리포지토리 */
@Repository
public interface PostAttachmentsRepository extends JpaRepository<PostAttachments, Long> {

  /** 특정 게시글의 첨부파일 목록 조회 (생성일시 순으로 정렬) */
  @Query(
      "SELECT pa FROM PostAttachments pa WHERE pa.post.postId = :postId ORDER BY pa.postAttachmentId ASC")
  List<PostAttachments> findByPostIdOrderByCreatedAt(@Param("postId") Long postId);

  /** 특정 게시글의 첨부파일 개수 조회 */
  @Query("SELECT COUNT(pa) FROM PostAttachments pa WHERE pa.post.postId = :postId")
  int countByPostId(@Param("postId") Long postId);

  /** 특정 게시글의 첨부파일을 모두 삭제 */
  void deleteByPost_PostId(Long postId);
}
