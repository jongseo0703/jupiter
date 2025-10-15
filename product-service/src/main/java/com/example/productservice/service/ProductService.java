package com.example.productservice.service;

import com.example.productservice.domain.*;
import com.example.productservice.dto.*;
import com.example.productservice.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
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
    private final PriceLogRepository priceLogRepository;
    private final StockRepository stockRepository;

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
     * @param includeInactive 비활성 상품 포함 여부 (관리자용)
     * @return 전체 상품 목록
     */
    public  List<Map<String, Object>> getProductList(Boolean includeInactive){
        List<Map<String, Object>> result = new ArrayList<>();
        //상품 아이디 목록
        List<Integer> productIdList;
        if (includeInactive != null && includeInactive) {
            // 관리자용: 모든 상품 조회 (비활성 포함)
            productIdList = productRepository.findAllProductIds();
        } else {
            // 일반 사용자용: 활성 상품만 조회
            productIdList = productRepository.findAvailableProductIdsByProductId();
        }

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
     * 페이징된 상품목록을 반환하는 서비스
     * @param includeInactive 비활성 상품 포함 여부 (관리자용)
     * @param page 페이지 번호 (0부터 시작)
     * @param size 페이지 크기
     * @param category 카테고리 필터 (선택사항, null이면 전체)
     * @return 페이징된 상품 목록 및 메타데이터
     */
    public Map<String, Object> getProductListPaged(Boolean includeInactive, Integer page, Integer size, String category) {
        List<Map<String, Object>> result = new ArrayList<>();

        try {
            // 상품 아이디 목록
            List<Integer> allProductIdList;

            // category가 "all"이거나 null/빈문자열이면 전체 조회
            boolean filterByCategory = category != null && !category.isEmpty() && !"all".equalsIgnoreCase(category);

            if (filterByCategory) {
                // 카테고리별 조회
                if (includeInactive != null && includeInactive) {
                    allProductIdList = productRepository.findAllProductIdsByCategory(category);
                } else {
                    allProductIdList = productRepository.findAvailableProductIdsByCategory(category);
                }
            } else {
                // 전체 조회
                if (includeInactive != null && includeInactive) {
                    allProductIdList = productRepository.findAllProductIds();
                } else {
                    allProductIdList = productRepository.findAvailableProductIdsByProductId();
                }
            }

            // 전체 상품 수
            int totalElements = allProductIdList.size();
            int totalPages = totalElements == 0 ? 1 : (int) Math.ceil((double) totalElements / size);

            // 페이지 범위 검증
            if (page < 0) {
                page = 0;
            }
            if (page >= totalPages && totalElements > 0) {
                page = totalPages - 1;
            }

            // 페이징 처리
            int startIndex = page * size;
            int endIndex = Math.min(startIndex + size, totalElements);

            // 현재 페이지에 해당하는 상품 ID만 추출
            List<Integer> pagedProductIdList = new ArrayList<>();
            if (startIndex < totalElements) {
                pagedProductIdList = allProductIdList.subList(startIndex, endIndex);
            }

            // 해당 상품들의 아이디로 상품 정보 조회
            for (Integer productId : pagedProductIdList) {
                try {
                    // 리뷰별점 평균
                    Double avgRatingResult = reviewRepository.findAvgRatingByProductId(productId);
                    double avgRatings = avgRatingResult != null ? avgRatingResult : 0.0;

                    List<PriceDto> shopDtoList = new ArrayList<>();

                    // 상품정보 리스트(가격은 낮은 순 3개까지)
                    List<Object[]> productList = productRepository.findProductWithPricesByProductId(productId);
                    if (!productList.isEmpty()) {
                        ProductDto productDto = getProductDto(productList, shopDtoList);

                        // 상품 활성화 여부 추가
                        Stock stock = stockRepository.findByProduct_ProductId(productId).orElse(null);
                        if (stock != null) {
                            productDto.setIsAvailable(stock.isAvailable());
                        } else {
                            productDto.setIsAvailable(true); // 기본값: 활성
                        }

                        // 어제 최저가 계산
                        Integer yesterdayLowestPrice = calculateYesterdayLowestPrice(productId);
                        productDto.setYesterdayLowestPrice(yesterdayLowestPrice);

                        Map<String, Object> productWithRating = new HashMap<>();
                        productWithRating.put("product", productDto);
                        productWithRating.put("avgRating", avgRatings);
                        result.add(productWithRating);
                    }
                } catch (Exception e) {
                    log.error("상품 ID {}의 정보를 조회하는 중 오류 발생: {}", productId, e.getMessage(), e);
                    // 에러가 발생한 상품은 건너뛰고 계속 진행
                }
            }

            // 페이징 메타데이터 포함
            Map<String, Object> response = new HashMap<>();
            response.put("content", result);
            response.put("currentPage", page);
            response.put("pageSize", size);
            response.put("totalElements", totalElements);
            response.put("totalPages", totalPages);
            response.put("isFirst", page == 0);
            response.put("isLast", page >= totalPages - 1);

            log.debug("페이징 처리 완료 - 페이지: {}/{}, 조회된 상품 수: {}", page + 1, totalPages, result.size());

            return response;
        } catch (Exception e) {
            log.error("페이징 처리 중 오류 발생: {}", e.getMessage(), e);

            // 에러 발생 시 빈 결과 반환
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("content", result);
            errorResponse.put("currentPage", 0);
            errorResponse.put("pageSize", size);
            errorResponse.put("totalElements", 0);
            errorResponse.put("totalPages", 1);
            errorResponse.put("isFirst", true);
            errorResponse.put("isLast", true);
            errorResponse.put("error", e.getMessage());

            return errorResponse;
        }
    }

    /**
     * 상품 정보목록를 ProductDto에 파싱하는 메서드<br>
     * 상품 아이디, 상품명, 도수, 이미지 URL, 상품설명, 하위 카테고리명, 상점명, 가격, 배송비
     * @param productList 상품 정보목록 (productId, productName, url, description, subName, price, shopName, alcoholPercentage, volume, deliveryFee)
     * @param shopDtoList 상점 정보 목록
     * @return productDTO
     */
    public ProductDto getProductDto(List<Object[]> productList,List<PriceDto> shopDtoList){
        ProductDto productDto = new ProductDto();
        //상품의 기본 정보 추출
        Object[] item = productList.getFirst();
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
        if (subName != null) {
            try {
                TopCategoryDto topCategoryDto = new TopCategoryDto();
                String topName = topCategoryRepository.findByTopCategoryTopcategoryName(subName);
                if (topName != null) {
                    topCategoryDto.setTopName(topName);
                    subCategoryDto.setTopCategoryDto(topCategoryDto);
                }
            } catch (Exception e) {
                log.warn("상위 카테고리 조회 실패 (subName: {}): {}", subName, e.getMessage());
                // 상위 카테고리 조회 실패해도 상품은 표시
            }
        }

        productDto.setSubCategoryDto(subCategoryDto);

        // 각 상점 별 가격 목록 (배송비 포함한 총액으로 정렬됨)
        for (Object[] shop : productList) {
            ShopDto shopDto = new ShopDto();
            // 상점명 설정
            shopDto.setShopName((String) shop[6]);

            // 가격 설정
            PriceDto priceDto = new PriceDto();
            priceDto.setPrice((Integer) shop[5]);
            priceDto.setDeliveryFee((Integer) shop[9]); // 배송비 추가

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

            // 어제 최저가 계산
            Integer yesterdayLowestPrice = calculateYesterdayLowestPrice(productId);
            productDto.setYesterdayLowestPrice(yesterdayLowestPrice);

            // 상품 활성화 여부 (stock.is_available)
            Stock stock = stockRepository.findByProduct_ProductId(productId).orElse(null);
            if (stock != null) {
                productDto.setIsAvailable(stock.isAvailable());
            } else {
                productDto.setIsAvailable(true); // 기본값: 활성
            }

            return productDto;

        }
        return null;
    }

    /**
     * 어제 최저가를 계산하는 메서드
     * @param productId 상품 ID
     * @return 어제 최저가 (배송비 포함)
     */
    private Integer calculateYesterdayLowestPrice(Integer productId) {
        LocalDate yesterday = LocalDate.now().minusDays(1);
        LocalDateTime startOfYesterday = yesterday.atStartOfDay();
        LocalDateTime endOfYesterday = yesterday.atTime(LocalTime.MAX);

        List<PriceLog> yesterdayPriceLogs = priceLogRepository.findYesterdayPriceLogsByProductId(
            productId, startOfYesterday, endOfYesterday
        );

        if (yesterdayPriceLogs.isEmpty()) {
            return null;
        }

        // 어제의 각 가격에 배송비를 더해서 최저가 계산
        return yesterdayPriceLogs.stream()
            .mapToInt(priceLog -> {
                int price = priceLog.getNewPrice();
                int deliveryFee = priceLog.getPrice().getDeliveryFee();
                return price + deliveryFee;
            })
            .min()
            .orElse(0);
    }

    /**
     * 상품 활성화/비활성화 상태 변경
     * @param productId 상품 ID
     * @param isAvailable 활성화 여부
     */
    @Transactional
    public void updateProductAvailability(Integer productId, Boolean isAvailable) {
        Stock stock = stockRepository.findByProduct_ProductId(productId)
            .orElseThrow(() -> new RuntimeException("상품의 재고 정보를 찾을 수 없습니다."));

        stock.setAvailable(isAvailable);
        stockRepository.save(stock);
    }

    /**
     * 상품 정보 수정
     * @param productId 상품 ID
     * @param updateData 수정할 데이터
     */
    @Transactional
    public void updateProduct(Integer productId, Map<String, Object> updateData) {
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new RuntimeException("상품을 찾을 수 없습니다."));

        if (updateData.containsKey("productName")) {
            product.setProductName((String) updateData.get("productName"));
        }
        if (updateData.containsKey("brand")) {
            product.setBrand((String) updateData.get("brand"));
        }
        if (updateData.containsKey("description")) {
            product.setDescription((String) updateData.get("description"));
        }
        if (updateData.containsKey("alcoholPercentage")) {
            product.setAlcoholPercentage(((Number) updateData.get("alcoholPercentage")).doubleValue());
        }
        if (updateData.containsKey("volume")) {
            product.setVolume(((Number) updateData.get("volume")).intValue());
        }
        if (updateData.containsKey("url")) {
            product.setUrl((String) updateData.get("url"));
        }

        productRepository.save(product);
    }

    /**
     * 상품 삭제 (soft delete - 재고를 비활성화)
     * @param productId 상품 ID
     */
    @Transactional
    public void deleteProduct(Integer productId) {
        // 실제 삭제 대신 재고를 비활성화
        Stock stock = stockRepository.findByProduct_ProductId(productId)
            .orElseThrow(() -> new RuntimeException("상품의 재고 정보를 찾을 수 없습니다."));

        stock.setAvailable(false);
        stockRepository.save(stock);
    }
}
