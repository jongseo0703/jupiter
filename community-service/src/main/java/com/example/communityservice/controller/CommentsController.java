package com.example.communityservice.controller;

import java.util.List;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.communityservice.dto.auth.AnonymousAuthRequestDTO;
import com.example.communityservice.dto.comments.CommentsRequestDTO;
import com.example.communityservice.dto.comments.CommentsResponseDTO;
import com.example.communityservice.global.common.ApiResponseDTO;
import com.example.communityservice.service.CommentsService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

/** 댓글 관련 REST API 컨트롤러 */
@Tag(name = "Comments", description = "댓글 관리 API")
@RestController
@RequestMapping("/api/comments")
@RequiredArgsConstructor
public class CommentsController {

  private final CommentsService commentsService;

  // 댓글 작성
  // POST /api/comments
  @Operation(summary = "댓글 작성", description = "게시글에 새로운 댓글을 작성합니다. 회원/익명 사용자 모두 가능합니다.")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "작성 성공"),
    @ApiResponse(responseCode = "400", description = "입력값 검증 실패"),
    @ApiResponse(responseCode = "404", description = "게시글 또는 작성자를 찾을 수 없음")
  })
  @PostMapping
  public ResponseEntity<ApiResponseDTO<CommentsResponseDTO>> createComment(
      @Parameter(description = "댓글 작성 요청 정보") @Valid @RequestBody CommentsRequestDTO requestDto) {
    CommentsResponseDTO createdComment = commentsService.createComment(requestDto);
    return ResponseEntity.ok(ApiResponseDTO.success("댓글이 성공적으로 작성되었습니다.", createdComment));
  }

  // 댓글 수정
  // PUT /api/comments/{id}
  @Operation(summary = "댓글 수정", description = "기존 댓글을 수정합니다. 작성자만 수정할 수 있습니다.")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "수정 성공"),
    @ApiResponse(responseCode = "400", description = "입력값 검증 실패"),
    @ApiResponse(responseCode = "403", description = "수정 권한 없음"),
    @ApiResponse(responseCode = "404", description = "댓글을 찾을 수 없음")
  })
  @PutMapping("/{id}")
  public ResponseEntity<ApiResponseDTO<CommentsResponseDTO>> updateComment(
      @Parameter(description = "댓글 ID") @PathVariable Long id,
      @Parameter(description = "댓글 수정 요청 정보") @Valid @RequestBody CommentsRequestDTO requestDto) {
    CommentsResponseDTO updatedComment = commentsService.updateComment(id, requestDto);
    return ResponseEntity.ok(ApiResponseDTO.success("댓글이 성공적으로 수정되었습니다.", updatedComment));
  }

  // 댓글 삭제
  // DELETE /api/comments/{id}
  @Operation(summary = "댓글 삭제", description = "기존 댓글을 삭제합니다. 작성자만 삭제할 수 있습니다.")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "삭제 성공"),
    @ApiResponse(responseCode = "403", description = "삭제 권한 없음"),
    @ApiResponse(responseCode = "404", description = "댓글을 찾을 수 없음")
  })
  @DeleteMapping("/{id}")
  public ResponseEntity<ApiResponseDTO<Void>> deleteComment(
      @Parameter(description = "댓글 ID") @PathVariable Long id,
      @Parameter(description = "작성자 권한 확인용 정보") @RequestBody CommentsRequestDTO requestDto) {
    commentsService.deleteComment(id, requestDto);
    return ResponseEntity.ok(ApiResponseDTO.success("댓글이 성공적으로 삭제되었습니다.", null));
  }

  // 익명 댓글 인증 확인
  // POST /api/comments/{id}/verify
  @Operation(summary = "익명 댓글 인증 확인", description = "익명 댓글의 이메일과 비밀번호를 확인합니다.")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "인증 성공"),
    @ApiResponse(responseCode = "403", description = "인증 실패"),
    @ApiResponse(responseCode = "404", description = "댓글을 찾을 수 없음")
  })
  @PostMapping("/{id}/verify")
  public ResponseEntity<ApiResponseDTO<Void>> verifyAnonymousComment(
      @Parameter(description = "댓글 ID") @PathVariable Long id,
      @Parameter(description = "인증 정보") @Valid @RequestBody AnonymousAuthRequestDTO requestDto) {
    commentsService.verifyAnonymousComment(id, requestDto);
    return ResponseEntity.ok(ApiResponseDTO.success("인증이 성공했습니다.", null));
  }

  // === User Service용 API ===

  // 특정 작성자의 댓글 목록 조회
  // GET /api/comments/author/{authorId}
  @Operation(
      summary = "작성자별 댓글 목록 조회",
      description = "특정 작성자가 작성한 댓글 목록을 조회합니다. User Service에서 사용됩니다.")
  @ApiResponses({@ApiResponse(responseCode = "200", description = "조회 성공")})
  @GetMapping("/author/{authorId}")
  public ResponseEntity<ApiResponseDTO<List<CommentsResponseDTO>>> getCommentsByAuthor(
      @Parameter(description = "작성자 ID") @PathVariable Long authorId) {
    List<CommentsResponseDTO> comments = commentsService.getCommentsByAuthorId(authorId);
    return ResponseEntity.ok(ApiResponseDTO.success(comments));
  }
}
