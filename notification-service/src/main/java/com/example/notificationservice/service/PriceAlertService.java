package com.example.notificationservice.service;

import com.example.notificationservice.dto.FavoriteUserDto;
import com.example.notificationservice.dto.NotificationSettingsDto;
import com.example.notificationservice.dto.PriceChangeRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class PriceAlertService {

    private final SmsService smsService;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${gateway.url:http://localhost:8080}")
    private String gatewayUrl;

    public void processPriceChange(PriceChangeRequest request) {
        int priceDropAmount = request.oldPrice() - request.newPrice();
        int discountPercent = calculateDiscountPercent(request.oldPrice(), request.newPrice());

        // 가격이 내려가지 않았으면 알림 안 보냄
        if (priceDropAmount <= 0) {
            log.info("가격 상승 또는 변동 없음 - productId: {}, priceChange: {}원", request.productId(), priceDropAmount);
            return;
        }

        log.info("가격 하락 감지 - productId: {}, 하락금액: {}원 ({}%)", request.productId(), priceDropAmount, discountPercent);

        // 1. auth-service에서 해당 상품을 즐겨찾기한 사용자 목록 조회
        String favoriteUrl = gatewayUrl + "/auth/api/v1/favorites/products/" + request.productId() + "/users";

        try {
            ResponseEntity<List<FavoriteUserDto>> favoriteResponse = restTemplate.exchange(
                favoriteUrl,
                HttpMethod.GET,
                null,
                new ParameterizedTypeReference<List<FavoriteUserDto>>() {}
            );

            List<FavoriteUserDto> favoriteUsers = favoriteResponse.getBody();
            if (favoriteUsers == null || favoriteUsers.isEmpty()) {
                log.info("즐겨찾기한 사용자 없음 - productId: {}", request.productId());
                return;
            }

            log.info("즐겨찾기 사용자 {}명 조회 - productId: {}", favoriteUsers.size(), request.productId());

            // 2. 각 사용자의 알림 설정 확인 및 SMS 발송
            for (FavoriteUserDto user : favoriteUsers) {
                try {
                    // 즐겨찾기의 가격 알림 설정 확인
                    if (!Boolean.TRUE.equals(user.priceAlert())) {
                        log.info("사용자의 가격 알림 비활성화 - userId: {}", user.userId());
                        continue;
                    }

                    // 사용자별 알림 설정 조회
                    String settingsUrl = gatewayUrl + "/auth/api/notification-settings/" + user.userId();
                    NotificationSettingsDto settings = restTemplate.getForObject(settingsUrl, NotificationSettingsDto.class);

                    if (settings == null || !Boolean.TRUE.equals(settings.pushNotifications())) {
                        log.info("푸시 알림 비활성화 - userId: {}", user.userId());
                        continue;
                    }

                    // 가격 하락 비율이 최소 설정 비율 이상인 경우에만 발송
                    Integer minDiscountPercent = settings.minDiscountPercent() != null ? settings.minDiscountPercent() : 5;
                    if (discountPercent >= minDiscountPercent) {
                        smsService.sendPriceAlert(
                            user.phone(),
                            request.productName(),
                            request.oldPrice(),
                            request.newPrice(),
                            priceDropAmount
                        );
                        log.info("SMS 발송 완료 - userId: {}, 가격하락: {}원 ({}%)", user.userId(), priceDropAmount, discountPercent);
                    } else {
                        log.info("가격 하락 비율 미달 - userId: {}, 하락비율: {}%, 최소요구: {}%",
                            user.userId(), discountPercent, minDiscountPercent);
                    }
                } catch (Exception e) {
                    log.error("알림 처리 실패 - userId: {}, error: {}", user.userId(), e.getMessage());
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
