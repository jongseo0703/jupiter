package com.example.crawlingservice.domain;

import lombok.Data;

@Data
public class Stock {
    //재고 고유 아이디
    private int stockId;
    //존재 여부
    private boolean isAvailable;
    //상품 정보
    private Product product;
}
