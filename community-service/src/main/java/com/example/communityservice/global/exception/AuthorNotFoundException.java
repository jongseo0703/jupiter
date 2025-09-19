package com.example.communityservice.global.exception;

// 작성자를 찾을 수 없을 때 발생하는 예외
public class AuthorNotFoundException extends BusinessException {

  public AuthorNotFoundException() {
    super(ErrorCode.AUTHOR_NOT_FOUND);
  }

  public AuthorNotFoundException(Long authorId) {
    super(ErrorCode.AUTHOR_NOT_FOUND, "작성자를 찾을 수 없습니다. ID: " + authorId);
  }
}
