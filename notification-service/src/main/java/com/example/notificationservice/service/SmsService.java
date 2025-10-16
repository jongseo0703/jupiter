package com.example.notificationservice.service;

import lombok.extern.slf4j.Slf4j;
import net.nurigo.sdk.NurigoApp;
import net.nurigo.sdk.message.model.Message;
import net.nurigo.sdk.message.model.MessageType;
import net.nurigo.sdk.message.request.SingleMessageSendingRequest;
import net.nurigo.sdk.message.response.SingleMessageSentResponse;
import net.nurigo.sdk.message.service.DefaultMessageService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class SmsService {

    @Value("${coolsms.api.key}")
    private String apiKey;

    @Value("${coolsms.api.secret}")
    private String apiSecret;

    @Value("${coolsms.from.number}")
    private String fromNumber;

    public void sendPriceAlert(String phoneNumber, String productName, int oldPrice, int newPrice, int priceDropAmount) {
        try {
            DefaultMessageService messageService =
                NurigoApp.INSTANCE.initialize(apiKey, apiSecret, "https://api.coolsms.co.kr");

            int discountPercent = oldPrice > 0 ? (int) Math.round(((double) priceDropAmount / oldPrice) * 100) : 0;

            Message message = new Message();
            message.setFrom(fromNumber);
            message.setTo(phoneNumber);

            // SMS 제목 설정 (상품명 제외)
            message.setSubject("[Ju(酒)piter] 가격 하락 알림");

            // 간결하고 보기 좋은 메시지 형식
            String messageText = String.format(
                "%s\n" +
                "어제: %,d원\n" +
                "오늘: %,d원\n" +
                "↓ %,d원 하락 (%d%%)",
                productName, oldPrice, newPrice, priceDropAmount, discountPercent
            );

            message.setText(messageText);

            SingleMessageSentResponse response =
                messageService.sendOne(new SingleMessageSendingRequest(message));

            log.info("가격 알림 SMS 발송 성공 - 번호: {}, 상품: {}, 하락: {}원({}%), 메시지ID: {}",
                phoneNumber, productName, priceDropAmount, discountPercent, response.getMessageId());

        } catch (Exception e) {
            log.error("가격 알림 SMS 발송 실패 - 번호: {}, 상품: {}, 에러: {}",
                phoneNumber, productName, e.getMessage(), e);
        }
    }
}
