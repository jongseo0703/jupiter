package com.example.productservice.controller;

import com.example.productservice.service.ReviewAnalyzeSerivce;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.Objects;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ReviewController {
    private final ReviewAnalyzeSerivce reviewAnalyzeSerivce;

    /**
     * 특정 상품의 리뷰 내용을 분석 요청
     * @param productId 상품 아이디
     * @return 분석표
     */
    @GetMapping("/review/{productId}")
    public ResponseEntity<?> getReview(@PathVariable("productId") int productId){
        Map<String, Map<String, Integer>> result = reviewAnalyzeSerivce.reviewScore(productId);
        // 리뷰가 없거나 null인 경우에도 빈 결과를 반환
        return ResponseEntity.ok(Objects.requireNonNullElseGet(result, Map::of));
    }
}
