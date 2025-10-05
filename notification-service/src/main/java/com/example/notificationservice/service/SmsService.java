package com.example.notificationservice.service;

import lombok.extern.slf4j.Slf4j;
import net.nurigo.sdk.NurigoApp;
import net.nurigo.sdk.message.model.Message;
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

    public void sendPriceAlert(String phoneNumber, String productName, int oldPrice, int newPrice, int discountPercent) {
        try {
            DefaultMessageService messageService =
                NurigoApp.INSTANCE.initialize(apiKey, apiSecret, "https://api.coolsms.co.kr");

            Message message = new Message();
            message.setFrom(fromNumber);
            message.setTo(phoneNumber);
            message.setText(String.format(
                "[Jupiter] 가격 알림\n%s\n기존: %,d원 → 현재: %,d원 (%d%% 할인)",
                productName, oldPrice, newPrice, discountPercent
            ));

            SingleMessageSentResponse response =
                messageService.sendOne(new SingleMessageSendingRequest(message));

            log.info("가격 알림 SMS 발송 성공 - 번호: {}, 상품: {}, 메시지ID: {}",
                phoneNumber, productName, response.getMessageId());

        } catch (Exception e) {
            log.error("가격 알림 SMS 발송 실패 - 번호: {}, 상품: {}, 에러: {}",
                phoneNumber, productName, e.getMessage(), e);
        }
    }
}
