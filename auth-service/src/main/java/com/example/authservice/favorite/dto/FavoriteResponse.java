package com.example.authservice.favorite.dto;

import com.example.authservice.favorite.entity.Favorite;

import java.time.LocalDateTime;

public record FavoriteResponse(
    Long id,
    Long userId,
    Integer productId,
    LocalDateTime createdAt
) {
    public static FavoriteResponse from(Favorite favorite) {
        return new FavoriteResponse(
            favorite.getId(),
            favorite.getUser().getId(),
            favorite.getProductId(),
            favorite.getCreatedAt()
        );
    }
}
