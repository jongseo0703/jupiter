package com.example.communityservice.global.exception;

import org.springframework.http.HttpStatus;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

// 에러 코드와 메시지를 정의하는 enum
@Getter
@RequiredArgsConstructor
public enum ErrorCode {

  // Posts 관련 에러
  POST_NOT_FOUND(HttpStatus.NOT_FOUND, "P001", "게시글을 찾을 수 없습니다."),
  POST_ACCESS_DENIED(HttpStatus.FORBIDDEN, "P002", "게시글에 대한 권한이 없습니다."),
  INVALID_POST_CATEGORY(HttpStatus.BAD_REQUEST, "P003", "잘못된 게시글 카테고리입니다."),

  // Comments 관련 에러
  COMMENT_NOT_FOUND(HttpStatus.NOT_FOUND, "C001", "댓글을 찾을 수 없습니다."),
  COMMENT_ACCESS_DENIED(HttpStatus.FORBIDDEN, "C002", "댓글에 대한 권한이 없습니다."),
  COMMENT_CONTENT_INVALID(HttpStatus.BAD_REQUEST, "C003", "댓글 내용이 유효하지 않습니다."),

  // Authors 관련 에러
  AUTHOR_NOT_FOUND(HttpStatus.NOT_FOUND, "A001", "작성자를 찾을 수 없습니다."),
  INVALID_AUTHOR_INFO(HttpStatus.BAD_REQUEST, "A002", "작성자 정보가 유효하지 않습니다."),
  ANONYMOUS_AUTH_FAILED(HttpStatus.UNAUTHORIZED, "A003", "익명 사용자 인증에 실패했습니다."),

  // 공통 에러
  INVALID_INPUT_VALUE(HttpStatus.BAD_REQUEST, "G001", "입력값이 유효하지 않습니다."),
  INTERNAL_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "G002", "내부 서버 오류가 발생했습니다.");

  private final HttpStatus httpStatus;
  private final String code;
  private final String message;
}
