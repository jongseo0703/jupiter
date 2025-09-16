package com.example.authservice.global.exception;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.BindException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

  @ExceptionHandler(IllegalArgumentException.class)
  public ResponseEntity<ErrorResponse> handleIllegalArgumentException(IllegalArgumentException ex) {
    log.error("IllegalArgumentException: ", ex);
    ErrorResponse errorResponse = ErrorResponse.of(ex.getMessage(), "INVALID_ARGUMENT");
    return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
  }

  @ExceptionHandler(BusinessException.class)
  public ResponseEntity<ErrorResponse> handleBusinessException(BusinessException ex) {
    log.error("BusinessException: ", ex);
    ErrorResponse errorResponse = ErrorResponse.of(ex.getMessage(), ex.getErrorCode());
    return new ResponseEntity<>(errorResponse, HttpStatus.valueOf(ex.getStatusCode()));
  }

  @ExceptionHandler({AuthenticationException.class, BadCredentialsException.class})
  public ResponseEntity<ErrorResponse> handleAuthenticationException(Exception ex) {
    log.error("AuthenticationException: ", ex);
    ErrorResponse errorResponse =
        ErrorResponse.of("Authentication failed", "AUTHENTICATION_FAILED");
    return new ResponseEntity<>(errorResponse, HttpStatus.UNAUTHORIZED);
  }

  @ExceptionHandler(IllegalStateException.class)
  public ResponseEntity<ErrorResponse> handleIllegalStateException(IllegalStateException ex) {
    log.error("IllegalStateException: ", ex);
    if (ex.getMessage() != null && ex.getMessage().contains("not authenticated")) {
      ErrorResponse errorResponse =
          ErrorResponse.of("Authentication required", "AUTHENTICATION_REQUIRED");
      return new ResponseEntity<>(errorResponse, HttpStatus.UNAUTHORIZED);
    }
    ErrorResponse errorResponse = ErrorResponse.of(ex.getMessage(), "ILLEGAL_STATE");
    return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
  }

  @ExceptionHandler(AccessDeniedException.class)
  public ResponseEntity<ErrorResponse> handleAccessDeniedException(AccessDeniedException ex) {
    log.error("AccessDeniedException: ", ex);
    ErrorResponse errorResponse = ErrorResponse.of("Access denied", "ACCESS_DENIED");
    return new ResponseEntity<>(errorResponse, HttpStatus.FORBIDDEN);
  }

  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<ErrorResponse> handleValidationException(
      MethodArgumentNotValidException ex) {
    log.error("MethodArgumentNotValidException: ", ex);
    List<String> errors =
        ex.getBindingResult().getFieldErrors().stream()
            .map(error -> error.getField() + ": " + error.getDefaultMessage())
            .collect(Collectors.toList());

    ErrorResponse errorResponse = ErrorResponse.of("Validation failed", "VALIDATION_ERROR", errors);
    return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
  }

  @ExceptionHandler(BindException.class)
  public ResponseEntity<ErrorResponse> handleBindException(BindException ex) {
    log.error("BindException: ", ex);
    List<String> errors =
        ex.getBindingResult().getFieldErrors().stream()
            .map(error -> error.getField() + ": " + error.getDefaultMessage())
            .collect(Collectors.toList());

    ErrorResponse errorResponse = ErrorResponse.of("Binding failed", "BINDING_ERROR", errors);
    return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
  }

  @ExceptionHandler(Exception.class)
  public ResponseEntity<ErrorResponse> handleGenericException(Exception ex) {
    log.error("Unexcepted error: ", ex);

    ErrorResponse errorResponse =
        ErrorResponse.of("An unexpected error occurred", "INTERNAL_ERROR");
    return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
