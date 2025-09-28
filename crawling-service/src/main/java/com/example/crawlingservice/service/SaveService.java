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
import java.util.List;

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
            //이미지 URL 검사 및 업데이트
            updateImage(productDTO.getImageUrl(), productDTO.getProductName());
            for(PriceDTO priceDTO : priceDTOList) {
                //상점 저장
                Shop shop=shopService.saveShop(priceDTO);
                //상품_상점 정보 저장
                ProductShop productShop=productShopService.saveProductShop(product,shop,priceDTO.getShopLink());
                //가격 저장
                priceService.savePrice(priceDTO,productShop);
            }
            //리뷰 저장
            reviewService.saveReview(reviewDTOList,product);
            count++;

        }
        log.debug("데이터베이스에 저장한 상품 수 {}",count);

        //DB와 상품명 비교
        updateStockStatus(productNames);

    }

    /**
     * 데이터베이스의 상품명과 ProductDTO의 상품명과 비교<br>
     * 상품명이 DB에만 있을 경우 : isAvailable = false<br>
     * 상품명이 productDTO와 DB 둘다 존재할 경우 isAvailable = true
     * @param productNames 상품명
     */
    public void updateStockStatus(List<String>productNames){
        //DB의 모든 상품 정보
        List<Product> dbProducts = productMapper.selectAll();

        for (Product dbProduct : dbProducts) {
            //DB에 존재하는 상품명
            String productName = dbProduct.getProductName();
            //productDTO의 상품명들과 비교
            boolean isAvailable = productNames.contains(productName);

            if(isAvailable){
                Stock stock = stockMapper.selectByProductName(productName);
                //상품명이 존재하고 DB의 is_available = false 일 때 ture로 변경
                if(!stock.isAvailable()){
                    stockMapper.updateProduct(true,productName);
                }
            }else {
                //DB에만 상품명이 존재 할 경우 is_available = false로 변경
                stockMapper.updateProduct(false,productName);
            }
        }
    }

    /**
     * DB 상품 이미지 유효 검사 및 수정을 위한 메서드
     * @param productDtoUrl 새 이미지 URL
     * @param productName 상품명
     */
    public void updateImage(String productDtoUrl, String productName) {
        // DB 상품 조회
        Product product = productMapper.selectByProduct(productName);

        if (product != null) {
            // 현재 DB에 저장된 이미지 URL
            String dbImageUrl = product.getUrl();

            // 기본 "이미지 없음" URL 상수
            final String NO_IMAGE_URL = "https://img.danawa.com/new/noData/img/noImg_160.gif";

            // 새 이미지 유효 검사
            boolean isDbUrlValid = !NO_IMAGE_URL.equals(dbImageUrl);
            //기존 이미지 유효 검사
            boolean isNewUrlValid = !NO_IMAGE_URL.equals(productDtoUrl);

            // 올바른 업데이트 로직
            if (isNewUrlValid && !productDtoUrl.equals(dbImageUrl)) {
                // 새 URL이 유효하고 기존 URL과 다르면 업데이트
                productMapper.updateUrl(product.getProductId(), productDtoUrl);
                log.debug("{} 상품 이미지 업데이트",product.getProductName());

            } else if (!isNewUrlValid && isDbUrlValid) {
                // 새 URL이 유효하지 않지만 기존 URL이 유효하면 유지
                log.debug("기존 이미지 유지");
            } else {
                // 둘 다 유효하지 않거나 기타 경우
                log.debug("유효한 이미지 URL 없음");
            }
        } else {
            log.debug("상품을 찾을 수 없습니다: {}", productName);
        }
    }
}
