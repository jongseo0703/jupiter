package com.example.crawlingservice.service;

import com.example.crawlingservice.db.ProductShopMapper;
import com.example.crawlingservice.domain.Product;
import com.example.crawlingservice.domain.ProductShop;
import com.example.crawlingservice.domain.Shop;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 상품_상점 정보 저장하는 클래스
 */
@Service
@Slf4j
@RequiredArgsConstructor
@Transactional
public class ProductShopService {
    private final ProductShopMapper productShopMapper;

    /**
     * 상품_상점 정보를 저장하는 메서드<br>
     * 이미 존재할 데이터일 경우 구매 링크만 업데이트
     * @param product 상품정보
     * @param shop 상점 정보
     * @param link 구매 링크
     * @return 상품_상점 정보
     */
    public ProductShop saveProductShop(Product product, Shop shop,String link){
        //상품 아이디
        int productId = product.getProductId();
        //상점 아아디
        int shopId = shop.getShopId();

        // 기존 연결 조회
        ProductShop existing = productShopMapper.selectByProductId(productId, shopId);

        if (existing != null) {
            // 기존 연결이 있으면 link만 업데이트
            if (!link.equals(existing.getLink())) { // link가 다를 때만 업데이트
                productShopMapper.updateLink(link,productId,shopId);
                // 객체도 업데이트
                existing.setLink(link);
            } else {
                log.debug("상품-상점 연결 기존 사용");
            }
            return existing;
        }

        // 새 연결 생성
        ProductShop newProductShop = new ProductShop();
        newProductShop.setProduct(product);
        newProductShop.setShop(shop);
        newProductShop.setLink(link);

        //DB 저장
        productShopMapper.insert(newProductShop);
        //새 상품_상점 반환
        return newProductShop;
    }
}
