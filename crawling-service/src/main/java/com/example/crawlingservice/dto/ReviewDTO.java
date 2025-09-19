package com.example.crawlingservice.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

/**
 * 크롤링한 리뷰정보들 내용<br>
 * reviewer - 작성자<br>
 * star - 별점(숫자)<br>
 * shopName - 구매처<br>
 * reviewDate - 리뷰작성일(문자)<br>
 * title - 제목<br>
 * content - 내용<br>
 */
@Data
public class ReviewDTO {
    //리뷰 작성자 아이디
    @JsonProperty("user_name")
    private String reviewer;
    //별점
    @JsonProperty("star")
    private int star;
    //쇼핑몰 이름
    @JsonProperty("shop_name")
    private String shopName;
    //작성일
    @JsonProperty("review_date")
    private String reviewDate;
    //제목
    @JsonProperty("title")
    private String title;
    //리뷰내용
    @JsonProperty("content")
    private String content;
}
