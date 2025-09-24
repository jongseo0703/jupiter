package com.example.authservice.common.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.Data;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class RecaptchaService {

  @Value("${recaptcha.secret}")
  private String recaptchaSecret;

  private static final String RECAPTCHA_VERIFY_URL =
      "https://www.google.com/recaptcha/api/siteverify";

  private final RestTemplate restTemplate = new RestTemplate();
  private final ObjectMapper objectMapper = new ObjectMapper();

  /**
   * reCAPTCHA 토큰을 검증합니다.
   *
   * @param recaptchaResponse 프론트엔드에서 받은 reCAPTCHA 토큰
   * @param clientIp 클라이언트 IP 주소 (선택적)
   * @return 검증 성공 여부
   */
  public boolean verifyRecaptcha(String recaptchaResponse, String clientIp) {
    if (recaptchaResponse == null || recaptchaResponse.trim().isEmpty()) {
      log.warn("reCAPTCHA response is null or empty");
      return false;
    }

    try {
      // Google reCAPTCHA API에 검증 요청
      HttpHeaders headers = new HttpHeaders();
      headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

      MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
      params.add("secret", recaptchaSecret);
      params.add("response", recaptchaResponse);
      if (clientIp != null && !clientIp.trim().isEmpty()) {
        params.add("remoteip", clientIp);
      }

      HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(params, headers);

      ResponseEntity<String> response =
          restTemplate.postForEntity(RECAPTCHA_VERIFY_URL, request, String.class);

      if (response.getStatusCode().is2xxSuccessful()) {
        RecaptchaResponse recaptchaVerifyResponse =
            objectMapper.readValue(response.getBody(), RecaptchaResponse.class);

        if (recaptchaVerifyResponse.isSuccess()) {
          log.info("reCAPTCHA verification successful");
          return true;
        } else {
          log.warn(
              "reCAPTCHA verification failed. Error codes: {}",
              recaptchaVerifyResponse.getErrorCodes());
          return false;
        }
      } else {
        log.error("reCAPTCHA API request failed with status: {}", response.getStatusCode());
        return false;
      }

    } catch (Exception e) {
      log.error("Error verifying reCAPTCHA", e);
      return false;
    }
  }

  @Data
  static class RecaptchaResponse {
    private boolean success;

    @JsonProperty("challenge_ts")
    private String challengeTs;

    private String hostname;

    @JsonProperty("error-codes")
    private String[] errorCodes;
  }
}
