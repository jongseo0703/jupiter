package com.example.authservice.auth.service;

import java.time.LocalDateTime;
import java.util.Random;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.authservice.auth.dto.PhoneVerificationConfirmRequest;
import com.example.authservice.auth.dto.PhoneVerificationRequest;
import com.example.authservice.auth.entity.PhoneVerification;
import com.example.authservice.auth.repository.PhoneVerificationRepository;
import com.example.authservice.global.exception.BusinessException;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.nurigo.sdk.NurigoApp;
import net.nurigo.sdk.message.model.Message;
import net.nurigo.sdk.message.request.SingleMessageSendingRequest;
import net.nurigo.sdk.message.response.SingleMessageSentResponse;
import net.nurigo.sdk.message.service.DefaultMessageService;

@Slf4j
@Service
@RequiredArgsConstructor
public class SmsService {

  private final PhoneVerificationRepository phoneVerificationRepository;

  @Value("${coolsms.api.key}")
  private String apiKey;

  @Value("${coolsms.api.secret}")
  private String apiSecret;

  @Value("${coolsms.from.number}")
  private String fromNumber;

  @Transactional
  public void sendVerificationCode(PhoneVerificationRequest request) {
    String phoneNumber = normalizePhoneNumber(request.phoneNumber());
    String verificationCode = generateVerificationCode();

    // 기존 인증코드 만료 처리
    invalidateExistingCodes(phoneNumber);

    // 새 인증코드 저장
    PhoneVerification verification =
        PhoneVerification.builder()
            .phoneNumber(phoneNumber)
            .verificationCode(verificationCode)
            .createdAt(LocalDateTime.now())
            .expiresAt(LocalDateTime.now().plusMinutes(5)) // 5분 유효
            .build();

    phoneVerificationRepository.save(verification);

    // 실제 SMS 발송 (개발 환경에서는 로그로 대체)
    sendSms(phoneNumber, verificationCode);

    log.info("인증번호 발송 완료: {} -> {}", phoneNumber, verificationCode);
  }

  @Transactional
  public boolean verifyCode(PhoneVerificationConfirmRequest request) {
    String phoneNumber = normalizePhoneNumber(request.phoneNumber());
    String code = request.verificationCode();

    // 최근 인증코드 조회
    PhoneVerification verification =
        phoneVerificationRepository
            .findTopByPhoneNumberOrderByCreatedAtDesc(phoneNumber)
            .orElseThrow(
                () -> new BusinessException("인증번호를 찾을 수 없습니다.", 404, "VERIFICATION_NOT_FOUND"));

    // 만료 확인
    if (verification.isExpired()) {
      throw new BusinessException("인증번호가 만료되었습니다.", 400, "VERIFICATION_EXPIRED");
    }

    // 이미 사용됨 확인
    if (verification.isUsed()) {
      throw new BusinessException("이미 사용된 인증번호입니다.", 400, "VERIFICATION_ALREADY_USED");
    }

    // 인증번호 일치 확인
    if (!verification.getVerificationCode().equals(code)) {
      throw new BusinessException("인증번호가 일치하지 않습니다.", 400, "VERIFICATION_CODE_MISMATCH");
    }

    // 인증 완료 처리
    verification.markAsVerified();
    phoneVerificationRepository.save(verification);

    log.info("인증 완료: {}", phoneNumber);
    return true;
  }

  @Transactional
  public boolean isPhoneVerified(String phoneNumber) {
    String normalizedPhone = normalizePhoneNumber(phoneNumber);
    return phoneVerificationRepository.existsByPhoneNumberAndVerifiedTrueAndUsedFalse(
        normalizedPhone);
  }

  @Transactional
  public void markVerificationAsUsed(String phoneNumber) {
    String normalizedPhone = normalizePhoneNumber(phoneNumber);
    phoneVerificationRepository
        .findTopByPhoneNumberOrderByCreatedAtDesc(normalizedPhone)
        .ifPresent(
            verification -> {
              if (verification.isVerified() && !verification.isUsed()) {
                verification.markAsUsed();
                phoneVerificationRepository.save(verification);
              }
            });
  }

  @Transactional
  public void cleanupExpiredVerifications() {
    phoneVerificationRepository.deleteExpiredVerifications(LocalDateTime.now());
  }

  private void invalidateExistingCodes(String phoneNumber) {
    phoneVerificationRepository
        .findTopByPhoneNumberOrderByCreatedAtDesc(phoneNumber)
        .ifPresent(
            verification -> {
              if (!verification.isUsed() && !verification.isExpired()) {
                verification.markAsUsed();
                phoneVerificationRepository.save(verification);
              }
            });
  }

  private String generateVerificationCode() {
    Random random = new Random();
    return String.format("%06d", random.nextInt(1000000));
  }

  private String normalizePhoneNumber(String phoneNumber) {
    return phoneNumber.replaceAll("[^0-9]", "");
  }

  private void sendSms(String phoneNumber, String verificationCode) {
    try {
      // CoolSMS 서비스 초기화
      DefaultMessageService messageService =
          NurigoApp.INSTANCE.initialize(apiKey, apiSecret, "https://api.coolsms.co.kr");

      // 메시지 생성
      Message message = new Message();
      message.setFrom(fromNumber);
      message.setTo(phoneNumber);
      message.setText(String.format("[Jupiter] 인증번호: %s (5분간 유효)", verificationCode));

      // SMS 발송
      SingleMessageSentResponse response =
          messageService.sendOne(new SingleMessageSendingRequest(message));

      log.info("SMS 발송 성공 - 번호: {}, 메시지ID: {}", phoneNumber, response.getMessageId());

    } catch (Exception e) {
      log.error("SMS 발송 실패 - 번호: {}, 에러: {}", phoneNumber, e.getMessage(), e);
      throw new BusinessException("SMS 발송에 실패했습니다", 500, "SMS_SEND_FAILED");
    }
  }
}
