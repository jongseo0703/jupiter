package com.example.productservice.service;

import com.example.productservice.repository.ReviewRepository;
import com.example.productservice.util.LoadKeywordAnalyzer;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

/**
 * 리뷰 분석 서비스
 */
@Service
@RequiredArgsConstructor
public class ReviewAnalyzeSerivce {
    private final ReviewRepository reviewRepository;
    private final LoadKeywordAnalyzer loadKeywordAnalyzer;

    /**
     * 특정 상품의 리뷰 내용을 분석하여 점수를 부여하는 메서드
     * @param productId 상품 아이디
     * @return 맛,바디감,가성비,만족도 점수표
     */
    public Map<String, Map<String, Integer>> reviewScore(int productId){
        //특정 상품의 리뷰 내용 목록
        List<String>commentList= reviewRepository.findCommentsByProductId(productId);

        //리뷰의 존재 확인
        if(commentList.isEmpty()){
            return null;
        }

        //리뷰내용 분석하여 점수화 하는 클래스 초기화
        return loadKeywordAnalyzer.analyzeReview(commentList);
    }
}
