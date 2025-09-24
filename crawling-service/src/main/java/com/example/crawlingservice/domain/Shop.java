package com.example.crawlingservice.domain;

import lombok.Data;

@Data
public class Shop {
    //구매 상점의 고유 키값
    private int shopId;
    //구매 상점명
    private String shopName;
    //구매 상점 로고
    private String logoIcon;
}
