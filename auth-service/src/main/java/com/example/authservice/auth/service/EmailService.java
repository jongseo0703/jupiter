package com.example.authservice.auth.service;

import jakarta.mail.internet.MimeMessage;

import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

  private final JavaMailSender mailSender;

  public void sendTemporaryPassword(String toEmail, String temporaryPassword) {
    try {
      MimeMessage message = mailSender.createMimeMessage();
      MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

      helper.setTo(toEmail);
      helper.setSubject("임시 비밀번호 발송");
      helper.setText(createEmailContent(temporaryPassword), true);

      mailSender.send(message);
      log.info("임시 비밀번호 이메일 발송 완료: {}", toEmail);

    } catch (Exception e) {
      log.error("이메일 발송 실패: {}, 오류: {}", toEmail, e.getMessage());
      throw new RuntimeException("이메일 발송에 실패했습니다.", e);
    }
  }

  private String createEmailContent(String temporaryPassword) {
    return String.format(
        """
        <html>
        <body>
        <h2>임시 비밀번호 안내</h2>
        <p>안녕하세요!</p>
        <p>요청하신 임시 비밀번호를 발송해드립니다.</p>
        <div style="background-color: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 5px;">
            <h3>임시 비밀번호: <span style="color: #007bff;">%s</span></h3>
        </div>
        <p><strong>보안을 위해 로그인 후 반드시 비밀번호를 변경해주세요.</strong></p>
        <p>감사합니다.</p>
        </body>
        </html>
        """,
        temporaryPassword);
  }
}
