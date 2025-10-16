package com.example.productservice.controller;


import com.example.productservice.dto.BulkProductDTO;
import com.example.productservice.dto.ProductDto;
import com.example.productservice.dto.SubCategoryDto;
import com.example.productservice.dto.TopCategoryDto;
import com.example.productservice.service.BulkProductService;
import com.example.productservice.service.CategoryService;
import com.example.productservice.service.ProductService;
import com.example.productservice.service.PriceUpdateService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ProductController {
    private final ProductService productService;
    private final CategoryService categoryService;
    private final PriceUpdateService priceUpdateService;
    private final BulkProductService bulkProductService;

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
     * 상품 목록 페이지 조회 (페이징 지원)
     * @param includeInactive 비활성 상품 포함 여부 (관리자용)
     * @param page 페이지 번호 (0부터 시작, 기본값: 0)
     * @param size 페이지 크기 (기본값: 20)
     * @param category 카테고리 필터 (선택사항)
     * @param searchTerm 검색어 (상품명 또는 카테고리명으로 검색, 선택사항)
     * @return 페이징된 상품 정보
     */
    @GetMapping("/list")
    public ResponseEntity<?> getProductList(
            @RequestParam(required = false, defaultValue = "false") Boolean includeInactive,
            @RequestParam(required = false, defaultValue = "0") Integer page,
            @RequestParam(required = false, defaultValue = "20") Integer size,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String searchTerm) {
        Map<String, Object> result = productService.getProductListPaged(includeInactive, page, size, category, searchTerm);
        return ResponseEntity.ok().body(result);
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

    @PutMapping("/prices/{priceId}")
    public ResponseEntity<?> updatePrice(
            @PathVariable Integer priceId,
            @RequestBody Map<String, Integer> request) {
        try {
            priceUpdateService.updatePrice(priceId, request.get("price"));
            return ResponseEntity.ok().body(Map.of("message", "가격이 업데이트되었습니다."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * 상품 활성화/비활성화 상태 변경 (관리자 전용)
     * @param productId 상품 아이디
     * @param request isAvailable 값
     * @return 성공/실패 메시지
     */
    @PutMapping("/products/{productId}/availability")
    public ResponseEntity<?> updateProductAvailability(
            @PathVariable Integer productId,
            @RequestBody Map<String, Boolean> request) {
        try {
            productService.updateProductAvailability(productId, request.get("isAvailable"));
            return ResponseEntity.ok().body(Map.of("message", "상품 활성화 상태가 업데이트되었습니다."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * 상품 정보 수정 (관리자 전용)
     * @param productId 상품 아이디
     * @param request 수정할 상품 정보
     * @return 성공/실패 메시지
     */
    @PutMapping("/products/{productId}")
    public ResponseEntity<?> updateProduct(
            @PathVariable Integer productId,
            @RequestBody Map<String, Object> request) {
        try {
            productService.updateProduct(productId, request);
            return ResponseEntity.ok().body(Map.of("message", "상품 정보가 업데이트되었습니다."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * 상품 삭제 (관리자 전용)
     * @param productId 상품 아이디
     * @return 성공/실패 메시지
     */
    @DeleteMapping("/products/{productId}")
    public ResponseEntity<?> deleteProduct(@PathVariable Integer productId) {
        try {
            productService.deleteProduct(productId);
            return ResponseEntity.ok().body(Map.of("message", "상품이 삭제되었습니다."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * 특정 상품의 가격 하락 여부 체크 및 알림 전송 (크롤링 서비스 전용)
     * @param productId 상품 아이디
     * @return 성공 메시지
     */
    @PostMapping("/prices/check-alert/{productId}")
    public ResponseEntity<?> checkPriceAlert(@PathVariable Integer productId) {
        try {
            priceUpdateService.checkAndSendPriceAlert(productId);
            return ResponseEntity.ok().body(Map.of("message", "가격 알림 체크 완료"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * 크롤링 데이터 벌크 생성 (크롤링 서비스 전용)
     * @param products 상품 목록
     * @return 저장된 상품 수
     */
    @PostMapping("/products/bulk")
    public ResponseEntity<?> createProductsBulk(@RequestBody List<BulkProductDTO> products) {
        try {
            int savedCount = bulkProductService.saveBulkProducts(products);
            return ResponseEntity.ok().body(Map.of(
                "message", "벌크 저장 완료",
                "savedCount", savedCount,
                "totalCount", products.size()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
