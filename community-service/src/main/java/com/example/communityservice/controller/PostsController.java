package com.example.communityservice.controller;

import jakarta.validation.Valid;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.communityservice.dto.posts.PostsRequestDTO;
import com.example.communityservice.dto.posts.PostsResponseDTO;
import com.example.communityservice.dto.posts.PostsSummaryDTO;
import com.example.communityservice.global.common.ApiResponseDTO;
import com.example.communityservice.global.common.PageResponseDTO;
import com.example.communityservice.service.PostsService;

import lombok.RequiredArgsConstructor;

/** 게시글 관련 REST API 컨트롤러 */
@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class PostsController {

  private final PostsService postsService;

  // 게시글 목록 조회
  // GET /api/posts?category=전체&page=0&size=20
  @GetMapping
  public ResponseEntity<ApiResponseDTO<PageResponseDTO<PostsSummaryDTO>>> getPosts(
      @RequestParam(required = false) String category, Pageable pageable) {
    Page<PostsSummaryDTO> posts = postsService.getPosts(category, pageable);
    PageResponseDTO<PostsSummaryDTO> pageResponse = PageResponseDTO.from(posts);
    return ResponseEntity.ok(ApiResponseDTO.success(pageResponse));
  }

  // 게시글 상세 조회
  // GET /api/posts/{id}
  @GetMapping("/{id}")
  public ResponseEntity<ApiResponseDTO<PostsResponseDTO>> getPost(@PathVariable Long id) {
    PostsResponseDTO post = postsService.getPost(id);
    return ResponseEntity.ok(ApiResponseDTO.success(post));
  }

  // 게시글 작성
  // POST /api/posts
  @PostMapping
  public ResponseEntity<ApiResponseDTO<PostsResponseDTO>> createPost(
      @Valid @RequestBody PostsRequestDTO requestDto) {
    PostsResponseDTO createdPost = postsService.createPost(requestDto);
    return ResponseEntity.ok(ApiResponseDTO.success("게시글이 성공적으로 작성되었습니다.", createdPost));
  }

  // 게시글 수정
  // PUT /api/posts/{id}
  @PutMapping("/{id}")
  public ResponseEntity<ApiResponseDTO<PostsResponseDTO>> updatePost(
      @PathVariable Long id, @Valid @RequestBody PostsRequestDTO requestDto) {
    PostsResponseDTO updatedPost = postsService.updatePost(id, requestDto);
    return ResponseEntity.ok(ApiResponseDTO.success("게시글이 성공적으로 수정되었습니다.", updatedPost));
  }

  // 게시글 삭제
  // DELETE /api/posts/{id}
  @DeleteMapping("/{id}")
  public ResponseEntity<ApiResponseDTO<Void>> deletePost(
      @PathVariable Long id, @RequestBody PostsRequestDTO requestDto) {
    postsService.deletePost(id, requestDto);
    return ResponseEntity.ok(ApiResponseDTO.success("게시글이 성공적으로 삭제되었습니다.", null));
  }

  // 좋아요 추가
  // POST /api/posts/{id}/likes
  @PostMapping("/{id}/likes")
  public ResponseEntity<ApiResponseDTO<Void>> addLike(@PathVariable Long id) {
    postsService.addLike(id);
    return ResponseEntity.ok(ApiResponseDTO.success("좋아요가 추가되었습니다.", null));
  }

  // 좋아요 취소
  // DELETE /api/posts/{id}/likes
  @DeleteMapping("/{id}/likes")
  public ResponseEntity<ApiResponseDTO<Void>> removeLike(@PathVariable Long id) {
    postsService.removeLike(id);
    return ResponseEntity.ok(ApiResponseDTO.success("좋아요가 취소되었습니다.", null));
  }
}
