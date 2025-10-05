package com.example.crawlingservice.service;

import com.example.crawlingservice.db.ProductMapper;
import com.example.crawlingservice.db.StockMapper;
import com.example.crawlingservice.domain.*;
import com.example.crawlingservice.dto.PriceDTO;
import com.example.crawlingservice.dto.ProductDTO;
import com.example.crawlingservice.dto.ReviewDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * 모든 상품정보를 저장하는 클래스
 */
@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class SaveService {
    private final CategoryService categoryService;
    private final ShopService shopService;
    private final ProductService productService;
    private final ProductShopService productShopService;
    private final PriceService priceService;
    private final ReviewService reviewService;
    private final ProductMapper productMapper;
    private final StockMapper stockMapper;

    /**
     * 상품 정보들의 목록을 받아 데이터베이스에 저자하는 메서드
     * @param productDTOList 상품들의 목록
     */
    public void saveProducts(List<ProductDTO> productDTOList) {
        //저장한 상품 수 초기화
        int count = 0;
        //상품명만 저장한 목록
        List<String> productNames = new ArrayList<>();
        //상품들의 목록 크기만큼 반복
        for (ProductDTO productDTO : productDTOList) {
            productNames.add(productDTO.getProductName());

            //가격목록
            List<PriceDTO>priceDTOList = productDTO.getPrices();
            //리뷰 목록
            List<ReviewDTO>reviewDTOList = productDTO.getReviews();
            //카테고리들 저장
            SubCategory subCategory =categoryService.saveCategory(productDTO.getCategory(),productDTO.getProductKind());
            //상품 저장
            Product product =productService.saveProduct(productDTO,subCategory);

            //크롤링한 상점명 수집
            Set<String> crawledShopNames = new HashSet<>();
            for(PriceDTO priceDTO : priceDTOList) {
                //상점 저장
                Shop shop=shopService.saveShop(priceDTO);
                //상품_상점 정보 저장
                ProductShop productShop=productShopService.saveProductShop(product,shop,priceDTO.getShopLink());
                //가격 저장
                priceService.savePrice(priceDTO,productShop);
                //상점명 수집
                crawledShopNames.add(priceDTO.getShopName());
            }

            //상점 유효성 검사 (크롤링한 상점이 있는 경우만)
            if (!crawledShopNames.isEmpty()) {
                productShopService.checkShops(product.getProductId(), crawledShopNames);
            }

            //리뷰 저장
            reviewService.saveReview(reviewDTOList,product);
            count++;
        }

        //DB와 상품명 비교
        updateStockStatus(productNames);

    }

    /**
     * 데이터베이스의 상품명과 ProductDTO의 상품명과 비교<br>
     * 상품명이 데이터베이스에만 있을 경우 : isAvailable = false<br>
     * 상품명이 productDTO와 데이터베이스 둘다 존재할 경우 isAvailable = true
     * @param productNames 상품명
     */
    public void updateStockStatus(List<String>productNames){
        //추출한 상품명 목록
        Set<String> crawledProductNames = new HashSet<>(productNames);

        //데이터베이스의 모든 상품 정보
        List<Product> dbProducts = productMapper.selectAll();

        for (Product dbProduct : dbProducts) {
            //데이터베이스에 존재하는 상품명
            String productName = dbProduct.getProductName();
            //크롤링된 상품명과 비교
            boolean shouldBeAvailable = crawledProductNames.contains(productName);

            //재고 정보 조회
            Stock stock = stockMapper.selectByProductName(productName);
            boolean currentStatus = stock.isAvailable();

            //상태가 다를 때만 업데이트
            if(currentStatus != shouldBeAvailable){
                stockMapper.updateProduct(shouldBeAvailable, productName);
            }
        }
    }

}
