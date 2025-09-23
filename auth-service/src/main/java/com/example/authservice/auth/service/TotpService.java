package com.example.authservice.auth.service;

import java.security.SecureRandom;

import org.apache.commons.codec.binary.Base32;
import org.springframework.stereotype.Service;

import de.taimos.totp.TOTP;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class TotpService {

  /** Google Authenticator 호환 Base32 시크릿 생성 */
  public String generateSecret() {
    SecureRandom random = new SecureRandom();
    byte[] bytes = new byte[20]; // 160 비트
    random.nextBytes(bytes);
    Base32 base32 = new Base32();
    return base32.encodeToString(bytes).replaceAll("=", ""); // 패딩 제거
  }

  /** TOTP 코드 검증 */
  public boolean verifyCode(String secret, String code) {
    try {
      if (secret == null || code == null) {
        log.debug(
            "Secret 또는 code가 null입니다. secret: {}, code: {}", secret != null ? "있음" : "null", code);
        return false;
      }

      log.debug("TOTP 검증 시작 - Secret: {}, Code: {}", secret, code);

      // Base32 시크릿을 바이트 배열로 변환
      Base32 base32 = new Base32();
      byte[] secretBytes = base32.decode(secret);

      // 바이트 배열을 16진수 문자열로 변환
      StringBuilder hexString = new StringBuilder();
      for (byte b : secretBytes) {
        hexString.append(String.format("%02x", b));
      }
      String hexSecret = hexString.toString().toUpperCase();

      log.debug("Base32 secret을 16진수로 변환: {} -> {}", secret, hexSecret);

      // 현재 시간 기준으로 검증
      String expectedCode = TOTP.getOTP(hexSecret);
      log.debug("현재 시간 기준 TOTP 코드: {}, 입력된 코드: {}", expectedCode, code);

      boolean isValid = expectedCode.equals(code);
      if (isValid) {
        log.info("TOTP 검증 성공");
      } else {
        log.warn("TOTP 검증 실패 - 예상 코드: {}, 입력 코드: {}", expectedCode, code);
      }

      return isValid;
    } catch (Exception e) {
      log.error("TOTP 검증 중 오류 발생: {}", e.getMessage(), e);
      return false;
    }
  }

  /** QR 코드용 URI 생성 */
  public String generateQRCodeURI(String secret, String userEmail, String issuer) {
    return String.format(
        "otpauth://totp/%s:%s?secret=%s&issuer=%s", issuer, userEmail, secret, issuer);
  }
}
