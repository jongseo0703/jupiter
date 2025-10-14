package com.example.productservice.service;

import com.example.productservice.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

/**
 * 리뷰 분석 서비스
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ReviewAnalyzeSerivce {
    private final ReviewRepository reviewRepository;

    /**
     * 특정 상품의 리뷰 내용을 분석하여 점수를 부여하는 메서드
     * @param productId 상품 아이디
     * @return 맛,바디감,가성비,만족도 그래프의 점수 반환
     */
    public Map<String,Map<String,Integer>> reviewScore(int productId){
        //특정 상품의 리뷰 내용 목록
        List<String>commentList= reviewRepository.findCommentsByProductId(productId);
        return  null;
    }
}
