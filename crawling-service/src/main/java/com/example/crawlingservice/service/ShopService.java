package com.example.crawlingservice.service;

import com.example.crawlingservice.db.ShopMapper;
import com.example.crawlingservice.domain.Shop;
import com.example.crawlingservice.dto.PriceDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 상점 정보 저장 클래스
 */
@Service
@Slf4j
@Transactional
@RequiredArgsConstructor
public class ShopService {
    private final ShopMapper shopMapper;

    /**
     * 상점 정보 저장하는 메서드<br>
     * 이미 존재하는 상점명일 경우 무시
     * @param priceDTO 상점 정보가 있는 DTO
     * @return 상점 정보
     */
    public Shop saveShop(PriceDTO priceDTO) {
        // 상점명으로 기존 상점 조회
        Shop existing = shopMapper.selectByShopName(priceDTO.getShopName());
        if (existing != null) {
            return existing;
        }

        // 새 상점 생성
        Shop newShop = new Shop();
        newShop.setShopName(priceDTO.getShopName());
        newShop.setLogoIcon(priceDTO.getShopIcon());

        shopMapper.insert(newShop);

        return newShop;
    }
}
