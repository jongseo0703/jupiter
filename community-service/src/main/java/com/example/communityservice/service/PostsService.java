package com.example.communityservice.service;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.communityservice.dto.comments.CommentsResponseDTO;
import com.example.communityservice.dto.posts.PostsRequestDTO;
import com.example.communityservice.dto.posts.PostsResponseDTO;
import com.example.communityservice.dto.posts.PostsSummaryDTO;
import com.example.communityservice.entity.Authors;
import com.example.communityservice.entity.Comments;
import com.example.communityservice.entity.PostCategory;
import com.example.communityservice.entity.Posts;
import com.example.communityservice.global.exception.AccessDeniedException;
import com.example.communityservice.global.exception.AuthorNotFoundException;
import com.example.communityservice.global.exception.PostNotFoundException;
import com.example.communityservice.repository.AuthorsRepository;
import com.example.communityservice.repository.PostsRepository;

import lombok.RequiredArgsConstructor;

// 게시글 관련 비즈니스 로직 처리 서비스
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PostsService {

  private final PostsRepository postsRepository;
  private final AuthorsRepository authorsRepository;
  private final PasswordEncoder passwordEncoder;

  // 게시글 목록 조회 (카테고리별, 페이징)
  public Page<PostsSummaryDTO> getPosts(String category, Pageable pageable) {
    Page<Posts> posts;

    if (category == null || category.equals("전체")) {
      posts = postsRepository.findAllByOrderByCreatedAtDesc(pageable);
    } else {
      PostCategory postCategory = PostCategory.valueOf(category.toUpperCase());
      posts = postsRepository.findByCategoryOrderByCreatedAtDesc(postCategory, pageable);
    }

    return posts.map(PostsSummaryDTO::from);
  }

  // 게시글 상세 조회 (조회수 증가 + 댓글 목록 포함)
  @Transactional
  public PostsResponseDTO getPost(Long postId) {
    Posts post =
        postsRepository.findById(postId).orElseThrow(() -> new PostNotFoundException(postId));

    // 조회수 증가
    postsRepository.incrementViews(postId);

    // 댓글 목록 조회
    List<CommentsResponseDTO> comments =
        post.getComments().stream()
            .sorted(Comparator.comparing(Comments::getCreatedAt)) // 오래된순 정렬
            .map(CommentsResponseDTO::from)
            .collect(Collectors.toList());

    PostsResponseDTO response = PostsResponseDTO.from(post);
    response.setComments(comments);
    return response;
  }

  // 게시글 생성
  @Transactional
  public PostsResponseDTO createPost(PostsRequestDTO requestDto) {
    Authors author = getOrCreateAuthor(requestDto);

    Posts post =
        Posts.builder()
            .authors(author)
            .category(requestDto.getCategory())
            .title(requestDto.getTitle())
            .content(requestDto.getContent())
            .tags(requestDto.getTags())
            .build();

    Posts savedPost = postsRepository.save(post);
    return PostsResponseDTO.from(savedPost);
  }

  // 게시글 수정
  @Transactional
  public PostsResponseDTO updatePost(Long postId, PostsRequestDTO requestDto) {
    Posts post =
        postsRepository.findById(postId).orElseThrow(() -> new PostNotFoundException(postId));

    // 작성자 권한 체크
    validateAuthorPermission(post, requestDto);

    post.updatePost(
        requestDto.getTitle(),
        requestDto.getContent(),
        requestDto.getCategory(),
        requestDto.getTags());

    return PostsResponseDTO.from(post);
  }

  // 게시글 삭제
  @Transactional
  public void deletePost(Long postId, PostsRequestDTO requestDto) {
    Posts post =
        postsRepository.findById(postId).orElseThrow(() -> new PostNotFoundException(postId));

    // 작성자 권한 체크
    validateAuthorPermission(post, requestDto);

    postsRepository.delete(post);
  }

  // 좋아요 추가
  @Transactional
  public void addLike(Long postId) {
    if (!postsRepository.existsById(postId)) {
      throw new PostNotFoundException(postId);
    }
    postsRepository.incrementLikes(postId);
  }

  // 좋아요 취소
  @Transactional
  public void removeLike(Long postId) {
    if (!postsRepository.existsById(postId)) {
      throw new PostNotFoundException(postId);
    }
    postsRepository.decrementLikes(postId);
  }

  // 작성자 정보 조회 또는 생성 (회원/익명 구분)
  private Authors getOrCreateAuthor(PostsRequestDTO requestDto) {
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
  private void validateAuthorPermission(Posts post, PostsRequestDTO requestDto) {
    Authors postAuthor = post.getAuthors();

    if (postAuthor.getIsAnonymous()) {
      // 익명 사용자 검증: 이메일과 비밀번호 확인
      if (!postAuthor.getAnonymousEmail().equals(requestDto.getAnonymousEmail())
          || !passwordEncoder.matches(
              requestDto.getAnonymousPassword(), postAuthor.getAnonymousPwd())) {
        throw AccessDeniedException.forPost();
      }
    } else {
      // 회원 사용자 검증: 작성자 ID 확인
      if (!postAuthor.getAuthorId().equals(requestDto.getAuthorId())) {
        throw AccessDeniedException.forPost();
      }
    }
  }

  // 파일 업로드를 위한 Posts 엔티티 조회
  public Posts getPostEntity(Long postId) {
    return postsRepository.findById(postId).orElseThrow(() -> new PostNotFoundException(postId));
  }
}
