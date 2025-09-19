package com.example.crawlingservice.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

/**
 * 크롤링한 상품 정보 DTO<br>
 * productName - 상품명<br>
 * brand - 브랜드<br>
 * imageUrl - 상품이미지 URL<br>
 * category - 주종(와인, 양주 등)<br>
 * productKind - 주류 종류(레드와인, 위스키 등)<br>
 * content - 상품 정보<br>
 * alcohol - 도수(파싱한 내용이 없는 경우 0)<br>
 * volume - 용량(ml 기준으로 계산, 파싱한 내용 없을 경우 0)<br>
 * lineup - 구성<br>
 * detailLink - 다나와 상품 상세 페이지<br>
 * prices - 가격 목록<br>
 * reviews - 리뷰 목록<br>
 */
@Data
public class ProductDTO {
    //상품명
    @JsonProperty("product_name")
    private String productName;
    //브랜드
    @JsonProperty("brand")
    private String brand;
    //상품이미지
    @JsonProperty("image_url")
    private String imageUrl;
    //주종
    @JsonProperty("category")
    private String category;
    //종류
    @JsonProperty("product_kind")
    private String productKind;
    //설명
    @JsonProperty("content")
    private String content;
    //도수
    @JsonProperty("alcohol")
    private double alcohol;
    //용량
    @JsonProperty("volume")
    private int volume;
    //포장상태
    @JsonProperty("packaging")
    private String packaging;
    //구성
    @JsonProperty("lineup")
    private String lineup;
    //상세 링크
    @JsonProperty("detail_link")
    private String detailLink;
    //가격 목록
    @JsonProperty("prices")
    private List<PriceDTO> prices = new ArrayList<>();
    //상품리뷰 목록
    @JsonProperty("review_list")
    private List<ReviewDTO> reviews = new ArrayList<>();
}
