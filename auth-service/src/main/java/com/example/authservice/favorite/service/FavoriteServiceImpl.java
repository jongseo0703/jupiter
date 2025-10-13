package com.example.authservice.favorite.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.authservice.favorite.dto.FavoriteRequest;
import com.example.authservice.favorite.dto.FavoriteResponse;
import com.example.authservice.favorite.dto.FavoriteUserResponse;
import com.example.authservice.favorite.entity.Favorite;
import com.example.authservice.favorite.repository.FavoriteRepository;
import com.example.authservice.global.exception.BusinessException;
import com.example.authservice.user.entity.User;
import com.example.authservice.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class FavoriteServiceImpl implements FavoriteService {

  private final FavoriteRepository favoriteRepository;
  private final UserRepository userRepository;

  @Override
  @Transactional
  public FavoriteResponse addFavorite(Long userId, FavoriteRequest request) {
    User user =
        userRepository
            .findById(userId)
            .orElseThrow(() -> new BusinessException("사용자를 찾을 수 없습니다.", 404, "USER_NOT_FOUND"));

    if (favoriteRepository.existsByUserIdAndProductId(userId, request.productId())) {
      throw new BusinessException("이미 즐겨찾기에 추가된 상품입니다.", 409, "FAVORITE_ALREADY_EXISTS");
    }

    Favorite favorite = Favorite.builder().user(user).productId(request.productId()).build();

    Favorite savedFavorite = favoriteRepository.save(favorite);
    return FavoriteResponse.from(savedFavorite);
  }

  @Override
  public List<FavoriteResponse> getFavorites(Long userId) {
    return favoriteRepository.findByUserId(userId).stream()
        .map(FavoriteResponse::from)
        .collect(Collectors.toList());
  }

  @Override
  @Transactional
  public void removeFavorite(Long userId, Integer productId) {
    if (!favoriteRepository.existsByUserIdAndProductId(userId, productId)) {
      throw new BusinessException("즐겨찾기를 찾을 수 없습니다.", 404, "FAVORITE_NOT_FOUND");
    }
    favoriteRepository.deleteByUserIdAndProductId(userId, productId);
  }

  @Override
  public List<FavoriteUserResponse> getFavoriteUsersByProductId(Integer productId) {
    return favoriteRepository.findByProductIdWithUser(productId).stream()
        .map(FavoriteUserResponse::from)
        .collect(Collectors.toList());
  }

  @Override
  @Transactional
  public FavoriteResponse togglePriceAlert(Long userId, Integer productId, Boolean enabled) {
    Favorite favorite =
        favoriteRepository
            .findByUserIdAndProductId(userId, productId)
            .orElseThrow(
                () -> new BusinessException("즐겨찾기를 찾을 수 없습니다.", 404, "FAVORITE_NOT_FOUND"));

    favorite.setPriceAlert(enabled);
    Favorite updatedFavorite = favoriteRepository.save(favorite);
    return FavoriteResponse.from(updatedFavorite);
  }
}
