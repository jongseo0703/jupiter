package com.example.productservice.service;

import com.example.productservice.domain.Product;
import com.example.productservice.domain.SubCategory;
import com.example.productservice.domain.TopCategory;
import com.example.productservice.dto.*;
import com.example.productservice.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
@RequiredArgsConstructor
public class ProductService {
    public final ProductRepository productRepository;
    private final SubCategoryRepository subCategoryRepository;
    private final TopCategoryRepository topCategoryRepository;
    private final PriceRepository priceRepository;
    private final ReviewRepository reviewRepository;

    /**
     * 메인 페이지의 상품 6개 정보 조회 메서드
     * @return 상품정보 (productId, productName, url, description, subName, avgRating, price, shopName)
     */
    public  List<Map<String, Object>> mainPageProducts(){
        List<Map<String, Object>> result = new ArrayList<>();
        //대표 상품 아이디 목록
        List<Integer> productIdList = productRepository.findTopAvailableProductIdsByRating();

        //해당 상품들의 아이디로 상품 정보 조회(대표 가격 3개까지)
        for(Integer productId : productIdList){
            //리뷰별점 평균
            double avgRatings = reviewRepository.findAvgRatingByProductId(productId);
            List<PriceDto> shopDtoList = new ArrayList<>();

            //상품정보 리스트(가격은 낮은 순 3개까지)
            List<Object[]> productList = productRepository.findProductWithPricesByProductId(productId);
            if(!productList.isEmpty()){
                ProductDto productDto = getProductDto(productList,shopDtoList);
                Map<String, Object> productWithRating = new HashMap<>();
                productWithRating.put("product", productDto);
                productWithRating.put("avgRating", avgRatings);
                result.add(productWithRating);

            }
        }
        return result;
    }

    /**
     * 전체 상품목록을 반환하는 서비스
     * @return 전체 상품 목록
     */
    public  List<Map<String, Object>> getProductList(){
        List<Map<String, Object>> result = new ArrayList<>();
        //상품 아이디 목록
        List<Integer> productIdList = productRepository.findAvailableProductIdsByProductId();

        //해당 상품들의 아이디로 상품 정보 조회(대표 가격 3개까지)
        for(Integer productId : productIdList){
            //리뷰별점 평균
            Double avgRatingResult = reviewRepository.findAvgRatingByProductId(productId);
            //없으면 0.0으로 처리
            double avgRatings = avgRatingResult != null ? avgRatingResult : 0.0;

            List<PriceDto> shopDtoList = new ArrayList<>();

            //상품정보 리스트(가격은 낮은 순 3개까지)
            List<Object[]> productList = productRepository.findProductWithPricesByProductId(productId);
            if(!productList.isEmpty()){
                ProductDto productDto = getProductDto(productList,shopDtoList);
                Map<String, Object> productWithRating = new HashMap<>();
                productWithRating.put("product", productDto);
                productWithRating.put("avgRating", avgRatings);
                result.add(productWithRating);

            }
        }
        return result;
    }

    /**
     * 상품 정보목록를 ProductDto에 파싱하는 메서드<br>
     * 상품 아이디, 상품명, 도수, 이미지 URL, 상품설명, 하위 카테고리명, 상점명, 가격
     * @param productList 상품 정보목록
     * @param shopDtoList 상점 정보 목록
     * @return productDTO
     */
    public ProductDto getProductDto(List<Object[]> productList,List<PriceDto> shopDtoList){
        ProductDto productDto = new ProductDto();
        //상품의 기본 정보 추출
        Object[] item = productList.get(0);
        // 상품 아이디
        productDto.setProductId((Integer) item[0]);
        // 상품명
        productDto.setProductName((String) item[1]);
        // 도수
        productDto.setAlcoholPercentage((Double) item[7]);
        //용량
        productDto.setVolume((Integer) item[8]);
        // 상품 이미지 URL
        String url = (String) item[2];
        productDto.setUrl(url);
        // 상품 설명
        productDto.setDescription((String) item[3]);

        //하위 카테고리명
        SubCategoryDto subCategoryDto = new SubCategoryDto();
        String subName = (String) item[4];
        subCategoryDto.setSubName(subName);

        //상위 카테고리명
        TopCategoryDto topCategoryDto = new TopCategoryDto();
        String topName = topCategoryRepository.findByTopCategoryTopcategoryName(subName);
        topCategoryDto.setTopName(topName);
        subCategoryDto.setTopCategoryDto(topCategoryDto);

        productDto.setSubCategoryDto(subCategoryDto);

        // 각 상점 별 가격 목록
        for (Object[] shop : productList) {
            ShopDto shopDto = new ShopDto();
            // 상점명 설정
            shopDto.setShopName((String) shop[6]);

            // 가격 설정
            PriceDto priceDto = new PriceDto();
            priceDto.setPrice((Integer) shop[5]);

            // priceDto에 파싱
            priceDto.setShopDto(shopDto);
            //상점목록에 추가
            shopDtoList.add(priceDto);
        }
        productDto.setPriceDtoList(shopDtoList);
        return productDto;
    }

    /**
     * 특정 상품의 모든 정보 조회 메서드
     * @param productId 상품 아이디
     * @return 상품 정보
     */
    public ProductDto isProduct(int productId){
        // 아이디로 상품 조회
        Product product = productRepository.findById(productId).orElse(null);
        if(product != null){
            ProductDto productDto = new ProductDto();
            //상품 아이디
            productDto.setProductId(productId);
            //상품명
            productDto.setProductName(product.getProductName());
            //브랜드
            productDto.setBrand(product.getBrand());
            //용량
            productDto.setVolume(product.getVolume());
            //상품 도수
            productDto.setAlcoholPercentage(product.getAlcoholPercentage());
            //상품 설명
            productDto.setDescription(product.getDescription());
            //상품 이미지
            String url = product.getUrl();
            productDto.setUrl(url);

            //카테고리
            SubCategory subCategory = subCategoryRepository.findById(product.getSubCategory().getSubcategoryId()).orElse(null);
            if(subCategory != null){
                SubCategoryDto subCategoryDto = new SubCategoryDto();
                subCategoryDto.setSubName(subCategory.getSubName());
                subCategoryDto.setSubCategoryId(subCategory.getSubcategoryId());
                TopCategory topCategory = topCategoryRepository.findById(subCategory.getTopCategory().getTopcategoryId()).orElse(null);
                if (topCategory != null){
                    TopCategoryDto topCategoryDto = new TopCategoryDto();
                    topCategoryDto.setTopCategoryId(topCategory.getTopcategoryId());
                    topCategoryDto.setTopName(topCategory.getTopName());
                    subCategoryDto.setTopCategoryDto(topCategoryDto);
                }
                productDto.setSubCategoryDto(subCategoryDto);
            }

            List<Object[]>priceList = priceRepository.findByProductId(productId);
            List<PriceDto>priceDtoList = new ArrayList<>();
            for(Object[] price : priceList){
                PriceDto priceDto = new PriceDto();
                //가격 아이디
                priceDto.setPriceId((Integer) price[0]);
                //가격
                priceDto.setPrice((Integer) price[1]);
                //배송비
                priceDto.setDeliveryFee((Integer) price[2]);
                //구매링크
                priceDto.setLink(price[3].toString());

                //상점
                ShopDto shopDto = new ShopDto();
                shopDto.setShopName((String) price[4]);
                shopDto.setLogoIcon((String) price[5]);
                priceDto.setShopDto(shopDto);

                priceDtoList.add(priceDto);
            }
            //가격 정보 목록
            productDto.setPriceDtoList(priceDtoList);

            List<Object[]>reviewList = reviewRepository.findReviewByProductId(productId);
            List<ReviewDto>reviewDtoList = new ArrayList<>();
            for(Object[] review : reviewList){
                ReviewDto reviewDto = new ReviewDto();
                //리뷰아이디
                reviewDto.setReviewId((Integer) review[0]);
                //작성자
                if(review[1] != null){
                    reviewDto.setWriter(review[1].toString());
                }
                //별점
                reviewDto.setRating((Integer) review[2]);
                //작성일
                if(review[3] != null){
                    reviewDto.setReviewDate(review[3].toString());
                }

                //리뷰 제목 내용
                String comment = review[5].toString();
                reviewDto.setContent(comment);

                //상점
                ShopDto shopDto = new ShopDto();
                shopDto.setShopName((String) review[6]);
                shopDto.setLogoIcon((String) review[7]);
                reviewDto.setShopDto(shopDto);

                reviewDtoList.add(reviewDto);
            }
            //특정 상품의 라뷰목록
            productDto.setReviewDtoList(reviewDtoList);

            return productDto;

        }
        return null;
    }
}
