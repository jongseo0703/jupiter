package com.example.crawlingservice.service;

import com.example.crawlingservice.db.ProductShopMapper;
import com.example.crawlingservice.domain.Product;
import com.example.crawlingservice.domain.ProductShop;
import com.example.crawlingservice.domain.Shop;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

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
        newProductShop.setAvailable(true);

        //DB 저장
        productShopMapper.insert(newProductShop);
        //새 상품_상점 반환
        return newProductShop;
    }

    /**
     * 특정 상품의 모든 상점 유효성을 크롤링 결과와 한 번에 비교하여 업데이트
     * @param productId 상품 아이디
     * @param crawledShopNames 크롤링으로 추출한 상점명 목록
     */
    public void checkShops(int productId, Set<String> crawledShopNames) {
        // DB에 저장된 해당 상품의 모든 상품_상점 정보 조회
        List<ProductShop> dbProductShops = productShopMapper.selectAllByProductId(productId);

        // 크롤링한 상점명 목록
        Set<String> crawledShopSet = new HashSet<>(crawledShopNames);

        //  데이터베이스의 각 상점을 크롤링 결과와 비교
        for (ProductShop productShop : dbProductShops) {
            String dbShopName = productShop.getShop().getShopName();
            //상점명 비교
            boolean shouldBeAvailable = crawledShopSet.contains(dbShopName);
            //상점 유효성 조회
            boolean currentStatus = productShop.isAvailable();

            // 상태가 다를 때만 업데이트
            if (currentStatus != shouldBeAvailable) {
                productShopMapper.updateIsAvailable(shouldBeAvailable, productShop.getProductShopId());
                log.debug("상점의 유효성이 변경되었습니다");
            }
        }
    }
}

