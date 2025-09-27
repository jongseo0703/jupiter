package com.example.productservice.controller;

import com.example.productservice.dto.ProductDto;
import com.example.productservice.dto.SubCategoryDto;
import com.example.productservice.dto.TopCategoryDto;
import com.example.productservice.service.CategoryService;
import com.example.productservice.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ProductController {
    private final ProductService productService;
    private final CategoryService categoryService;

    /**
     * 메인 페이지 상품정보 조회
     * @return 상품 목록
     */
    @GetMapping("/main")
    public ResponseEntity<?> getMain() {
        List<Map<String, Object>> mainProducts = productService.mainPageProducts();
        return ResponseEntity.ok().body(mainProducts);
    }

    /**
     * 상품 목록 페이지 조회
     * @return 전체 상품 정보
     */
    @GetMapping("/list")
    public ResponseEntity<?> getProductList() {
        List<Map<String, Object>> productDtoList = productService.getProductList();
        return ResponseEntity.ok().body(productDtoList);
    }

    /**
     * 전체 카테고리 조회
     * @return 상위 카테고리 및 하위 카테고리
     */
    @GetMapping("/category")
    public ResponseEntity<?> getCategory() {
        Map<TopCategoryDto, List<SubCategoryDto>> category = categoryService.getAllCategoryList();
        return ResponseEntity.ok().body(category);
    }

    /**
     * 특정 상품 전체 정보 조회
     * @param productId 상품 아이디
     * @return 상품 정보
     */
    @GetMapping("/{productId}")
    public ResponseEntity<?> getProduct(@PathVariable("productId") Integer productId) {
        ProductDto productDto = productService.isProduct(productId);
        if (productDto == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok().body(productDto);
    }
}
