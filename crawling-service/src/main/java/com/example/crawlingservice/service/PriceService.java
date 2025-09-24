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

    /**
     * 가격정보 저장하는 메서드<br>
     * 이미 존재하는 상품 가격일 경우 가격과 배송비만 업데이트
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
                    log.debug("변경 가격 로그 저장");
                }
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
                log.debug("가격을 로그에 저장");
            }
        }
    }
}
