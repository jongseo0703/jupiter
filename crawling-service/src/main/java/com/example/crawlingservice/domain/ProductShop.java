package com.example.crawlingservice.domain;

import lombok.Data;

@Data
public class ProductShop {
    //상품_상점의 고유 키값
    private int productShopId;
    //구매 상점 링크
    private String link;
    //상점 유효 상태
    private boolean isAvailable;
    //상품
    private Product product;
    //상점
    private Shop shop;

}
