package com.example.gptservice.controller;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.gptservice.dto.ErrorResponse;
import com.example.gptservice.dto.PricePredictionRequest;
import com.example.gptservice.dto.PricePredictionResponse;
import com.example.gptservice.service.PricePredictionService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/predictions")
@CrossOrigin(origins = "http://localhost:5174")
public class PricePredictionController {
  private final PricePredictionService pricePredictionService;

  @Operation(summary = "가격 예측 생성", description = "상품의 가격 예측을 생성합니다.")
  @ApiResponses(
      value = {
        @ApiResponse(
            responseCode = "201",
            description = "예측 생성 성공",
            content = @Content(schema = @Schema(implementation = PricePredictionResponse.class))),
        @ApiResponse(
            responseCode = "400",
            description = "잘못된 요청",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(
            responseCode = "500",
            description = "서버 에러",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
      })
  @PostMapping
  public ResponseEntity<?> createPrediction(@Valid @RequestBody PricePredictionRequest request) {
    try {
      PricePredictionResponse response =
          pricePredictionService.predictPrice(
              request.getProductName(), request.getCurrentPrice(), request.getTrendData());
      return ResponseEntity.status(HttpStatus.CREATED).body(response);
    } catch (IllegalArgumentException e) {
      ErrorResponse error = new ErrorResponse("INVALID_INPUT", e.getMessage());
      return ResponseEntity.badRequest().body(error);
    } catch (Exception e) {
      ErrorResponse error = new ErrorResponse("INTERNAL_ERROR", "예측 생성 중 오류가 발생했습니다.");
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }
  }
}
