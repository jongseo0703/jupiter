package com.example.productservice.service;

import com.example.productservice.domain.Price;
import com.example.productservice.domain.PriceLog;
import com.example.productservice.dto.PriceChangeRequest;
import com.example.productservice.repository.PriceLogRepository;
import com.example.productservice.repository.PriceRepository;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
@RequiredArgsConstructor
public class PriceUpdateService {

    private final PriceRepository priceRepository;
    private final PriceLogRepository priceLogRepository;
    private final EntityManager entityManager;
    private final ApplicationContext applicationContext;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${gateway.url:http://localhost:8080}")
    private String gatewayUrl;

    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);

    /**
     * 가격 업데이트 (지연 알림 전송)
     * 관리자가 수동으로 가격을 변경할 때 사용
     * 같은 상품의 여러 상점 가격을 연속으로 변경해도 3초 후 한 번만 알림 전송
     *
     * @param priceId  가격 ID
     * @param newPrice 새로운 가격
     */
    @Transactional
    public void updatePrice(Integer priceId, Integer newPrice) {
        Price price = priceRepository.findById(priceId)
                .orElseThrow(() -> new RuntimeException("가격 정보를 찾을 수 없습니다."));

        Integer currentPrice = price.getPrice();
        Integer productId = price.getProductShop().getProduct().getProductId();

        // 가격이 변동되지 않았으면 종료
        if (currentPrice.equals(newPrice)) {
            log.debug("가격 변동 없음 - priceId: {}, price: {}", priceId, currentPrice);
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

        // EntityManager flush로 DB에 즉시 반영
        entityManager.flush();

        log.debug("가격 업데이트 완료 - priceId: {}, productId: {}, oldPrice: {}원, newPrice: {}원",
            priceId, productId, currentPrice, newPrice);

        // 3초 후 실행되는 알림 작업 예약
        // 알림에서는 "어제 최저가 vs 현재 최저가"를 비교하므로, oldProductLowestPrice를 따로 저장할 필요 없음
        scheduler.schedule(() -> sendDelayedPriceAlert(productId), 3, TimeUnit.SECONDS);

        log.debug("가격 알림 예약 - productId: {}, 3초 후 최저가 체크 및 알림 전송", productId);
    }

    /**
     * 지연된 가격 알림 전송 (3초 후 실행)
     * 별도 트랜잭션에서 실행되어야 함
     */
    private void sendDelayedPriceAlert(Integer productId) {
        try {
            // ApplicationContext를 통해 프록시 빈을 가져와서 @Transactional이 작동하도록 함
            PriceUpdateService proxy = applicationContext.getBean(PriceUpdateService.class);
            // checkAndSendPriceAlert 메서드를 재사용 (어제 최저가 vs 현재 최저가 비교)
            proxy.checkAndSendPriceAlert(productId);
        } catch (Exception e) {
            log.error("지연 알림 전송 실패 - productId: {}, 에러: {}", productId, e.getMessage(), e);
        }
    }

    /**
     * 현재 상품의 최저가 계산 (배송비 포함)
     */
    private Integer calculateCurrentLowestPrice(Integer productId) {
        List<Price> prices = priceRepository.findAllByProductShop_Product_ProductId(productId);

        if (prices.isEmpty()) {
            return null;
        }

        return prices.stream()
            .mapToInt(p -> p.getPrice() + p.getDeliveryFee())
            .min()
            .orElse(Integer.MAX_VALUE);
    }

    /**
     * 어제 최저가 계산 (배송비 포함)
     * ProductService와 동일한 로직: 어제 하루(1일 전 00:00 ~ 23:59)의 price_log에서 최저가 계산
     */
    private Integer calculateYesterdayLowestPrice(Integer productId) {
        LocalDate yesterday = LocalDate.now().minusDays(1);
        LocalDateTime startOfYesterday = yesterday.atStartOfDay();
        LocalDateTime endOfYesterday = yesterday.atTime(LocalTime.MAX);

        List<PriceLog> yesterdayPriceLogs = priceLogRepository.findYesterdayPriceLogsByProductId(
            productId, startOfYesterday, endOfYesterday
        );

        if (yesterdayPriceLogs.isEmpty()) {
            return null;
        }

        return yesterdayPriceLogs.stream()
            .mapToInt(priceLog -> {
                int logPrice = priceLog.getNewPrice();
                int deliveryFee = priceLog.getPrice().getDeliveryFee();
                return logPrice + deliveryFee;
            })
            .min()
            .orElse(0);
    }

    /**
     * 특정 상품의 가격 하락 여부를 체크하고 알림 전송
     * 크롤링 배치 작업 완료 후 호출됨
     * @param productId 상품 ID
     */
    @Transactional(readOnly = true)
    public void checkAndSendPriceAlert(Integer productId) {
        try {
            // 어제 최저가 계산
            Integer yesterdayLowestPrice = calculateYesterdayLowestPrice(productId);

            // 오늘 현재 최저가 계산
            Integer todayLowestPrice = calculateCurrentLowestPrice(productId);

            log.info("가격 알림 체크 - productId: {}, 어제최저가: {}원, 오늘최저가: {}원",
                    productId, yesterdayLowestPrice, todayLowestPrice);

            // 어제 최저가와 오늘 최저가를 비교하여 하락한 경우에만 알림 전송
            if (yesterdayLowestPrice != null && todayLowestPrice != null &&
                todayLowestPrice < yesterdayLowestPrice) {

                // 상품 정보 조회
                List<Price> prices = priceRepository.findAllByProductShop_Product_ProductId(productId);
                if (!prices.isEmpty()) {
                    Price firstPrice = prices.get(0);
                    String productName = firstPrice.getProductShop().getProduct().getProductName();

                    // 최저가를 가진 상점 찾기
                    Price lowestPriceEntry = prices.stream()
                        .min((p1, p2) -> Integer.compare(
                            p1.getPrice() + p1.getDeliveryFee(),
                            p2.getPrice() + p2.getDeliveryFee()
                        ))
                        .orElse(firstPrice);

                    String shopName = lowestPriceEntry.getProductShop().getShop().getShopName();

                    PriceChangeRequest request = new PriceChangeRequest(
                            productId,
                            productName,
                            yesterdayLowestPrice,
                            todayLowestPrice,
                            shopName);

                    String url = gatewayUrl + "/notification/api/notifications/price-change";
                    restTemplate.postForObject(url, request, String.class);

                    log.info("✅ 가격 하락 알림 전송 성공 - productId: {}, 상품명: {}, {}원 → {}원 ({})",
                            productId, productName, yesterdayLowestPrice, todayLowestPrice, shopName);
                }
            } else {
                log.debug("가격 하락 없음 - productId: {}, 알림 미전송", productId);
            }
        } catch (Exception e) {
            log.error("가격 알림 체크 실패 - productId: {}, 에러: {}", productId, e.getMessage(), e);
        }
    }
}
