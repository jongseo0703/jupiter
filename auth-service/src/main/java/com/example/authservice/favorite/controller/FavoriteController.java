package com.example.authservice.favorite.controller;

import com.example.authservice.favorite.dto.FavoriteRequest;
import com.example.authservice.favorite.dto.FavoriteResponse;
import com.example.authservice.favorite.dto.FavoriteUserResponse;
import com.example.authservice.favorite.service.FavoriteService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "즐겨찾기", description = "즐겨찾기 관리 API")
@RestController
@RequestMapping("/api/v1/favorites")
@RequiredArgsConstructor
@Slf4j
public class FavoriteController {

    private final FavoriteService favoriteService;

    @PostMapping("/{userId}")
    @Operation(summary = "즐겨찾기 추가", description = "사용자가 상품을 즐겨찾기에 추가합니다.")
    public ResponseEntity<FavoriteResponse> addFavorite(
            @PathVariable Long userId,
            @RequestBody FavoriteRequest request) {
        log.info("⭐ 즐겨찾기 추가 - userId: {}, productId: {}", userId, request.productId());
        return ResponseEntity.ok(favoriteService.addFavorite(userId, request));
    }

    @GetMapping("/{userId}")
    @Operation(summary = "즐겨찾기 목록 조회", description = "사용자의 즐겨찾기 목록을 조회합니다.")
    public ResponseEntity<List<FavoriteResponse>> getFavorites(@PathVariable Long userId) {
        log.info("📋 즐겨찾기 목록 조회 - userId: {}", userId);
        return ResponseEntity.ok(favoriteService.getFavorites(userId));
    }

    @DeleteMapping("/{userId}/products/{productId}")
    @Operation(summary = "즐겨찾기 삭제", description = "즐겨찾기에서 상품을 삭제합니다.")
    public ResponseEntity<Void> removeFavorite(
            @PathVariable Long userId,
            @PathVariable Integer productId) {
        log.info("🗑️ 즐겨찾기 삭제 - userId: {}, productId: {}", userId, productId);
        favoriteService.removeFavorite(userId, productId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/products/{productId}/users")
    @Operation(summary = "상품을 즐겨찾기한 사용자 목록 조회", description = "특정 상품을 즐겨찾기한 사용자 목록을 조회합니다.")
    public ResponseEntity<List<FavoriteUserResponse>> getFavoriteUsers(@PathVariable Integer productId) {
        log.info("👥 상품 즐겨찾기 사용자 조회 - productId: {}", productId);
        return ResponseEntity.ok(favoriteService.getFavoriteUsersByProductId(productId));
    }
}
