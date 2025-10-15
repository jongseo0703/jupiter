package com.example.productservice.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

/**
 * 벌크 생성용 가격 DTO
 */
@Data
public class BulkPriceDTO {
    @JsonProperty("shop_name")
    private String shopName;

    @JsonProperty("shop_link")
    private String shopLink;

    @JsonProperty("shop_icon")
    private String shopLogo;

    private int price;

    @JsonProperty("delivery_fee")
    private int deliveryFee;
}
