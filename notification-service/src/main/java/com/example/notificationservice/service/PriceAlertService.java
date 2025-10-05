package com.example.notificationservice.service;

import com.example.notificationservice.dto.PriceChangeRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.beans.factory.annotation.Value;

import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class PriceAlertService {

    private final SmsService smsService;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${auth-service.url:http://localhost:8081}")
    private String authServiceUrl;

    public void processPriceChange(PriceChangeRequest request) {
        // 할인율 계산
        int discountPercent = calculateDiscountPercent(request.oldPrice(), request.newPrice());

        if (discountPercent <= 0) {
            log.info("가격이 상승했거나 동일합니다. 알림을 발송하지 않습니다.");
            return;
        }

        // auth-service에서 알림 설정을 가져와서 조건에 맞는 사용자에게 SMS 발송
        try {
            String url = authServiceUrl + "/api/v1/notification-settings/active";
            List<Map<String, Object>> settingsList = restTemplate.getForObject(url, List.class);

            if (settingsList != null) {
                for (Map<String, Object> settings : settingsList) {
                    Integer minDiscountPercent = (Integer) settings.get("minDiscountPercent");
                    Boolean pushNotifications = (Boolean) settings.get("pushNotifications");

                    if (pushNotifications && discountPercent >= minDiscountPercent) {
                        Map<String, Object> user = (Map<String, Object>) settings.get("user");
                        String phoneNumber = (String) user.get("phone");

                        if (phoneNumber != null && !phoneNumber.isEmpty()) {
                            smsService.sendPriceAlert(
                                phoneNumber,
                                request.productName(),
                                request.oldPrice(),
                                request.newPrice(),
                                discountPercent
                            );
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.error("가격 알림 처리 중 오류 발생: {}", e.getMessage(), e);
        }
    }

    private int calculateDiscountPercent(int oldPrice, int newPrice) {
        if (oldPrice <= 0) return 0;
        return (int) Math.round(((double) (oldPrice - newPrice) / oldPrice) * 100);
    }
}
