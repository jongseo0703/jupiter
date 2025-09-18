package com.example.communityservice.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.communityservice.dto.comments.CommentsRequestDTO;
import com.example.communityservice.dto.comments.CommentsResponseDTO;
import com.example.communityservice.entity.Authors;
import com.example.communityservice.entity.Comments;
import com.example.communityservice.entity.Posts;
import com.example.communityservice.global.exception.AccessDeniedException;
import com.example.communityservice.global.exception.AuthorNotFoundException;
import com.example.communityservice.global.exception.CommentNotFoundException;
import com.example.communityservice.global.exception.PostNotFoundException;
import com.example.communityservice.repository.AuthorsRepository;
import com.example.communityservice.repository.CommentsRepository;
import com.example.communityservice.repository.PostsRepository;

import lombok.RequiredArgsConstructor;

// 댓글 관련 비즈니스 로직 처리 서비스
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CommentsService {

  private final CommentsRepository commentsRepository;
  private final PostsRepository postsRepository;
  private final AuthorsRepository authorsRepository;
  private final PasswordEncoder passwordEncoder;

  // 특정 작성자의 댓글 목록 조회 (User MyPage용 내부 API)
  public List<CommentsResponseDTO> getCommentsByAuthorId(Long authorId) {
    List<Comments> comments =
        commentsRepository.findByAuthors_AuthorIdOrderByCreatedAtDesc(authorId);
    return comments.stream().map(CommentsResponseDTO::from).collect(Collectors.toList());
  }

  // 댓글 생성
  @Transactional
  public CommentsResponseDTO createComment(CommentsRequestDTO requestDto) {
    // 게시글 존재 확인
    Posts post =
        postsRepository
            .findById(requestDto.getPostId())
            .orElseThrow(() -> new PostNotFoundException(requestDto.getPostId()));

    // 작성자 정보 조회 또는 생성
    Authors author = getOrCreateAuthor(requestDto);

    Comments comment =
        Comments.builder().post(post).authors(author).content(requestDto.getContent()).build();

    Comments savedComment = commentsRepository.save(comment);
    return CommentsResponseDTO.from(savedComment);
  }

  // 댓글 수정
  @Transactional
  public CommentsResponseDTO updateComment(Long commentId, CommentsRequestDTO requestDto) {
    Comments comment =
        commentsRepository
            .findById(commentId)
            .orElseThrow(() -> new CommentNotFoundException(commentId));

    // 작성자 권한 체크
    validateAuthorPermission(comment, requestDto);

    comment.updateContent(requestDto.getContent());
    return CommentsResponseDTO.from(comment);
  }

  // 댓글 삭제
  @Transactional
  public void deleteComment(Long commentId, CommentsRequestDTO requestDto) {
    Comments comment =
        commentsRepository
            .findById(commentId)
            .orElseThrow(() -> new CommentNotFoundException(commentId));

    // 작성자 권한 체크
    validateAuthorPermission(comment, requestDto);

    commentsRepository.delete(comment);
  }

  // 작성자 정보 조회 또는 생성 (회원/익명 구분)
  private Authors getOrCreateAuthor(CommentsRequestDTO requestDto) {
    if (Boolean.TRUE.equals(requestDto.getIsAnonymous())) {
      // 익명 사용자 처리
      String encodedPassword = passwordEncoder.encode(requestDto.getAnonymousPassword());
      return authorsRepository.save(
          Authors.createAnonymousAuthor(
              requestDto.getAuthorName(), requestDto.getAnonymousEmail(), encodedPassword));
    } else {
      // 회원 사용자 처리
      if (requestDto.getAuthorId() == null) {
        throw new IllegalArgumentException("회원 작성자 ID는 필수입니다.");
      }
      return authorsRepository
          .findById(requestDto.getAuthorId())
          .orElseThrow(() -> new AuthorNotFoundException(requestDto.getAuthorId()));
    }
  }

  // 작성자 권한 검증 (회원/익명 구분)
  private void validateAuthorPermission(Comments comment, CommentsRequestDTO requestDto) {
    Authors commentAuthor = comment.getAuthors();

    if (commentAuthor.getIsAnonymous()) {
      // 익명 사용자 검증: 이메일과 비밀번호 확인
      if (!commentAuthor.getAnonymousEmail().equals(requestDto.getAnonymousEmail())
          || !passwordEncoder.matches(
              requestDto.getAnonymousPassword(), commentAuthor.getAnonymousPwd())) {
        throw AccessDeniedException.forComment();
      }
    } else {
      // 회원 사용자 검증: 작성자 ID 확인
      if (!commentAuthor.getAuthorId().equals(requestDto.getAuthorId())) {
        throw AccessDeniedException.forComment();
      }
    }
  }
}
