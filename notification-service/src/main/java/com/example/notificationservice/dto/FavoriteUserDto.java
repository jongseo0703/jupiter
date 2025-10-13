package com.example.notificationservice.dto;

public record FavoriteUserDto(
    Long userId,
    String phone,
    Boolean priceAlert
) {}
