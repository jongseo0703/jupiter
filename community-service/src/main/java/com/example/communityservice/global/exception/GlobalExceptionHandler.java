package com.example.communityservice.global.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import lombok.extern.slf4j.Slf4j;

// 전역 예외 처리 핸들러
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

  // 비즈니스 로직 예외 처리
  @ExceptionHandler(BusinessException.class)
  protected ResponseEntity<ErrorResponseDto> handleBusinessException(BusinessException e) {
    log.error("BusinessException: {}", e.getMessage());
    ErrorCode errorCode = e.getErrorCode();
    ErrorResponseDto response = ErrorResponseDto.of(errorCode, e.getMessage());
    return new ResponseEntity<>(response, errorCode.getHttpStatus());
  }

  // Bean Validation 예외 처리 (@Valid 실패)
  @ExceptionHandler(MethodArgumentNotValidException.class)
  protected ResponseEntity<ErrorResponseDto> handleMethodArgumentNotValidException(
      MethodArgumentNotValidException e) {
    log.error("MethodArgumentNotValidException: {}", e.getMessage());
    String message = e.getBindingResult().getAllErrors().getFirst().getDefaultMessage();
    ErrorResponseDto response = ErrorResponseDto.of(ErrorCode.INVALID_INPUT_VALUE, message);
    return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
  }

  // Bean Validation 예외 처리 (일반적인 바인딩 오류)
  @ExceptionHandler(BindException.class)
  protected ResponseEntity<ErrorResponseDto> handleBindException(BindException e) {
    log.error("BindException: {}", e.getMessage());
    String message = e.getBindingResult().getAllErrors().getFirst().getDefaultMessage();
    ErrorResponseDto response = ErrorResponseDto.of(ErrorCode.INVALID_INPUT_VALUE, message);
    return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
  }

  // IllegalArgumentException 처리
  @ExceptionHandler(IllegalArgumentException.class)
  protected ResponseEntity<ErrorResponseDto> handleIllegalArgumentException(
      IllegalArgumentException e) {
    log.error("IllegalArgumentException: {}", e.getMessage());
    ErrorResponseDto response = ErrorResponseDto.of(ErrorCode.INVALID_INPUT_VALUE, e.getMessage());
    return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
  }

  // 기타 모든 예외 처리
  @ExceptionHandler(Exception.class)
  protected ResponseEntity<ErrorResponseDto> handleException(Exception e) {
    log.error("Exception: {}", e.getMessage(), e);
    ErrorResponseDto response = ErrorResponseDto.of(ErrorCode.INTERNAL_SERVER_ERROR);
    return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
