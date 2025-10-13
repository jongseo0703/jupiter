package com.example.productservice.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.util.List;
import java.util.Map;

@Getter
@Setter
@AllArgsConstructor
public class RecommendationResponseDTO {
    private Map<String, List<ProductDto>> recommendations;
    private String message;
}
