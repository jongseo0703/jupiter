package com.example.crawlingservice.service;

import com.example.crawlingservice.domain.Product;
import com.example.crawlingservice.domain.ProductShop;
import com.example.crawlingservice.domain.Shop;
import com.example.crawlingservice.domain.SubCategory;
import com.example.crawlingservice.dto.PriceDTO;
import com.example.crawlingservice.dto.ProductDTO;
import com.example.crawlingservice.dto.ReviewDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    /**
     * 상품 정보들의 목록을 받아 데이터베이스에 저자하는 메서드
     * @param productDTOList 상품들의 목록
     */
    public void saveProducts(List<ProductDTO> productDTOList) {
        //저장한 상품 수 초기화
        int count = 0;
        //상품들의 목록 크기만큼 반복
        for (ProductDTO productDTO : productDTOList) {
            //가격목록
            List<PriceDTO>priceDTOList = productDTO.getPrices();
            //리뷰 목록
            List<ReviewDTO>reviewDTOList = productDTO.getReviews();
            //카테고리들 저장
            SubCategory subCategory =categoryService.saveCategory(productDTO.getCategory(),productDTO.getProductKind());
            //상품 저장
            Product product =productService.saveProduct(productDTO,subCategory);
            for(PriceDTO priceDTO : priceDTOList) {
                //상점 저장
                Shop shop=shopService.saveShop(priceDTO);
                //상품_상점 정보 저장
                ProductShop productShop=productShopService.saveProductShop(product,shop,priceDTO.getShopLink());
                //가격 저장
                priceService.savePrice(priceDTO,productShop);
            }
            //리뷰 저장
            reviewService.saveReview(reviewDTOList);
            count++;
        }
        log.debug("데이터베이스에 저장한 상품 수 {}",count);
    }
}
