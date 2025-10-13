package com.example.authservice.favorite.dto;

import com.example.authservice.favorite.entity.Favorite;

public record FavoriteUserResponse(Long userId, String phone, Boolean priceAlert) {
  public static FavoriteUserResponse from(Favorite favorite) {
    return new FavoriteUserResponse(
        favorite.getUser().getId(), favorite.getUser().getPhone(), favorite.getPriceAlert());
  }
}
