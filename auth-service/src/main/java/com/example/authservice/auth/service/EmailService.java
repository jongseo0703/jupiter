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
      helper.setText(createTemporaryPasswordContent(temporaryPassword), true);

      mailSender.send(message);
      log.info("임시 비밀번호 이메일 발송 완료: {}", toEmail);

    } catch (Exception e) {
      log.error("이메일 발송 실패: {}, 오류: {}", toEmail, e.getMessage());
      throw new RuntimeException("이메일 발송에 실패했습니다.", e);
    }
  }

  public void sendSuspiciousActivityAlert(
      String toEmail, String activityType, String details, String ipAddress, String userAgent) {
    try {
      MimeMessage message = mailSender.createMimeMessage();
      MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

      helper.setTo(toEmail);
      helper.setSubject("[보안 알림] 의심스러운 활동이 감지되었습니다");
      helper.setText(
          createSuspiciousActivityContent(activityType, details, ipAddress, userAgent), true);

      mailSender.send(message);
      log.info("의심스러운 활동 알림 이메일 발송 완료: {}", toEmail);

    } catch (Exception e) {
      log.error("의심스러운 활동 알림 이메일 발송 실패: {}, 오류: {}", toEmail, e.getMessage());
      throw new RuntimeException("이메일 발송에 실패했습니다.", e);
    }
  }

  private String createTemporaryPasswordContent(String temporaryPassword) {
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

  private String createSuspiciousActivityContent(
      String activityType, String details, String ipAddress, String userAgent) {
    return String.format(
        """
        <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #dc3545; color: white; padding: 20px; text-align: center;">
            <h2>🚨 보안 알림</h2>
        </div>

        <div style="padding: 20px;">
            <h3>의심스러운 활동이 감지되었습니다</h3>
            <p>안녕하세요!</p>
            <p>귀하의 계정에서 의심스러운 활동이 감지되어 알림을 보내드립니다.</p>

            <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; margin: 20px 0; border-radius: 5px;">
                <h4 style="color: #856404; margin-top: 0;">감지된 활동:</h4>
                <ul style="color: #856404;">
                    <li><strong>유형:</strong> %s</li>
                    <li><strong>상세 내용:</strong> %s</li>
                    <li><strong>IP 주소:</strong> %s</li>
                    <li><strong>브라우저 정보:</strong> %s</li>
                    <li><strong>감지 시간:</strong> %s</li>
                </ul>
            </div>

            <div style="background-color: #f8f9fa; padding: 15px; margin: 20px 0; border-radius: 5px;">
                <h4>권장 조치:</h4>
                <ul>
                    <li>만약 본인의 활동이 아니라면 즉시 비밀번호를 변경해주세요</li>
                    <li>2단계 인증이 설정되어 있지 않다면 활성화를 권장합니다</li>
                    <li>의심스러운 활동이 계속되면 관리자에게 문의해주세요</li>
                </ul>
            </div>

            <p>계정 보안을 위해 정기적으로 비밀번호를 변경하시기 바랍니다.</p>
            <p>감사합니다.</p>
        </div>

        <div style="background-color: #f8f9fa; padding: 10px; text-align: center; color: #6c757d; font-size: 12px;">
            이 메일은 자동으로 발송된 보안 알림입니다.
        </div>
        </body>
        </html>
        """,
        activityType,
        details,
        ipAddress,
        userAgent,
        java.time.LocalDateTime.now()
            .format(java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
  }
}
