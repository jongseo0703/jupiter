package com.example.communityservice.global.exception;

// 권한이 없을 때 발생하는 예외
public class AccessDeniedException extends BusinessException {

  public AccessDeniedException(ErrorCode errorCode) {
    super(errorCode);
  }

  public AccessDeniedException(ErrorCode errorCode, String message) {
    super(errorCode, message);
  }

  // 게시글 권한 관련
  public static AccessDeniedException forPost() {
    return new AccessDeniedException(ErrorCode.POST_ACCESS_DENIED);
  }

  // 댓글 권한 관련
  public static AccessDeniedException forComment() {
    return new AccessDeniedException(ErrorCode.COMMENT_ACCESS_DENIED);
  }

  // 익명 사용자 인증 실패
  public static AccessDeniedException forAnonymousAuth() {
    return new AccessDeniedException(ErrorCode.ANONYMOUS_AUTH_FAILED);
  }
}
