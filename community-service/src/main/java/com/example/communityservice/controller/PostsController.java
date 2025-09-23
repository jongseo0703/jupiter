package com.example.communityservice.controller;

import java.util.List;

import jakarta.validation.Valid;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.example.communityservice.dto.auth.AnonymousAuthRequestDTO;
import com.example.communityservice.dto.auth.UserInfoResponse;
import com.example.communityservice.dto.posts.PostAttachmentsResponseDTO;
import com.example.communityservice.dto.posts.PostsRequestDTO;
import com.example.communityservice.dto.posts.PostsResponseDTO;
import com.example.communityservice.dto.posts.PostsSummaryDTO;
import com.example.communityservice.global.common.ApiResponseDTO;
import com.example.communityservice.global.common.PageResponseDTO;
import com.example.communityservice.service.AuthService;
import com.example.communityservice.service.FileUploadService;
import com.example.communityservice.service.PostsService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/** 게시글 관련 REST API 컨트롤러 */
@Tag(name = "Posts", description = "게시글 관리 API")
@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
@Slf4j
public class PostsController {

  private final PostsService postsService;
  private final FileUploadService fileUploadService;
  private final AuthService authService;

  // 게시글 목록 조회
  // GET /api/posts?category=전체&page=0&size=20&sort=views 또는 sort=createdAt
  @Operation(
      summary = "게시글 목록 조회",
      description = "카테고리별 게시글 목록을 페이징하여 조회합니다. sort 파라미터로 정렬 기준을 지정할 수 있습니다.")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "조회 성공"),
    @ApiResponse(responseCode = "400", description = "잘못된 요청")
  })
  @GetMapping
  public ResponseEntity<ApiResponseDTO<PageResponseDTO<PostsSummaryDTO>>> getPosts(
      @Parameter(description = "게시글 카테고리 (전체, FREE_BOARD, PRICE_INFO, LIQUOR_REVIEW, QNA, EVENT)")
          @RequestParam(required = false)
          String category,
      @Parameter(description = "정렬 기준 (views: 조회수순, createdAt: 최신순)")
          @RequestParam(required = false, defaultValue = "createdAt")
          String sort,
      @Parameter(description = "태그 필터링") @RequestParam(required = false) String tag,
      @Parameter(description = "키워드 검색 (제목, 내용)") @RequestParam(required = false) String search,
      @Parameter(description = "페이징 정보 (page, size)") Pageable pageable) {

    Page<PostsSummaryDTO> posts;

    // 태그 검색
    if (tag != null && !tag.trim().isEmpty()) {
      posts = postsService.getPostsByTag(tag, pageable);
    }
    // 키워드 검색
    else if (search != null && !search.trim().isEmpty()) {
      posts = postsService.searchPosts(search, pageable);
    }
    // 일반 목록 조회
    else if ("views".equals(sort)) {
      posts = postsService.getPopularPosts(category, pageable);
    } else {
      posts = postsService.getPosts(category, pageable);
    }

    PageResponseDTO<PostsSummaryDTO> pageResponse = PageResponseDTO.from(posts);
    return ResponseEntity.ok(ApiResponseDTO.success(pageResponse));
  }

  // 게시글 상세 조회
  // GET /api/posts/{id}
  @Operation(summary = "게시글 상세 조회", description = "게시글 ID로 상세 정보를 조회합니다. 댓글 목록도 포함됩니다.")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "조회 성공"),
    @ApiResponse(responseCode = "404", description = "게시글을 찾을 수 없음")
  })
  @GetMapping("/{id}")
  public ResponseEntity<ApiResponseDTO<PostsResponseDTO>> getPost(
      @Parameter(description = "게시글 ID") @PathVariable Long id,
      @RequestHeader(value = "Authorization", required = false) String authorizationHeader) {

    Long userId = null;
    // 로그인한 경우 사용자 ID 추출
    if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
      try {
        UserInfoResponse userInfo = authService.validateTokenAndGetUser(authorizationHeader);
        userId = userInfo.getId();
      } catch (Exception e) {
        // 토큰이 유효하지 않아도 게시글 조회는 가능하므로 로그만 남기고 진행
        log.warn("토큰 유효성 검사 실패, 비로그인으로 처리: {}", e.getMessage());
      }
    }

    PostsResponseDTO post = postsService.getPost(id, userId);
    return ResponseEntity.ok(ApiResponseDTO.success(post));
  }

  // 게시글 작성
  // POST /api/posts
  @Operation(
      summary = "게시글 작성",
      description = "새로운 게시글을 작성합니다. 로그인한 사용자는 해당 계정으로만 작성 가능하며, 비로그인 사용자는 익명으로 작성 가능합니다.")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "작성 성공"),
    @ApiResponse(responseCode = "400", description = "입력값 검증 실패"),
    @ApiResponse(responseCode = "401", description = "인증 실패"),
    @ApiResponse(responseCode = "404", description = "작성자를 찾을 수 없음")
  })
  @PostMapping
  public ResponseEntity<ApiResponseDTO<PostsResponseDTO>> createPost(
      @Parameter(description = "게시글 작성 요청 정보") @Valid @RequestBody PostsRequestDTO requestDto,
      @RequestHeader(value = "Authorization", required = false) String authorizationHeader) {

    log.info("=== POST /api/posts 호출됨 ===");
    log.info("인증 헤더: {}", authorizationHeader);
    log.info(
        "처리 전 요청 DTO: authorId={}, isAnonymous={}, authorName={}",
        requestDto.getAuthorId(),
        requestDto.getIsAnonymous(),
        requestDto.getAuthorName());

    // Authorization 헤더가 있으면 무조건 인증된 사용자로 처리 (강제)
    if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
      log.info("인증 헤더 감지, 토큰 유효성 검사 중...");
      try {
        UserInfoResponse userInfo = authService.validateTokenAndGetUser(authorizationHeader);
        log.info(
            "사용자 정보 조회됨: id={}, username={}, email={}",
            userInfo.getId(),
            userInfo.getUsername(),
            userInfo.getEmail());
        // 로그인한 사용자는 무조건 해당 계정으로만 작성 가능
        requestDto.setAuthorId(userInfo.getId());
        requestDto.setIsAnonymous(false);
        requestDto.setAuthorName(userInfo.getUsername()); // 사용자 이름 설정
        // 익명 관련 필드 무시
        requestDto.setAnonymousEmail(null);
        requestDto.setAnonymousPassword(null);
        log.info(
            "요청 DTO 업데이트됨: authorId={}, isAnonymous={}",
            requestDto.getAuthorId(),
            requestDto.getIsAnonymous());
      } catch (Exception e) {
        log.error("토큰 유효성 검사 및 사용자 정보 조회 실패", e);
        throw e;
      }
    } else {
      log.info("유효한 인증 헤더 없음 (헤더: {}), 익명으로 진행", authorizationHeader);
    }

    log.info(
        "최종 요청 DTO: authorId={}, isAnonymous={}",
        requestDto.getAuthorId(),
        requestDto.getIsAnonymous());

    PostsResponseDTO createdPost = postsService.createPost(requestDto);
    return ResponseEntity.ok(ApiResponseDTO.success("게시글이 성공적으로 작성되었습니다.", createdPost));
  }

  // 게시글 수정
  // PUT /api/posts/{id}
  @Operation(summary = "게시글 수정", description = "기존 게시글을 수정합니다. 작성자만 수정할 수 있습니다.")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "수정 성공"),
    @ApiResponse(responseCode = "400", description = "입력값 검증 실패"),
    @ApiResponse(responseCode = "403", description = "수정 권한 없음"),
    @ApiResponse(responseCode = "404", description = "게시글을 찾을 수 없음")
  })
  @PutMapping("/{id}")
  public ResponseEntity<ApiResponseDTO<PostsResponseDTO>> updatePost(
      @Parameter(description = "게시글 ID") @PathVariable Long id,
      @Parameter(description = "게시글 수정 요청 정보") @Valid @RequestBody PostsRequestDTO requestDto) {
    PostsResponseDTO updatedPost = postsService.updatePost(id, requestDto);
    return ResponseEntity.ok(ApiResponseDTO.success("게시글이 성공적으로 수정되었습니다.", updatedPost));
  }

  // 게시글 삭제
  // DELETE /api/posts/{id}
  @Operation(summary = "게시글 삭제", description = "기존 게시글을 삭제합니다. 작성자만 삭제할 수 있습니다.")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "삭제 성공"),
    @ApiResponse(responseCode = "403", description = "삭제 권한 없음"),
    @ApiResponse(responseCode = "404", description = "게시글을 찾을 수 없음")
  })
  @DeleteMapping("/{id}")
  public ResponseEntity<ApiResponseDTO<Void>> deletePost(
      @Parameter(description = "게시글 ID") @PathVariable Long id,
      @Parameter(description = "작성자 권한 확인용 정보") @RequestBody PostsRequestDTO requestDto) {
    postsService.deletePost(id, requestDto);
    return ResponseEntity.ok(ApiResponseDTO.success("게시글이 성공적으로 삭제되었습니다.", null));
  }

  // 좋아요 추가 (로그인 필수)
  // POST /api/posts/{id}/likes
  @Operation(summary = "좋아요 추가", description = "게시글에 좋아요를 추가합니다. 로그인한 사용자만 가능합니다.")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "좋아요 추가 성공"),
    @ApiResponse(responseCode = "401", description = "인증 실패 - 로그인 필요"),
    @ApiResponse(responseCode = "404", description = "게시글을 찾을 수 없음"),
    @ApiResponse(responseCode = "409", description = "이미 좋아요를 누른 게시글")
  })
  @PostMapping("/{id}/likes")
  public ResponseEntity<ApiResponseDTO<Void>> addLike(
      @Parameter(description = "게시글 ID") @PathVariable Long id,
      @RequestHeader(value = "Authorization", required = true) String authorizationHeader) {

    // 로그인 체크
    UserInfoResponse userInfo = authService.validateTokenAndGetUser(authorizationHeader);

    postsService.addLike(id, userInfo.getId());
    return ResponseEntity.ok(ApiResponseDTO.success("좋아요가 추가되었습니다.", null));
  }

  // 좋아요 취소 (로그인 필수)
  // DELETE /api/posts/{id}/likes
  @Operation(summary = "좋아요 취소", description = "게시글의 좋아요를 취소합니다. 로그인한 사용자만 가능합니다.")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "좋아요 취소 성공"),
    @ApiResponse(responseCode = "401", description = "인증 실패 - 로그인 필요"),
    @ApiResponse(responseCode = "404", description = "게시글을 찾을 수 없음"),
    @ApiResponse(responseCode = "409", description = "좋아요를 누르지 않은 게시글")
  })
  @DeleteMapping("/{id}/likes")
  public ResponseEntity<ApiResponseDTO<Void>> removeLike(
      @Parameter(description = "게시글 ID") @PathVariable Long id,
      @RequestHeader(value = "Authorization", required = true) String authorizationHeader) {

    // 로그인 체크
    UserInfoResponse userInfo = authService.validateTokenAndGetUser(authorizationHeader);

    postsService.removeLike(id, userInfo.getId());
    return ResponseEntity.ok(ApiResponseDTO.success("좋아요가 취소되었습니다.", null));
  }

  // 익명 게시글 인증 확인
  // POST /api/posts/{id}/verify
  @Operation(summary = "익명 게시글 인증 확인", description = "익명 게시글의 이메일과 비밀번호를 확인합니다.")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "인증 성공"),
    @ApiResponse(responseCode = "403", description = "인증 실패"),
    @ApiResponse(responseCode = "404", description = "게시글을 찾을 수 없음")
  })
  @PostMapping("/{id}/verify")
  public ResponseEntity<ApiResponseDTO<Void>> verifyAnonymousPost(
      @Parameter(description = "게시글 ID") @PathVariable Long id,
      @Parameter(description = "인증 정보") @Valid @RequestBody AnonymousAuthRequestDTO requestDto) {
    postsService.verifyAnonymousPost(id, requestDto);
    return ResponseEntity.ok(ApiResponseDTO.success("인증이 성공했습니다.", null));
  }

  // === 첨부파일 관련 API ===

  @Operation(summary = "첨부파일 목록 조회", description = "특정 게시글의 첨부파일 목록을 조회합니다.")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "조회 성공"),
    @ApiResponse(responseCode = "404", description = "게시글을 찾을 수 없음")
  })
  @GetMapping("/{id}/attachments")
  public ResponseEntity<ApiResponseDTO<List<PostAttachmentsResponseDTO>>> getAttachments(
      @Parameter(description = "게시글 ID") @PathVariable Long id) {
    List<PostAttachmentsResponseDTO> attachments = fileUploadService.getAttachmentsByPostId(id);
    return ResponseEntity.ok(ApiResponseDTO.success(attachments));
  }

  @Operation(summary = "첨부파일 업로드", description = "특정 게시글에 파일을 업로드합니다.")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "업로드 성공"),
    @ApiResponse(responseCode = "400", description = "파일 업로드 실패"),
    @ApiResponse(responseCode = "404", description = "게시글을 찾을 수 없음")
  })
  @PostMapping("/{id}/attachments")
  public ResponseEntity<ApiResponseDTO<List<PostAttachmentsResponseDTO>>> uploadFiles(
      @Parameter(description = "게시글 ID") @PathVariable Long id,
      @Parameter(description = "업로드할 파일들") @RequestParam("files") List<MultipartFile> files) {
    List<PostAttachmentsResponseDTO> attachments =
        fileUploadService.uploadFiles(files, postsService.getPostEntity(id));
    return ResponseEntity.ok(ApiResponseDTO.success("파일이 성공적으로 업로드되었습니다.", attachments));
  }

  @Operation(summary = "첨부파일 삭제", description = "특정 첨부파일을 삭제합니다.")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "삭제 성공"),
    @ApiResponse(responseCode = "404", description = "첨부파일을 찾을 수 없음")
  })
  @DeleteMapping("/attachments/{attachmentId}")
  public ResponseEntity<ApiResponseDTO<Void>> deleteAttachment(
      @Parameter(description = "첨부파일 ID") @PathVariable Long attachmentId) {
    fileUploadService.deleteAttachment(attachmentId);
    return ResponseEntity.ok(ApiResponseDTO.success("첨부파일이 삭제되었습니다.", null));
  }

  // === 태그 관련 API ===

  @Operation(summary = "모든 태그 목록 조회", description = "사용 빈도순으로 모든 태그 목록을 조회합니다.")
  @ApiResponses({@ApiResponse(responseCode = "200", description = "조회 성공")})
  @GetMapping("/tags")
  public ResponseEntity<ApiResponseDTO<List<String>>> getAllTags() {
    List<String> allTags = postsService.getAllTags();
    return ResponseEntity.ok(ApiResponseDTO.success(allTags));
  }
}
