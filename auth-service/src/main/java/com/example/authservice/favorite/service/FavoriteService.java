package com.example.authservice.favorite.service;

import com.example.authservice.favorite.dto.FavoriteRequest;
import com.example.authservice.favorite.dto.FavoriteResponse;
import com.example.authservice.favorite.dto.FavoriteUserResponse;

import java.util.List;

public interface FavoriteService {

    FavoriteResponse addFavorite(Long userId, FavoriteRequest request);

    List<FavoriteResponse> getFavorites(Long userId);

    void removeFavorite(Long userId, Integer productId);

    List<FavoriteUserResponse> getFavoriteUsersByProductId(Integer productId);
}
