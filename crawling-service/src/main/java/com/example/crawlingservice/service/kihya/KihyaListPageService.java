package com.example.crawlingservice.service.kihya;

import com.example.crawlingservice.dto.ProductDTO;
import com.example.crawlingservice.service.ShopCrawlingService;
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
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * 키햐 상품목록페이지를 크롤링해서 정보를 추출하는 서비스
 */
@Service
@Order(1)
@Slf4j
@RequiredArgsConstructor
public class KihyaListPageService implements ShopCrawlingService {
    private final ProductNameParser productNameParser;
    private final KihyaDetailPageService kihyaDetailPageService;
    private final com.example.crawlingservice.config.WebDriverPool webDriverPool;

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
            // 1단계: 모든 카테고리에서 기본 정보만 수집
            log.warn("키햐 1단계: 목록 페이지 크롤링 시작");
            driver.get(shopUrl);

            // 페이지 로딩 대기 (카테고리 메뉴가 나타날 때까지)
            wait.until(ExpectedConditions.presenceOfElementLocated(
                By.cssSelector("div[id='kihya-category-main']")));

            // 각 카테고리 순회하며 기본 정보만 수집
            for (java.util.Map.Entry<String, String> entry : CATEGORY_MAP.entrySet()) {
                String categoryId = entry.getKey();
                String categoryName = entry.getValue();

                try {
                    log.info("키햐 카테고리 '{}' 크롤링 시작", categoryName);

                    // 카테고리 클릭 (JavaScript 사용 - 화면 밖 요소도 클릭 가능)
                    org.openqa.selenium.WebElement categoryElement = wait.until(
                        ExpectedConditions.presenceOfElementLocated(By.id(categoryId)));
                    ((org.openqa.selenium.JavascriptExecutor) driver).executeScript(
                        "arguments[0].scrollIntoView(true); arguments[0].click();", categoryElement);

                    // 상품 목록이 로딩될 때까지 대기
                    wait.until(ExpectedConditions.presenceOfElementLocated(
                        By.cssSelector("ul.goods_product_list > li.goods_prd_item11")));

                    // 해당 카테고리의 기본 정보만 수집
                    List<ProductDTO> categoryProducts = parseProductListOnly(driver, categoryName);
                    allProducts.addAll(categoryProducts);

                    log.info("키햐 카테고리 '{}' 완료: {}개 상품", categoryName, categoryProducts.size());

                } catch (Exception e) {
                    log.error("키햐 카테고리 '{}' 크롤링 실패: {}", categoryName, e.getMessage());
                    // 실패해도 다음 카테고리 계속 진행
                }
            }

            log.warn("키햐 목록 페이지 크롤링 완료: 총 {}개 상품", allProducts.size());

            // 2단계: 병렬 처리로 상세 페이지 크롤링 (리뷰 제외)
            log.warn("키햐 2단계: 상세 페이지 병렬 크롤링 시작 (10개 스레드)");
            enrichProductsInParallel(allProducts);

            // 3단계: 리뷰만 별도로 병렬 크롤링
            log.warn("키햐 3단계: 리뷰 병렬 크롤링 시작 (10개 스레드)");
            enrichReviewsInParallel(allProducts);

            log.info("키햐에서 총 {}개의 상품을 크롤링했습니다.", allProducts.size());

        } catch (Exception e) {
            log.error("키햐 크롤링 중 오류 발생: {}", e.getMessage(), e);
        }

        return allProducts;
    }

    /**
     * 목록 페이지에서만 기본 정보 크롤링 (상세 페이지 방문 없음)
     * @param driver WebDriver
     * @param categoryName 카테고리명
     * @return 기본 정보만 담긴 상품 리스트
     */
    private List<ProductDTO> parseProductListOnly(WebDriver driver, String categoryName) {
        List<ProductDTO> products = new ArrayList<>();
        int consecutiveSoldOut = 0; // 연속 품절 카운터
        int maxConsecutiveSoldOut = 3; // 연속 품절 최대 허용 횟수

        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(3));

        try {
            while (true) {
                // 현재 페이지의 상품 파싱
                String html = driver.getPageSource();
                Document doc = Jsoup.parse(html);
                Elements items = doc.select("ul.goods_product_list > li.goods_prd_item11");

                int beforeSize = products.size();

                for (Element item : items) {
                    try {
                        // 품절 체크
                        Element soldoutEl = item.selectFirst("span.soldout_img");
                        if (soldoutEl != null) {
                            consecutiveSoldOut++;

                            // 연속 3개 품절이면 카테고리 종료
                            if (consecutiveSoldOut >= maxConsecutiveSoldOut) {
                                return products;
                            }
                            continue; // 품절 상품은 스킵
                        }

                        // 품절이 아니면 카운터 리셋
                        consecutiveSoldOut = 0;

                        ProductDTO product = parseProduct(item, categoryName);
                        if (product != null && !isProductAlreadyAdded(products, product)) {
                            products.add(product);
                        }
                    } catch (Exception e) {
                        log.debug("키햐 상품 파싱 중 오류: {}", e.getMessage());
                    }
                }

                // 더보기 버튼 찾기
                try {
                    org.openqa.selenium.WebElement moreButton = wait.until(
                        ExpectedConditions.elementToBeClickable(By.cssSelector("button.more_btn")));

                    // 버튼이 표시되는지 확인
                    String displayStyle = moreButton.getCssValue("display");
                    if (displayStyle.equals("none") || !moreButton.isDisplayed()) {
                        log.info("더보기 버튼 없음, 카테고리 크롤링 완료");
                        break;
                    }

                    // 더보기 버튼 클릭
                    ((org.openqa.selenium.JavascriptExecutor) driver).executeScript(
                        "arguments[0].click();", moreButton);

                    Thread.sleep(500); // 상품 로딩 대기

                } catch (org.openqa.selenium.TimeoutException e) {
                    // 더보기 버튼이 없으면 종료
                    log.info("더보기 버튼 없음, 카테고리 크롤링 완료");
                    break;
                } catch (Exception e) {
                    log.warn("더보기 버튼 클릭 실패: {}", e.getMessage());
                    break;
                }
            }
        } catch (Exception e) {
            log.error("카테고리 '{}' 파싱 중 오류: {}", categoryName, e.getMessage());
        }

        return products;
    }

    /**
     * 중복 상품 체크
     */
    private boolean isProductAlreadyAdded(List<ProductDTO> products, ProductDTO newProduct) {
        return products.stream()
            .anyMatch(p -> p.getDetailLink() != null &&
                p.getDetailLink().equals(newProduct.getDetailLink()));
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
     * 병렬 처리로 상세 페이지 크롤링 (WebDriverPool 사용)
     * @param products 크롤링할 상품 리스트
     */
    private void enrichProductsInParallel(List<ProductDTO> products) {
        int threadCount = 10; // 키햐 전용 스레드 수
        ExecutorService executor = Executors.newFixedThreadPool(threadCount);
        List<Future<Void>> futures = new ArrayList<>();

        // 스레드 안전한 카운터
        AtomicInteger counter = new AtomicInteger(0);
        int totalProducts = products.size();

        for (ProductDTO product : products) {
            Future<Void> future = executor.submit(() -> {
                WebDriver driver = null;
                try {
                    // WebDriverPool에서 드라이버 대여
                    driver = webDriverPool.borrowDriver();
                    kihyaDetailPageService.getDetailPage(product, driver);

                    int current = counter.incrementAndGet();
                    if (current % 50 == 0) {
                        log.warn("상세 페이지 크롤링 진행: {}/{}", current, totalProducts);
                    }
                } catch (Exception e) {
                    log.error("상품 '{}' 상세 페이지 크롤링 실패: {}", product.getProductName(), e.getMessage());
                } finally {
                    if (driver != null) {
                        // WebDriverPool에 드라이버 반납
                        webDriverPool.returnDriver(driver);
                    }
                }
                return null;
            });
            futures.add(future);
        }

        // 모든 작업 완료 대기
        for (Future<Void> future : futures) {
            try {
                future.get();
            } catch (Exception e) {
                log.error("병렬 작업 실행 중 오류: {}", e.getMessage());
            }
        }

        executor.shutdown();
        try {
            if (!executor.awaitTermination(60, TimeUnit.MINUTES)) {
                executor.shutdownNow();
            }
        } catch (InterruptedException e) {
            executor.shutdownNow();
            Thread.currentThread().interrupt();
        }

        log.warn("병렬 처리 완료: {}/{} 상품", counter.get(), totalProducts);
    }

    /**
     * 리뷰만 병렬 처리로 크롤링
     * @param products 크롤링할 상품 리스트
     */
    private void enrichReviewsInParallel(List<ProductDTO> products) {
        int threadCount = 10; // 리뷰 전용 스레드 수
        ExecutorService executor = Executors.newFixedThreadPool(threadCount);
        List<Future<Void>> futures = new ArrayList<>();

        // 스레드 안전한 카운터
        AtomicInteger counter = new AtomicInteger(0);
        int totalProducts = products.size();

        for (ProductDTO product : products) {
            Future<Void> future = executor.submit(() -> {
                WebDriver driver = null;
                try {
                    // WebDriverPool에서 드라이버 대여
                    driver = webDriverPool.borrowDriver();

                    // 리뷰만 크롤링
                    kihyaDetailPageService.parseReviewsOnly(driver, product);

                    int current = counter.incrementAndGet();
                    if (current % 50 == 0) {
                        log.warn("리뷰 크롤링 진행: {}/{}", current, totalProducts);
                    }
                } catch (Exception e) {
                    log.debug("상품 '{}' 리뷰 크롤링 실패 (스킵)", product.getProductName());
                } finally {
                    if (driver != null) {
                        // WebDriverPool에 드라이버 반납
                        webDriverPool.returnDriver(driver);
                    }
                }
                return null;
            });
            futures.add(future);
        }

        // 모든 작업 완료 대기
        for (Future<Void> future : futures) {
            try {
                future.get();
            } catch (Exception e) {
                log.error("리뷰 병렬 작업 실행 중 오류: {}", e.getMessage());
            }
        }

        executor.shutdown();
        try {
            if (!executor.awaitTermination(60, TimeUnit.MINUTES)) {
                executor.shutdownNow();
            }
        } catch (InterruptedException e) {
            executor.shutdownNow();
            Thread.currentThread().interrupt();
        }

        log.warn("리뷰 병렬 처리 완료: {}/{} 상품", counter.get(), totalProducts);
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
