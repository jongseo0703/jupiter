package com.example.crawlingservice.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

/**
 * 주류 상품의 구매정보 DTO<br>
 * shopName - 구매처<br>
 * price - 가격<br>
 * deliveryFee - 배달비<br>
 * shopLink - 구매링크<br>
 * shopIcon - 쇼핑몰 로고 URL<br>
 */
@Data
public class PriceDTO {
    //상품구매 링크
    @JsonProperty("shop_link")
    private String shopLink;
    //구메처
    @JsonProperty("shop_name")
    private String shopName;
    //쇼핑물 아이콘
    @JsonProperty("shop_icon")
    private String shopIcon;
    //상품 가격
    @JsonProperty("price")
    private int price;
    //배송비
    @JsonProperty("delivery_fee")
    private int deliveryFee;
}
