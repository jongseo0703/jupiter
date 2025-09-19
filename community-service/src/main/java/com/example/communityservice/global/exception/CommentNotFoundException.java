package com.example.communityservice.global.exception;

// 댓글을 찾을 수 없을 때 발생하는 예외
public class CommentNotFoundException extends BusinessException {

  public CommentNotFoundException() {
    super(ErrorCode.COMMENT_NOT_FOUND);
  }

  public CommentNotFoundException(Long commentId) {
    super(ErrorCode.COMMENT_NOT_FOUND, "댓글을 찾을 수 없습니다. ID: " + commentId);
  }
}
