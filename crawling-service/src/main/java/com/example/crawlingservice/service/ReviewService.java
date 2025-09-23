package com.example.crawlingservice.service;

import com.example.crawlingservice.db.ProductShopMapper;
import com.example.crawlingservice.db.ReviewMapper;
import com.example.crawlingservice.domain.ProductShop;
import com.example.crawlingservice.domain.Review;
import com.example.crawlingservice.dto.ReviewDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * 리뷰 정보 저장 클래스
 */
@Service
@Transactional
@Slf4j
@RequiredArgsConstructor
public class ReviewService {
    private final ReviewMapper reviewMapper;
    private final ProductShopMapper productShopMapper;

    /**
     * 리뷰 정보 저장하는 메서드<br>
     * 같은 작성자 및 상품 리뷰을 경우 반환
     * @param reviewDTOList 리뷰 정보 목록
     */
    public void saveReview(List<ReviewDTO> reviewDTOList) {
        for (ReviewDTO reviewDTO : reviewDTOList) {
            try {
                // 1. 리뷰에서 언급된 상점 찾기
                ProductShop productShop = productShopMapper.selectByShopName(reviewDTO.getShopName());

                if (productShop == null) {
                    log.warn("🔗 상품-상점 연결을 찾을 수 없음");
                    continue; // 연결이 없으면 리뷰 저장 스킵
                }

                // 3. 중복 리뷰 체크 (같은 작성자가 같은 상품-상점에 리뷰 작성)
                Review existingReview = reviewMapper.selectByProductShopId(
                        productShop.getProductShopId(),reviewDTO.getReviewer());

                if (existingReview != null) {
                    log.debug("📝 기존 리뷰 발견, 저장 스킵: {} - {}",
                            reviewDTO.getReviewer(), reviewDTO.getTitle());
                    continue; // 중복 리뷰는 저장하지 않음
                }

                // 4. 새 리뷰 저장
                Review newReview = new Review();
                newReview.setWriter(reviewDTO.getReviewer());
                newReview.setRating(reviewDTO.getStar());
                newReview.setTitle(reviewDTO.getTitle());
                newReview.setComment(reviewDTO.getContent());
                newReview.setReviewDate(reviewDTO.getReviewDate());
                newReview.setProductShop(productShop);

                reviewMapper.insert(newReview);
                log.debug("🆕 새 리뷰 저장: {} - {} (평점: {}점)",
                        reviewDTO.getReviewer(), reviewDTO.getTitle(), reviewDTO.getStar());

            } catch (Exception e) {
                log.error("📝 리뷰 저장 실패: {} - {}", reviewDTO.getReviewer(), e.getMessage());
            }
        }
    }

}
