package com.example.crawlingservice.domain;

import lombok.Data;

@Data
public class Price {
    //가격의 고유 키값
    private int priceId;
    //가격
    private int price;
    //배송비
    private int deliveryFee;
    //상점
    private ProductShop productShop;
}
