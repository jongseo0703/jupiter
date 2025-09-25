package com.example.communityservice.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.communityservice.entity.Comments;

/** Comments 엔티티 데이터베이스 접근 인터페이스 */
@Repository
public interface CommentsRepository extends JpaRepository<Comments, Long> {

  // 특정 작성자의 댓글 목록 조회 (User - MyPage용  내부 API)
  List<Comments> findByAuthors_AuthorIdOrderByCreatedAtDesc(Long authorId);
}
