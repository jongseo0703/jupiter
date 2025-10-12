package com.example.crawlingservice.service.st11;

import com.example.crawlingservice.dto.PriceDTO;
import com.example.crawlingservice.dto.ProductDTO;
import com.example.crawlingservice.dto.ReviewDTO;
import com.example.crawlingservice.service.ShopCrawlingService;
import com.example.crawlingservice.util.ProductNameParser;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

@Service
@Order(2)
@Slf4j
@RequiredArgsConstructor
public class St11ListPageService implements ShopCrawlingService {
    @Value("${websiste.11st.url}")
    private String url;
    @Value("${11st_logo.url}")
    private String logiUrl;

    private final ProductNameParser productNameParser;
    private final St11DetailPageService detailPageService;
    private final com.example.crawlingservice.config.WebDriverPool webDriverPool;

    /**
     * 11번가 상품목록 크롤링 서비스
     * @param driver WebDriver
     * @return 상품 목록 반환
     */
    @Override
    public List<ProductDTO> getProducts(WebDriver driver) {
        List<ProductDTO> products = new ArrayList<>();
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(7));

        try {
            // 1단계: 모든 목록 페이지에서 기본 정보만 수집
            log.info("11번가 1단계: 목록 페이지 크롤링 시작");
            driver.get(url);

            while (true) {
                // 상품 리스트가 로드될 때까지 대기
                wait.until(ExpectedConditions.presenceOfElementLocated(By.cssSelector("ul.tt_listbox")));

                // 현재 페이지 상품 기본 정보만 크롤링
                List<ProductDTO> pageProducts = crawlListPageOnly(driver);
                products.addAll(pageProducts);

                // 다음 페이지 버튼 확인 및 클릭
                if (!goToNextPage(driver, wait)) {
                    break;
                }
            }

            log.info("11번가 목록 페이지 크롤링 완료: 총 {}개 상품", products.size());

            // 2단계: 병렬 처리로 상세 페이지 크롤링
            log.info("11번가 2단계: 상세 페이지 병렬 크롤링 시작 (8개 스레드)");
            enrichProductsInParallel(products);

            log.info("11번가에서 총 {}개의 상품을 크롤링했습니다.", products.size());

        } catch (Exception e) {
            log.error("11번가 상품 목록 크롤링 중 오류 발생: {}", e.getMessage());
        }

        return products;
    }

    /**
     * 목록 페이지에서만 기본 정보 크롤링 (상세 페이지 방문 없음)
     */
    private List<ProductDTO> crawlListPageOnly(WebDriver driver) {
        List<ProductDTO> products = new ArrayList<>();

        try {
            // "일반상품" 영역 내의 상품 리스트만 가져오기
            WebElement normalProductSection = driver.findElement(By.cssSelector("div.normal_prd"));
            List<WebElement> productElements = normalProductSection.findElements(By.cssSelector("ul.tt_listbox > li"));

            if (productElements.isEmpty()) {
                return products;
            }

            // 상품 정보 추출
            for (WebElement element : productElements) {
                try {
                    ProductDTO product = extractProduct(element);
                    if (product != null && product.getProductName() != null && !product.getProductName().trim().isEmpty()) {
                        products.add(product);
                    }
                } catch (Exception e) {
                    // 상품 정보 추출 실패 시 스킵
                }
            }


        } catch (Exception e) {
            log.error("일반상품 목록 크롤링 중 오류 발생: {}", e.getMessage());
        }

        return products;
    }

    /**
     * 페이징 처리된 상품목록 자동 이동 메서드
     * @return 다음 페이지가 있으면 true, 없으면 false
     */
    private boolean goToNextPage(WebDriver driver, WebDriverWait wait) {
        // 최대 3번 확인
        int maxRetries = 3;

        for (int retry = 0; retry < maxRetries; retry++) {
            try {

                // 현재 활성화된 페이지 번호 저장
                String currentPageText = driver.findElement(By.cssSelector("div.s_paging_v2 strong")).getText();

                // 현재 페이지 번호
                int currentPageNum;
                //다음 페이지 번호
                int nextPageNum;

                try {
                    currentPageNum = Integer.parseInt(currentPageText);
                    nextPageNum = currentPageNum + 1;
                } catch (NumberFormatException e) {
                    log.error("페이지 번호 파싱 실패: {}", currentPageText);
                    return false;
                }

                // 상품 목록 중 상단 상품명 초기화
                String firstProductName = null;
                try {
                    WebElement firstProduct = driver.findElement(By.cssSelector("div.normal_prd ul.tt_listbox > li:first-child div.list_info p.info_tit a"));
                    firstProductName = firstProduct.getText().trim();
                } catch (Exception e) {
                    // 첫 번째 상품명 추출 실패 시 스킵
                }

                // 다음 페이지 버튼이 화면에 있는지 확인
                org.openqa.selenium.JavascriptExecutor js = (org.openqa.selenium.JavascriptExecutor) driver;
                boolean isNextPageVisible = false;

                try {
                    // 다음 페이지 번호가 페이징 영역에 있는지 확인
                    List<WebElement> pageLinks = driver.findElements(By.cssSelector("div.s_paging_v2 span a"));
                    for (WebElement link : pageLinks) {
                        String linkText = link.getText().trim();
                        if (linkText.equals(String.valueOf(nextPageNum))) {
                            isNextPageVisible = true;
                            break;
                        }
                    }
                } catch (Exception e) {
                    // 페이지 링크 확인 실패 시 스킵
                }

                // 다음 페이지로 이동
                if (isNextPageVisible) {
                    // 다음 페이지 번호가 보이면 JavaScript 함수로 이동
                    js.executeScript(String.format("smartFilter.goPageNum(%d);", nextPageNum));
                } else {
                    // 다음 페이지 번호가 안 보이면 "다음 목록" 버튼 클릭
                    try {
                        WebElement nextButton = driver.findElement(By.cssSelector("div.s_paging_v2 a.next"));
                        nextButton.click();
                    } catch (Exception e) {
                        log.info("'다음 목록' 버튼을 찾을 수 없습니다. 마지막 페이지로 추정");
                        return false;
                    }
                }

                final String originalFirstProduct = firstProductName;

                // 상품 목록이 실제로 바뀔 때까지 대기 (최대 10초)
                boolean contentChanged = wait.until(driver2 -> {
                    try {
                        WebElement newFirstProduct = driver2.findElement(By.cssSelector("div.normal_prd ul.tt_listbox > li:first-child div.list_info p.info_tit a"));
                        String newFirstProductName = newFirstProduct.getText().trim();
                        return originalFirstProduct == null || !newFirstProductName.equals(originalFirstProduct);
                    } catch (Exception e) {
                        return false;
                    }
                });

                if (contentChanged) {
                    String newPageText = driver.findElement(By.cssSelector("div.s_paging_v2 strong")).getText();
                    log.info("페이지 전환 완료: {} -> {}", currentPageText, newPageText);
                    return true;
                } else {
                    log.warn("페이지 전환 실패");
                    return false;
                }

            } catch (org.openqa.selenium.StaleElementReferenceException e) {
                // Stale element 발생 시 재시도
                try {
                    Thread.sleep(500);
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                }
            } catch (Exception e) {
                log.info("다음 페이지가 없습니다: {}", e.getMessage());
                return false;
            }
        }

        return false;
    }


    /**
     * 11번가 개별 상품 정보 추출
     */
    private ProductDTO extractProduct(WebElement element) {
        ProductDTO product = new ProductDTO();

        // 상품명 추출
        String getName = extractProductName(element);
        if (getName == null || getName.trim().isEmpty()) {
            return null;
        }

        // 제외 키워드 검사
        if (productNameParser.checkProductName(getName)) {
            return null;
        }

        // 브랜드 추출
        String brand = productNameParser.getBrand(getName);
        if (brand != null) {
            product.setBrand(brand);
        }

        // 용량
        Map<String, String> nameInfo = productNameParser.usedName(getName);
        if (nameInfo != null && nameInfo.get("volume") != null) {
            try {
                product.setVolume(Integer.parseInt(nameInfo.get("volume")));
            } catch (NumberFormatException e) {
                // 용량 변환 실패 시 스킵
            }
        }

        // 도수
        String alcohol = extractAlcoholFromName(getName);
        if (alcohol != null) {
            try {
                product.setAlcohol(Double.parseDouble(alcohol));
            } catch (NumberFormatException e) {
                // 도수 변환 실패 시 스킵
            }
        }

        // (), [] 제거
        String productName = productNameParser.removeBrackets(getName);

        // 상세 페이지 링크 추출
        String detailLink = extractDetailLink(element);

        // 가격 추출 (목록 페이지에서)
        Integer price = extractPriceFromList(element);

        // 배송비 추출 (목록 페이지에서)
        Integer deliveryFee = extractDeliveryFeeFromList(element);

        // ProductDTO 설정
        product.setProductName(productName);
        product.setDetailLink(detailLink);

        // PriceDTO 생성 및 설정
        PriceDTO priceDTO = new PriceDTO();
        priceDTO.setShopName("11번가");
        priceDTO.setShopIcon(logiUrl);

        if (detailLink != null) {
            priceDTO.setShopLink(detailLink);
        }

        if (price != null) {
            priceDTO.setPrice(price);
        }
        if (deliveryFee != null) {
            priceDTO.setDeliveryFee(deliveryFee);
        }
        product.getPrices().add(priceDTO);

        return product;
    }

    /**
     * 상품명에서 도수 추출
     */
    private String extractAlcoholFromName(String productName) {
        try {
            java.util.regex.Pattern pattern = java.util.regex.Pattern.compile("(\\d+(?:\\.\\d+)?)\\s*[도%]");
            java.util.regex.Matcher matcher = pattern.matcher(productName);

            if (matcher.find()) {
                return matcher.group(1);
            }
        } catch (Exception e) {
            // 도수 추출 실패 시 스킵
        }
        return null;
    }

    /**
     * 상품명 추출
     */
    private String extractProductName(WebElement element) {
        try {
            WebElement nameElement = element.findElement(By.cssSelector("div.list_info p.info_tit a"));
            return nameElement.getText().trim();
        } catch (Exception e) {
            return null;
        }
    }

    /**
     * 상세 페이지 링크 추출
     */
    private String extractDetailLink(WebElement element) {
        try {
            WebElement linkElement = element.findElement(By.cssSelector("div.list_info p.info_tit a"));
            String link = linkElement.getAttribute("href");

            if (link != null && !link.isEmpty()) {
                return link;
            }
        } catch (Exception e) {
            // 상세 링크 추출 실패
        }
        return null;
    }

    /**
     * 목록 페이지에서 가격 추출 (할인가 적용)
     */
    private Integer extractPriceFromList(WebElement element) {
        try {
            WebElement priceElement = element.findElement(By.cssSelector("div.list_price div.price_box strong.sale_price"));
            String priceText = priceElement.getText().trim();

            // 콤마, 공백 제거 후 숫자만 추출
            String cleanPrice = priceText.replaceAll("[^0-9]", "");

            if (!cleanPrice.isEmpty()) {
                return Integer.parseInt(cleanPrice);
            }
        } catch (Exception e) {
            // 가격 추출 실패
        }
        return null;
    }

    /**
     * 목록 페이지에서 배송비 추출
     */
    private Integer extractDeliveryFeeFromList(WebElement element) {
        try {
            WebElement deliveryElement = element.findElement(By.cssSelector("div.list_price div.deliver p span"));
            String deliveryText = deliveryElement.getText().trim();

            // "무료배송" 또는 "무료" 체크
            if (deliveryText.contains("무료")) {
                return 0;
            }

            // "배송비 3,000원" 형식에서 숫자 추출
            String cleanFee = deliveryText.replaceAll("[^0-9]", "");

            if (!cleanFee.isEmpty()) {
                return Integer.parseInt(cleanFee);
            }
        } catch (Exception e) {
            // 배송비 추출 실패
        }
        return null;
    }

    /**
     * 병렬 처리로 상세 페이지 크롤링 (WebDriverPool 사용)
     * @param products 크롤링할 상품 리스트
     */
    private void enrichProductsInParallel(List<ProductDTO> products) {
        int threadCount = 8; // WebDriverPool 크기와 동일
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
                    enrichProductFromDetailPage(driver, product);

                    int current = counter.incrementAndGet();
                    if (current % 100 == 0) {
                        log.info("상세 페이지 크롤링 진행: {}/{}", current, totalProducts);
                    }
                } catch (Exception e) {
                    log.warn("상품 '{}' 상세 페이지 크롤링 실패: {}", product.getProductName(), e.getMessage());
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

        log.info("병렬 처리 완료: {}/{} 상품", counter.get(), totalProducts);
    }

    /**
     * 상세 페이지에서 추가 정보 크롤링하여 ProductDTO 완성
     * @param driver WebDriver
     * @param product 목록 페이지에서 추출한 기본 정보가 담긴 ProductDTO
     */
    private void enrichProductFromDetailPage(WebDriver driver, ProductDTO product) {
        if (product.getDetailLink() == null || product.getDetailLink().isEmpty()) {
            log.debug("상세 링크가 없어 상세 정보를 크롤링할 수 없습니다.");
            return;
        }

        try {
            // 상세 페이지로 이동
            driver.get(product.getDetailLink());

            // 타임아웃 3초로 단축 (성능 최적화)
            WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(3));

            // 페이지 로드 대기
            wait.until(ExpectedConditions.presenceOfElementLocated(By.tagName("body")));

            // 카테고리 추출
            detailPageService.extractCategories(driver, product);

            // 상품 이미지 추출
            detailPageService.extractProductImage(driver, product);

            // 리뷰 추출
            List<ReviewDTO> allReviews = detailPageService.extractReviews(driver);
            if (allReviews != null && !allReviews.isEmpty()) {
                product.setReviews(allReviews);
            }

            log.debug("상세 페이지 정보 추출 완료: {}", product.getProductName());

        } catch (Exception e) {
            // 상세 페이지 크롤링 실패
        }
    }
}
