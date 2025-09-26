package com.example.productservice.controller;

import com.example.productservice.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ProductController {
    private final ProductService productService;

    /**
     * 메인 페이지 상품정보 조회
     * @return 상품 목록
     */
    @GetMapping("/main")
    public ResponseEntity<?> getMain() {
        List<Map<String, Object>> mainProducts = productService.mainPageProducts();
        return ResponseEntity.ok().body(mainProducts);
    }
}
