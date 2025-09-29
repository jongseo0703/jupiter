package com.example.communityservice.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import com.example.communityservice.dto.auth.AuthApiResponse;
import com.example.communityservice.dto.auth.UserInfoResponse;
import com.example.communityservice.global.exception.BusinessException;
import com.example.communityservice.global.exception.ErrorCode;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/** 인증 관련 비즈니스 로직 처리 서비스 외부 인증 서비스와 통신하여 토큰 유효성 검증 및 사용자 정보 조회 */
@Service
@Slf4j
@RequiredArgsConstructor
public class AuthService {

  private final RestTemplate restTemplate = new RestTemplate();
  private final ObjectMapper objectMapper = new ObjectMapper();

  @Value("${auth.service.url:http://localhost:8080/auth}")
  private String authServiceUrl;

  public UserInfoResponse validateTokenAndGetUser(String authorizationHeader) {
    String fullUrl = authServiceUrl + "/api/v1/auth/me";
    log.info("인증 서비스 호출 URL: {}", fullUrl);
    log.info("인증 헤더: {}", authorizationHeader);

    try {
      HttpHeaders headers = new HttpHeaders();
      headers.set("Authorization", authorizationHeader);

      HttpEntity<Void> entity = new HttpEntity<>(headers);

      ResponseEntity<String> response =
          restTemplate.exchange(fullUrl, HttpMethod.GET, entity, String.class);

      log.info("인증 서비스 원본 응답 본문: {}", response.getBody());

      AuthApiResponse apiResponse =
          objectMapper.readValue(response.getBody(), AuthApiResponse.class);

      if (response.getStatusCode().is2xxSuccessful() && apiResponse.isSuccess()) {
        return apiResponse.getData();
      } else {
        log.error(
            "인증 서비스 응답 실패. 상태: {}, 메시지: {}", response.getStatusCode(), apiResponse.getMessage());
        throw new BusinessException(ErrorCode.AUTHENTICATION_FAILED);
      }
    } catch (RestClientException e) {
      log.error("인증 서비스 호출 실패: ", e);
      throw new BusinessException(ErrorCode.AUTH_SERVICE_ERROR);
    } catch (Exception e) {
      log.error("인증 응답 처리 실패: ", e);
      throw new BusinessException(ErrorCode.AUTHENTICATION_FAILED);
    }
  }
}
