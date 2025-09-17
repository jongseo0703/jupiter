package com.example.authservice.global.util;

import java.security.SecureRandom;

import org.springframework.stereotype.Component;

@Component
public class PasswordGenerator {

  private static final String UPPERCASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  private static final String LOWERCASE = "abcdefghijklmnopqrstuvwxyz";
  private static final String DIGITS = "0123456789";
  private static final String SPECIAL_CHARS = "!@#$%^&*";

  private static final String ALL_CHARS = UPPERCASE + LOWERCASE + DIGITS + SPECIAL_CHARS;
  private static final SecureRandom random = new SecureRandom();

  public String generateTemporaryPassword() {
    int length = 12; // 임시 비밀번호 길이
    StringBuilder password = new StringBuilder();

    // 각 카테고리에서 최소 1개씩 포함
    password.append(UPPERCASE.charAt(random.nextInt(UPPERCASE.length())));
    password.append(LOWERCASE.charAt(random.nextInt(LOWERCASE.length())));
    password.append(DIGITS.charAt(random.nextInt(DIGITS.length())));
    password.append(SPECIAL_CHARS.charAt(random.nextInt(SPECIAL_CHARS.length())));

    // 나머지 자리수는 랜덤으로 채움
    for (int i = 4; i < length; i++) {
      password.append(ALL_CHARS.charAt(random.nextInt(ALL_CHARS.length())));
    }

    // 문자열을 섞음
    return shuffleString(password.toString());
  }

  private String shuffleString(String string) {
    char[] array = string.toCharArray();
    for (int i = array.length - 1; i > 0; i--) {
      int j = random.nextInt(i + 1);
      char temp = array[i];
      array[i] = array[j];
      array[j] = temp;
    }
    return new String(array);
  }
}
