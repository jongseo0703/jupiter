package com.example.productservice.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

/**
 * 벌크 생성용 리뷰 DTO
 */
@Data
public class BulkReviewDTO {
    @JsonProperty("user_name")
    private String writer;

    @JsonProperty("star")
    private int rating;

    @JsonProperty("review_date")
    private String reviewDate;

    private String title;

    private String content;

    @JsonProperty("shop_name")
    private String shopName;
}