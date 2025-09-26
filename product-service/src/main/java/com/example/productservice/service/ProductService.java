package com.example.productservice.service;

import com.example.productservice.dto.PriceDto;
import com.example.productservice.dto.ProductDto;
import com.example.productservice.dto.ShopDto;
import com.example.productservice.dto.SubCategoryDto;
import com.example.productservice.repository.ProductRepository;
import com.example.productservice.repository.ReviewRepository;
import com.example.productservice.util.UrlShrinkRemover;
import jakarta.persistence.criteria.CriteriaBuilder;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class ProductService {
    public final ProductRepository productRepository;
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
     * 상품 아이디, 상품명, 이미지 URL, 상품설명, 하위 카테고리명, 상점명, 가격
     * @param productList 상품 정보목록
     * @param shopDtoList 상점 종보 목록
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
        // 상품 이미지 URL
        String url = (String) item[2];
        productDto.setUrl(UrlShrinkRemover.removeShrinkFromUrl(url));
        // 상품 설명
        productDto.setDescription((String) item[3]);

        //하위 카테고리명 파싱
        SubCategoryDto subCategoryDto = new SubCategoryDto();
        subCategoryDto.setSubName((String) item[4]);
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
}
