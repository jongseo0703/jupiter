package com.example.productservice.service;

import com.example.productservice.domain.*;
import com.example.productservice.dto.*;
import com.example.productservice.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * 크롤링 데이터 벌크 저장 서비스
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class BulkProductService {
    private final ProductRepository productRepository;
    private final SubCategoryRepository subCategoryRepository;
    private final TopCategoryRepository topCategoryRepository;
    private final ShopRepository shopRepository;
    private final ProductShopRepository productShopRepository;
    private final PriceRepository priceRepository;
    private final ReviewRepository reviewRepository;
    private final StockRepository stockRepository;

    /**
     * 크롤링 서비스로부터 받은 상품 데이터를 벌크로 저장
     * @param bulkProducts 상품 목록
     * @return 저장된 상품 수
     */
    public int saveBulkProducts(List<BulkProductDTO> bulkProducts) {
        int savedCount = 0;

        for (BulkProductDTO dto : bulkProducts) {
            try {
                saveOneProduct(dto);
                savedCount++;
            } catch (Exception e) {
                log.error("상품 저장 실패: {} - {}", dto.getProductName(), e.getMessage(), e);
            }
        }

        log.info("벌크 저장 완료: {}개 상품 (전체: {}개)", savedCount, bulkProducts.size());
        return savedCount;
    }

    /**
     * 하나의 상품을 저장 (개별 트랜잭션)
     */
    @Transactional
    public void saveOneProduct(BulkProductDTO dto) {
        // 1. 카테고리 처리
        SubCategory subCategory = getOrCreateSubCategory(dto.getCategory(), dto.getProductKind());

        // 2. 상품 저장 또는 업데이트
        Product product = saveOrUpdateProduct(dto, subCategory);

        // 3. 재고 정보 저장
        saveOrUpdateStock(product);

        // 4. 가격 정보 저장
        if (dto.getPrices() != null) {
            for (BulkPriceDTO priceDto : dto.getPrices()) {
                Shop shop = getOrCreateShop(priceDto);
                ProductShop productShop = saveOrUpdateProductShop(product, shop, priceDto.getShopLink());
                saveOrUpdatePrice(productShop, priceDto);
            }
        }

        // 5. 리뷰 정보 저장
        if (dto.getReviews() != null) {
            for (BulkReviewDTO reviewDto : dto.getReviews()) {
                Shop shop = shopRepository.findByShopName(reviewDto.getShopName()).orElse(null);
                if (shop != null) {
                    productShopRepository
                            .findByProduct_ProductIdAndShop_ShopId(product.getProductId(), shop.getShopId())
                            .ifPresent(productShop -> saveReview(reviewDto, productShop));
                }
            }
        }
    }

    private SubCategory getOrCreateSubCategory(String topCategoryName, String subCategoryName) {
        // 상위 카테고리 찾기 또는 생성
        TopCategory topCategory = topCategoryRepository.findByTopName(topCategoryName)
            .orElseGet(() -> {
                TopCategory newTop = new TopCategory();
                newTop.setTopName(topCategoryName);
                return topCategoryRepository.save(newTop);
            });

        // 하위 카테고리 찾기 또는 생성
        return subCategoryRepository.findBySubNameAndTopCategory_TopcategoryId(subCategoryName, topCategory.getTopcategoryId())
            .orElseGet(() -> {
                SubCategory newSub = new SubCategory();
                newSub.setSubName(subCategoryName);
                newSub.setTopCategory(topCategory);
                return subCategoryRepository.save(newSub);
            });
    }

    private Product saveOrUpdateProduct(BulkProductDTO dto, SubCategory subCategory) {
        // 상품명으로 기존 상품 찾기
        Product product = productRepository.findByProductName(dto.getProductName())
            .orElse(new Product());

        product.setProductName(dto.getProductName());
        product.setBrand(dto.getBrand());
        product.setUrl(dto.getUrl());
        product.setDescription(dto.getDescription());
        product.setAlcoholPercentage(dto.getAlcoholPercentage());
        product.setVolume(dto.getVolume());
        product.setSubCategory(subCategory);

        return productRepository.save(product);
    }

    private void saveOrUpdateStock(Product product) {
        Stock stock = stockRepository.findByProduct_ProductId(product.getProductId())
            .orElse(new Stock());

        if (stock.getStockId() == 0) {
            stock.setProduct(product);
            stock.setAvailable(true);
            stockRepository.save(stock);
        }
    }

    private Shop getOrCreateShop(BulkPriceDTO priceDto) {
        return shopRepository.findByShopName(priceDto.getShopName())
            .orElseGet(() -> {
                Shop newShop = new Shop();
                newShop.setShopName(priceDto.getShopName());
                newShop.setLogoIcon(priceDto.getShopLogo());
                return shopRepository.save(newShop);
            });
    }

    private ProductShop saveOrUpdateProductShop(Product product, Shop shop, String link) {
        ProductShop productShop = productShopRepository
            .findByProduct_ProductIdAndShop_ShopId(product.getProductId(), shop.getShopId())
            .orElse(new ProductShop());

        productShop.setProduct(product);
        productShop.setShop(shop);
        productShop.setLink(link);
        productShop.setAvailable(true);

        return productShopRepository.save(productShop);
    }

    private void saveOrUpdatePrice(ProductShop productShop, BulkPriceDTO priceDto) {
        // 기존 가격 찾기
        Price price = priceRepository.findByProductShop_ProductShopId(productShop.getProductShopId())
            .orElse(new Price());

        price.setProductShop(productShop);
        price.setPrice(priceDto.getPrice());
        price.setDeliveryFee(priceDto.getDeliveryFee());

        priceRepository.save(price);
    }

    private void saveReview(BulkReviewDTO reviewDto, ProductShop productShop) {
        Review review = new Review();
        review.setProductShop(productShop);
        review.setWriter(reviewDto.getWriter());
        review.setRating(reviewDto.getRating());
        review.setTitle(reviewDto.getTitle());
        review.setComment(reviewDto.getContent());

        // 리뷰 날짜 파싱
        if (reviewDto.getReviewDate() != null) {
            try {
                LocalDate reviewDate = LocalDate.parse(reviewDto.getReviewDate(), DateTimeFormatter.ISO_DATE);
                review.setReviewDate(String.valueOf(reviewDate));
            } catch (Exception e) {
                review.setReviewDate(String.valueOf(LocalDate.now()));
            }
        } else {
            review.setReviewDate(String.valueOf(LocalDate.now()));
        }

        reviewRepository.save(review);
    }
}
