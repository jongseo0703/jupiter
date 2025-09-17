package com.example.authservice.auth.security;

import java.io.IOException;
import java.time.LocalDateTime;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * JWT 인증 진입점임.
 *
 * <p>- Spring Security에서 인증이 필요한 리소스에 인증되지 않은 사용자가 접근했을 때 호출됨 - JSON 형식으로 오류 응답 반환 - HTTP 상태 코드:
 * 401 UNAUTHORIZED
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint {

  private final ObjectMapper objectMapper;

  @Override
  public void commence(
      HttpServletRequest request,
      HttpServletResponse response,
      AuthenticationException authException)
      throws IOException {

    log.warn(
        "Unauthorized request to {} - {}", request.getRequestURI(), authException.getMessage());

    response.setContentType("application/json;charset=UTF-8");
    response.setStatus(HttpStatus.UNAUTHORIZED.value());

    ErrorResponse errorResponse =
        ErrorResponse.builder()
            .result("ERROR")
            .message("Authentication required")
            .errorCode("AUTHENTICATION_REQUIRED")
            .timestamp(LocalDateTime.now())
            .build();

    response.getWriter().write(objectMapper.writeValueAsString(errorResponse));
  }

  private static class ErrorResponse {
    public String result;
    public String message;
    public String errorCode;
    public LocalDateTime timestamp;

    public static ErrorResponseBuilder builder() {
      return new ErrorResponseBuilder();
    }

    public static class ErrorResponseBuilder {
      private final ErrorResponse errorResponse = new ErrorResponse();

      public ErrorResponseBuilder result(String result) {
        errorResponse.result = result;
        return this;
      }

      public ErrorResponseBuilder message(String message) {
        errorResponse.message = message;
        return this;
      }

      public ErrorResponseBuilder errorCode(String errorCode) {
        errorResponse.errorCode = errorCode;
        return this;
      }

      public ErrorResponseBuilder timestamp(LocalDateTime timestamp) {
        errorResponse.timestamp = timestamp;
        return this;
      }

      public ErrorResponse build() {
        return errorResponse;
      }
    }
  }
}
