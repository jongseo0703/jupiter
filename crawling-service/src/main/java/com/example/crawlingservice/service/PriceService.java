package com.example.crawlingservice.service;

import com.example.crawlingservice.db.PriceLogMapper;
import com.example.crawlingservice.db.PriceMapper;
import com.example.crawlingservice.domain.Price;
import com.example.crawlingservice.domain.PriceLog;
import com.example.crawlingservice.domain.ProductShop;
import com.example.crawlingservice.dto.PriceDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.beans.factory.annotation.Value;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

/**
 * 가격 정보 저장하는 서비스
 */
@Service
@Transactional
@Slf4j
@RequiredArgsConstructor
public class PriceService {
    private final PriceMapper priceMapper;
    private final PriceLogMapper priceLogMapper;
    private final RestTemplate restTemplate;

    @Value("${notification.service.url:http://localhost:8086}")
    private String notificationServiceUrl;

    // 가격이 변경된 상품 ID를 추적하는 Set
    private final Set<Integer> updatedProductIds = new HashSet<>();

    /**
     * 가격정보 저장하는 메서드<br>
     * 이미 존재하는 상품 가격일 경우 가격과 배송비만 업데이트
     * 개별 상점 가격 변동 시 알림을 보내지 않고, 상품 ID만 추적
     * @param priceDTO 가격 정보
     * @param productShop 상품_상점 정보
     */
    public void savePrice(PriceDTO priceDTO, ProductShop productShop) {
        // 기존 가격 정보 조회
        Price existing = priceMapper.selectByProductShopId(productShop.getProductShopId());
        PriceLog priceLog = new PriceLog();

        if (existing != null) {
            //DB에 저장된 가격과 priceDTO 가격 비교
            if(existing.getPrice() != priceDTO.getPrice()){
                //가격이 다를 경우 price_log에 저장
                priceLog.setNewPrice(existing.getPrice());
                priceLog.setPrice(existing);
                int result =priceLogMapper.insert(priceLog);

                if (result > 0) {
                    log.debug("변경 가격 로그 저장 - 상품ID: {}, 상점: {}, 기존가격: {}원, 신규가격: {}원",
                             productShop.getProduct().getProductId(),
                             productShop.getShop().getShopName(),
                             existing.getPrice(),
                             priceDTO.getPrice());
                }

                // 가격이 변경된 상품 ID 추적 (나중에 배치 알림용)
                updatedProductIds.add(productShop.getProduct().getProductId());
            }
            // 기존 가격이 있으면 업데이트
            existing.setPrice(priceDTO.getPrice());
            existing.setDeliveryFee(priceDTO.getDeliveryFee());

            priceMapper.update(existing);
        } else {
            // 새 가격 정보 생성
            Price newPrice = new Price();
            newPrice.setPrice(priceDTO.getPrice());
            newPrice.setDeliveryFee(priceDTO.getDeliveryFee());
            newPrice.setProductShop(productShop);

            priceMapper.insert(newPrice);

            //초기가격 로그 저장
            priceLog.setNewPrice(newPrice.getPrice());
            priceLog.setPrice(newPrice);
            int result =priceLogMapper.insert(priceLog);
            if (result > 0) {
                log.debug("초기 가격을 로그에 저장 - 상품ID: {}, 가격: {}원",
                         productShop.getProduct().getProductId(),
                         newPrice.getPrice());
            }
        }
    }

    /**
     * 크롤링 완료 후 호출: 가격이 변경된 모든 상품에 대해
     * 상품별 최저가를 비교하여 하락한 경우에만 알림 전송
     */
    public void sendBatchPriceAlerts() {
        if (updatedProductIds.isEmpty()) {
            log.info("가격이 변경된 상품이 없습니다.");
            return;
        }

        log.info("총 {}개 상품의 가격 변동 알림 체크 시작", updatedProductIds.size());

        for (Integer productId : updatedProductIds) {
            try {
                // Product-service의 알림 API 호출
                String url = notificationServiceUrl.replace("8086", "8085") + "/api/prices/check-alert/" + productId;
                restTemplate.postForObject(url, null, String.class);
                log.debug("상품 ID {}의 가격 알림 체크 요청 전송", productId);
            } catch (Exception e) {
                log.error("상품 ID {}의 가격 알림 체크 실패: {}", productId, e.getMessage());
            }
        }

        // 처리 완료 후 Set 초기화
        updatedProductIds.clear();
        log.info("가격 변동 알림 배치 처리 완료");
    }
}
