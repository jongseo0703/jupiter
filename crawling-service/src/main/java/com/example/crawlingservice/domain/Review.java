package com.example.crawlingservice.domain;

import lombok.Data;


@Data
public class Review {
    //리뷰의 고유 키값
    private int reviewId;
    //작성자
    private String writer;
    //별점
    private int rating;
    //제목
    private String title;
    //내용
    private String comment;
    //작성일
    private String reviewDate;
    //상품_상점
    private ProductShop productShop;
}
