package com.example.productservice.service;

import com.example.productservice.domain.Price;
import com.example.productservice.domain.PriceLog;
import com.example.productservice.dto.PriceChangeRequest;
import com.example.productservice.repository.PriceLogRepository;
import com.example.productservice.repository.PriceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.sql.Timestamp;

@Slf4j
@Service
@RequiredArgsConstructor
public class PriceUpdateService {

    private final PriceRepository priceRepository;
    private final PriceLogRepository priceLogRepository;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${gateway.url:http://localhost:8080}")
    private String gatewayUrl;

    /**
     * 가격 업데이트 및 알림 전송
     *
     * @param priceId  가격 ID
     * @param newPrice 새로운 가격
     */
    @Transactional
    public void updatePrice(Integer priceId, Integer newPrice) {
        Price price = priceRepository.findById(priceId)
                .orElseThrow(() -> new RuntimeException("가격 정보를 찾을 수 없습니다."));

        Integer oldPrice = price.getPrice();

        // 가격이 변동되지 않았으면 종료
        if (oldPrice.equals(newPrice)) {
            log.info("가격 변동 없음 - priceId: {}, price: {}", priceId, oldPrice);
            return;
        }

        // 가격 업데이트
        price.setPrice(newPrice);
        priceRepository.save(price);

        // 가격 로그 저장
        PriceLog priceLog = new PriceLog();
        priceLog.setNewPrice(newPrice);
        priceLog.setCreatedAt(new Timestamp(System.currentTimeMillis()));
        priceLog.setPrice(price);
        priceLogRepository.save(priceLog);

        log.info("가격 업데이트 완료 - priceId: {}, oldPrice: {}, newPrice: {}", priceId, oldPrice, newPrice);

        // notification-service에 가격 변동 알림 요청
        try {
            PriceChangeRequest request = new PriceChangeRequest(
                    price.getProductShop().getProduct().getProductId(),
                    price.getProductShop().getProduct().getProductName(),
                    oldPrice,
                    newPrice,
                    price.getProductShop().getShop().getShopName());

            String url = gatewayUrl + "/notification/api/notifications/price-change";
            restTemplate.postForObject(url, request, String.class);
            log.info("가격 변동 알림 전송 완료 - productId: {}", request.productId());
        } catch (Exception e) {
            log.error("가격 변동 알림 전송 실패: {}", e.getMessage());
        }
    }
}
