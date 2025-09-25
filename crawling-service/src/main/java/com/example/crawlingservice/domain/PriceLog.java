package com.example.crawlingservice.domain;

import lombok.Data;

import java.sql.Timestamp;

@Data
public class PriceLog {
    //가격 로그 고유 아이디
    private int priceLogId;
    //변경 가격
    private int newPrice;
    //생성날짜
    private Timestamp createdAt;
    //가격 정보
    private Price price;
}
