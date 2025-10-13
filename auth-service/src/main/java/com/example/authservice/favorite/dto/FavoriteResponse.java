package com.example.authservice.favorite.dto;

import java.time.LocalDateTime;

import com.example.authservice.favorite.entity.Favorite;

public record FavoriteResponse(
    Long id, Long userId, Integer productId, Boolean priceAlert, LocalDateTime createdAt) {
  public static FavoriteResponse from(Favorite favorite) {
    return new FavoriteResponse(
        favorite.getId(),
        favorite.getUser().getId(),
        favorite.getProductId(),
        favorite.getPriceAlert(),
        favorite.getCreatedAt());
  }
}
