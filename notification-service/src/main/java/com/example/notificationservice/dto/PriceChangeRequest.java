package com.example.notificationservice.dto;

public record PriceChangeRequest(
    Integer productId,
    String productName,
    Integer oldPrice,
    Integer newPrice,
    String shopName
) {}
