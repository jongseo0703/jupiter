package com.example.authservice.favorite.service;

import java.util.List;

import com.example.authservice.favorite.dto.FavoriteRequest;
import com.example.authservice.favorite.dto.FavoriteResponse;
import com.example.authservice.favorite.dto.FavoriteUserResponse;

public interface FavoriteService {

  FavoriteResponse addFavorite(Long userId, FavoriteRequest request);

  List<FavoriteResponse> getFavorites(Long userId);

  void removeFavorite(Long userId, Integer productId);

  List<FavoriteUserResponse> getFavoriteUsersByProductId(Integer productId);

  FavoriteResponse togglePriceAlert(Long userId, Integer productId, Boolean enabled);
}
