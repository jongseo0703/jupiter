package com.example.productservice.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.List;

/**
 * 크롤링 서비스에서 받는 벌크 상품 생성용 DTO
 */
@Data
public class BulkProductDTO {
    @JsonProperty("product_name")
    private String productName;

    private String brand;

    @JsonProperty("image_url")
    private String url; // 이미지 URL

    private String category; // 상위 카테고리 (주종)

    @JsonProperty("product_kind")
    private String productKind; // 하위 카테고리 (주류 종류)

    @JsonProperty("content")
    private String description;

    @JsonProperty("alcohol")
    private double alcoholPercentage;

    private int volume;

    @JsonProperty("detail_link")
    private String detailLink; // 상세 페이지 링크

    private List<BulkPriceDTO> prices;

    @JsonProperty("review_list")
    private List<BulkReviewDTO> reviews;
}
