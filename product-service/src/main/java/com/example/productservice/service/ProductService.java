package com.example.productservice.service;

import com.example.productservice.dto.PriceDto;
import com.example.productservice.dto.ProductDto;
import com.example.productservice.dto.ShopDto;
import com.example.productservice.dto.SubCategoryDto;
import com.example.productservice.repository.ProductRepository;
import com.example.productservice.repository.ReviewRepository;
import com.example.productservice.util.UrlShrinkRemover;
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
        //대표 상품 6개의 아이디 목록
        List<Integer> productIdList = productRepository.findTopAvailableProductIdsByRating();

        //해당 상품들의 아이디로 상품 정보 조회(대표 가격 3개까지)
        for(Integer productId : productIdList){
            //리뷰별점 평균
            double avgRatings = reviewRepository.findAvgRatingByProductId(productId);
            ProductDto productDto = new ProductDto();
            List<PriceDto> shopDtoList = new ArrayList<>();

            //상품정보 리스트(가격은 낮은 순 3개까지)
            List<Object[]> productList = productRepository.findProductWithPricesByProductId(productId);
            if(!productList.isEmpty()){
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

                Map<String, Object> productWithRating = new HashMap<>();
                productWithRating.put("product", productDto);
                productWithRating.put("avgRating", avgRatings);
                result.add(productWithRating);

            }
        }
        return result;

    }
}
