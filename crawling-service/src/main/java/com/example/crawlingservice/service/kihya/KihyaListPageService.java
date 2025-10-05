package com.example.crawlingservice.service.kihya;

import com.example.crawlingservice.dto.ProductDTO;
import com.example.crawlingservice.service.ShopCrawlingService;
import com.example.crawlingservice.util.CrawlUtil;
import com.example.crawlingservice.util.ProductNameParser;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;

/**
 * 키햐 상품목록페이지를 크롤링해서 정보를 추출하는 서비스
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class KihyaListPageService implements ShopCrawlingService {
    private final CrawlUtil crawlUtil;
    private final ProductNameParser productNameParser;
    private final KihyaDetailPageService kihyaDetailPageService;

    @Value("${website.kihya.url}")
    private String shopUrl;

    // 카테고리 ID와 표준 카테고리명 매핑 (크롤링 순서 유지)
    private static final java.util.Map<String, String> CATEGORY_MAP;
    static {
        CATEGORY_MAP = new java.util.LinkedHashMap<>();
        CATEGORY_MAP.put("MCD025", "전통주");  // 우리술
        CATEGORY_MAP.put("MCD010", "양주");    // 위스키
        CATEGORY_MAP.put("MCD005", "와인");
        CATEGORY_MAP.put("MCD006", "사케");
        CATEGORY_MAP.put("MCD013", "양주");    // 리큐르
        CATEGORY_MAP.put("MCD009", "맥주");
        CATEGORY_MAP.put("MCD026", "논알콜");
        CATEGORY_MAP.put("MCD024", "기타");    // 기타 주류
    }

    /**
     * 키햐 쇼핑몰의 모든 카테고리에서 상품 정보 수집
     * @param driver WebDriver
     * @return 전체 상품 리스트
     */
    @Override
    public List<ProductDTO> getProducts(WebDriver driver) {
        List<ProductDTO> allProducts = new ArrayList<>();
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));

        try {
            // 키햐 상품 목록 페이지로 이동
            driver.get(shopUrl);

            // 페이지 로딩 대기 (카테고리 메뉴가 나타날 때까지)
            wait.until(ExpectedConditions.presenceOfElementLocated(
                By.cssSelector("div[id='kihya-category-main']")));

            // 각 카테고리 순회
            for (java.util.Map.Entry<String, String> entry : CATEGORY_MAP.entrySet()) {
                String categoryId = entry.getKey();
                String categoryName = entry.getValue();

                try {
                    log.info("키햐 카테고리 '{}' 크롤링 시작", categoryName);

                    // 카테고리 클릭
                    wait.until(ExpectedConditions.elementToBeClickable(By.id(categoryId)))
                        .click();

                    // 상품 목록이 로딩될 때까지 대기
                    wait.until(ExpectedConditions.presenceOfElementLocated(
                        By.cssSelector("ul.goods_product_list > li.goods_prd_item11")));

                    // 해당 카테고리의 모든 상품 파싱 (목록 + 상세)
                    List<ProductDTO> categoryProducts = parseProductList(driver, categoryName);
                    allProducts.addAll(categoryProducts);

                    log.info("키햐 카테고리 '{}' 완료: {}개 상품", categoryName, categoryProducts.size());

                } catch (Exception e) {
                    log.error("키햐 카테고리 '{}' 크롤링 실패: {}", categoryId, e.getMessage());
                    // 실패해도 다음 카테고리 계속 진행
                }
            }

            log.info("키햐 전체 크롤링 완료: 총 {}개 상품", allProducts.size());

        } catch (Exception e) {
            log.error("키햐 크롤링 중 오류 발생: {}", e.getMessage(), e);
        }

        return allProducts;
    }

    /**
     * 현재 카테고리의 상품 목록 파싱 (무한 스크롤 처리 포함)
     * @param driver WebDriver
     * @param categoryName 카테고리명
     * @return 상품 리스트 (상세 정보 포함)
     */
    private List<ProductDTO> parseProductList(WebDriver driver, String categoryName) {
        //무한 스크롤로 모든 상품 로딩
        crawlUtil.scrollToLoadAll(driver, "ul.goods_product_list > li.goods_prd_item11");

        // 로딩된 모든 상품 기본 정보 파싱
        List<ProductDTO> products = new ArrayList<>();
        String html = driver.getPageSource();
        Document doc = Jsoup.parse(html);

        Elements items = doc.select("ul.goods_product_list > li.goods_prd_item11");

        for (Element item : items) {
            try {
                ProductDTO product = parseProduct(item, categoryName);
                if (product != null) {
                    products.add(product);
                }
            } catch (Exception e) {
                log.warn("키햐 상품 파싱 중 오류: {}", e.getMessage());
            }
        }


        // 각 상품의 상세 정보 크롤링
        List<ProductDTO> detailedProducts = new ArrayList<>();
        for (int i = 0; i < products.size(); i++) {
            ProductDTO product = products.get(i);
            try {
                // 상세 페이지 크롤링
                ProductDTO detailedProduct = kihyaDetailPageService.getDetailPage(product, driver);
                detailedProducts.add(detailedProduct);

            } catch (Exception e) {
                log.warn("상품 '{}' 상세 페이지 크롤링 실패: {}", product.getProductName(), e.getMessage());
                // 실패해도 기본 정보는 유지
                detailedProducts.add(product);
            }
        }

        log.info("상세 크롤링 완료: {}개 상품", detailedProducts.size());
        return detailedProducts;
    }

    /**
     * 개별 상품 파싱
     * @param item 상품 요소
     * @param categoryName 카테고리명
     * @return ProductDTO
     */
    private ProductDTO parseProduct(Element item, String categoryName) {
        ProductDTO product = new ProductDTO();

        //상품명
        Element nameEl = item.selectFirst("li.prd_name");
        if (nameEl == null || nameEl.text().trim().isEmpty()) {
            return null; // 상품명이 없으면 스킵
        }
        String productName = nameEl.text().trim();

        // 제외할 상품인지 확인
        if (productNameParser.checkProductName(productName)) {
            return null;
        }

        // 괄호 제거한 상품명 저장
        String cleanedName = productNameParser.removeBrackets(productName);
        product.setProductName(cleanedName);

        // 브랜드 추출
        String brand = productNameParser.getBrand(productName);
        product.setBrand(brand);

        // 카테고리 설정
        product.setCategory(categoryName);

        //상세 링크
        Element linkEl = item.selectFirst("div.goods_list_info > a[href]");
        if (linkEl != null) {
            String relativeUrl = linkEl.attr("href");
            String fullUrl = convertToAbsoluteUrl(relativeUrl);
            product.setDetailLink(fullUrl);
        }

        return product;
    }

    /**
     * 상대 경로를 절대 경로로 변환
     * @param relativeUrl 상대 경로
     * @return 절대 경로
     */
    private String convertToAbsoluteUrl(String relativeUrl) {
        if (relativeUrl.startsWith("http")) {
            return relativeUrl;
        }

        // 형식을 절대 경로로 변환
        String cleanUrl = relativeUrl.replace("..", "");

        // 기본 도메인만 추출
        String baseUrl = shopUrl.split("\\?")[0];
        baseUrl = baseUrl.replace("/goods/goods_list.php", "");

        return baseUrl + cleanUrl;
    }
}
