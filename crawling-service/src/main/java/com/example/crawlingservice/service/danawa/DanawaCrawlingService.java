package com.example.crawlingservice.service.danawa;

import com.example.crawlingservice.config.WebDriverPool;
import com.example.crawlingservice.dto.PriceDTO;
import com.example.crawlingservice.dto.ProductDTO;
import com.example.crawlingservice.util.FinalUrlResolver;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * 다나와 크롤링 메인 서비스
 * 3단계 크롤링 구조:
 * 1단계: ListPageService - 단일 스레드로 상품 목록 크롤링
 * 2단계: DetailPageService - 다중 스레드(10개)로 상세 페이지 크롤링
 * 3단계: FinalUrlResolver - 최종 구매 사이트 링크 교환
 *
 * 모든 WebDriver 관리는 WebDriverPool이 담당
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class DanawaCrawlingService {
    private final ListPageService listPageService;
    private final DetailPageService detailPageService;
    private final WebDriverPool driverPool;
    private final FinalUrlResolver finalUrlResolver;

    @Value("${website.url}")
    private String websiteUrl;


    /**
     * 다나와 전체 크롤링 실행
     * @return 크롤링된 상품 리스트
     */
    public List<ProductDTO> crawlDanawa() {
        WebDriver driver = null;

        try {
            // WebDriver 대여 (목록 페이지용)
            driver = driverPool.borrowDriver();
            log.info("========== 다나와 크롤링 시작 ==========");

            // 1단계: 상품 목록 페이지 크롤링
            List<ProductDTO> listProducts = crawlListPages(driver);
            log.info("목록 페이지 크롤링 완료: {}개 상품 발견", listProducts.size());

            // 목록 페이지용 드라이버 반납
            driverPool.returnDriver(driver);
            driver = null;

            // 2단계: 각 상품의 상세 페이지 병렬 크롤링
            List<ProductDTO> allProducts = crawlDetailPagesInParallel(listProducts);
            log.info("상세 페이지 크롤링 완료: {}개 상품", allProducts.size());

            // 3단계: 최종 URL 변환 (병렬 처리)
            convertShopLinksInParallel(allProducts);

            log.info("========== 다나와 크롤링 완료 ==========");
            log.info("총 {}개 상품 크롤링 완료", allProducts.size());

            return allProducts;

        } catch (Exception e) {
            log.error("다나와 크롤링 중 오류 발생: {}", e.getMessage(), e);
            return new ArrayList<>();
        } finally {
            // WebDriver 반납 (예외 발생 시)
            if (driver != null) {
                driverPool.returnDriver(driver);
            }
        }
    }

    /**
     * 상세 페이지 병렬 크롤링
     * @param listProducts 목록에서 가져온 상품들
     * @return 상세 정보가 추가된 상품 리스트
     */
    private List<ProductDTO> crawlDetailPagesInParallel(List<ProductDTO> listProducts) {
        // 결과를 저장할 동기화된 리스트
        List<ProductDTO> allProducts = new CopyOnWriteArrayList<>();

        // 성공/실패 카운터
        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger failCount = new AtomicInteger(0);

        // 병렬 처리를 위한 ExecutorService (최대 10개 스레드)
        ExecutorService executor = Executors.newFixedThreadPool(10);
        List<Future<?>> futures = new ArrayList<>();

        // 각 상품을 병렬로 처리
        for (int i = 0; i < listProducts.size(); i++) {
            final int index = i;
            final ProductDTO product = listProducts.get(i);

            Future<?> future = executor.submit(() -> {
                WebDriver parallelDriver = null;
                try {
                    // WebDriver 풀에서 대여
                    parallelDriver = driverPool.borrowDriver();

                    log.info("[{}/{}] 상세 페이지 크롤링 중: {}",
                            index + 1, listProducts.size(), product.getProductName());

                    // 상세 페이지 크롤링
                    ProductDTO detailProduct = crawlDetailPage(product, parallelDriver);
                    allProducts.add(detailProduct);
                    successCount.incrementAndGet();

                    // 서버 부하 방지를 위한 짧은 딜레이
                    Thread.sleep(300);

                } catch (InterruptedException e) {
                    log.warn("상품 '{}' 크롤링 인터럽트", product.getProductName());
                    Thread.currentThread().interrupt();
                    allProducts.add(product);
                    failCount.incrementAndGet();
                } catch (Exception e) {
                    log.warn("상품 '{}' 상세 페이지 크롤링 실패: {}",
                            product.getProductName(), e.getMessage());
                    // 실패해도 기본 정보는 저장
                    allProducts.add(product);
                    failCount.incrementAndGet();
                } finally {
                    // WebDriver 반납
                    if (parallelDriver != null) {
                        driverPool.returnDriver(parallelDriver);
                    }
                }
            });

            futures.add(future);
        }

        // 모든 작업 완료 대기
        for (Future<?> future : futures) {
            try {
                future.get(); // 각 작업이 완료될 때까지 대기
            } catch (Exception e) {
                log.error("상세 페이지 크롤링 작업 대기 중 오류: {}", e.getMessage());
            }
        }

        // ExecutorService 종료
        executor.shutdown();
        try {
            if (!executor.awaitTermination(10, TimeUnit.MINUTES)) {
                executor.shutdownNow();
            }
        } catch (InterruptedException e) {
            executor.shutdownNow();
            Thread.currentThread().interrupt();
        }

        log.info("상세 페이지 크롤링 완료 - 성공: {}개, 실패: {}개",
                successCount.get(), failCount.get());

        return allProducts;
    }

    /**
     * 상품 목록 페이지 크롤링 (상품이 없을 때까지 전체)
     * @param driver WebDriver
     * @return 상품 목록
     */
    private List<ProductDTO> crawlListPages(WebDriver driver) {
        List<ProductDTO> products = new ArrayList<>();

        try {
            // 첫 페이지 로드
            driver.get(websiteUrl);
            waitForPageLoad(driver);

            int page = 1;
            while (true) {
                try {
                    log.info("목록 페이지 {} 크롤링 중...", page);

                    // 현재 페이지 HTML 가져오기
                    String html = driver.getPageSource();

                    // ListPageService를 통해 상품 정보 추출
                    List<ProductDTO> pageProducts = listPageService.crawler(html);

                    if (pageProducts.isEmpty()) {
                        log.info("더 이상 상품이 없습니다. 크롤링 종료 (페이지: {})", page);
                        break;
                    }

                    products.addAll(pageProducts);
                    log.info("페이지 {} 완료: {}개 상품 추출", page, pageProducts.size());

                    // 다음 페이지로 이동
                    boolean hasNextPage = goToNextPage(driver, page);
                    if (!hasNextPage) {
                        log.info("마지막 페이지에 도달했습니다. (페이지: {})", page);
                        break;
                    }

                    // 페이지 로딩 대기
                    Thread.sleep(1000);
                    page++;

                } catch (Exception e) {
                    log.warn("목록 페이지 {} 크롤링 중 오류: {}", page, e.getMessage());
                    // 한 페이지 실패해도 계속 진행
                    break;
                }
            }

        } catch (Exception e) {
            log.error("목록 페이지 크롤링 실패: {}", e.getMessage(), e);
        }

        return products;
    }

    /**
     * 상품 상세 페이지 크롤링
     * @param product 목록에서 가져온 상품 정보
     * @param driver WebDriver
     * @return 상세 정보가 추가된 상품
     */
    private ProductDTO crawlDetailPage(ProductDTO product, WebDriver driver) throws Exception {
        if (product.getDetailLink() == null || product.getDetailLink().isEmpty()) {
            log.warn("상품 '{}' 상세 링크가 없습니다.", product.getProductName());
            return product;
        }

        try {
            // 상세 페이지로 이동
            driver.get(product.getDetailLink());
            waitForPageLoad(driver);

            // DetailPageService를 통해 상세 정보 크롤링
            ProductDTO detailProduct = detailPageService.detailPage(product, driver);

            return detailProduct;

        } catch (Exception e) {
            log.error("상품 '{}' 상세 페이지 크롤링 실패: {}",
                    product.getProductName(), e.getMessage());
            throw e;
        }
    }

    /**
     * 다음 페이지로 이동 (다나와 동적 페이징)
     * @param driver WebDriver
     * @param currentPage 현재 페이지 번호
     * @return 다음 페이지 이동 성공 여부
     */
    private boolean goToNextPage(WebDriver driver, int currentPage) {
        try {
            JavascriptExecutor js = (JavascriptExecutor) driver;
            int nextPage = currentPage + 1;

            // 다음 페이지 버튼이 있는지 먼저 확인
            String checkScript = String.format(
                "var nextPageLink = document.querySelector('a.num[onclick*=\"movePage(%d)\"]');" +
                "var nextBtn = document.querySelector('a.nav_next:not(.disabled)');" +
                "if (!nextPageLink && !nextBtn) {" +
                "  return false;" + // 다음 페이지 링크 없음 = 마지막 페이지
                "}" +
                "return true;",
                nextPage
            );

            Object checkResult = js.executeScript(checkScript);
            if (checkResult == null || !(Boolean) checkResult) {
                log.info("마지막 페이지입니다. 다음 페이지 버튼이 없습니다.");
                return false;
            }

            // 다나와의 movePage() 함수 직접 호출
            String script = String.format(
                "if (typeof movePage === 'function') {" +
                "  movePage(%d);" +
                "  return true;" +
                "}" +
                "return false;",
                nextPage
            );

            Object result = js.executeScript(script);

            if (result != null && (Boolean) result) {
                // 페이지 전환 대기
                Thread.sleep(2000); // 동적 로딩 대기
                waitForPageLoad(driver);
                return true;
            }

            log.warn("movePage 함수를 찾을 수 없습니다.");
            return false;

        } catch (Exception e) {
            log.warn("다음 페이지 이동 실패: {}", e.getMessage());
            return false;
        }
    }

    /**
     * 3단계: 최종 구매 링크 변환 (병렬 처리)
     * @param products 상세 페이지 크롤링이 완료된 상품 리스트
     */
    private void convertShopLinksInParallel(List<ProductDTO> products) {
        log.info("========== 3단계: 최종 URL 변환 시작 ==========");

        // URL 변환 성공/실패 카운터
        AtomicInteger totalUrls = new AtomicInteger(0);
        AtomicInteger successUrls = new AtomicInteger(0);
        AtomicInteger failUrls = new AtomicInteger(0);

        // 병렬 처리를 위한 ExecutorService (최대 10개 스레드)
        ExecutorService executor = Executors.newFixedThreadPool(10);
        List<Future<?>> futures = new ArrayList<>();

        // 각 상품의 가격 정보에 있는 URL 변환
        for (int i = 0; i < products.size(); i++) {
            final int index = i;
            final ProductDTO product = products.get(i);

            // 가격 정보가 없으면 스킵
            if (product.getPrices() == null || product.getPrices().isEmpty()) {
                continue;
            }

            Future<?> future = executor.submit(() -> {
                WebDriver urlDriver = null;
                try {
                    // WebDriver 풀에서 대여
                    urlDriver = driverPool.borrowDriver();

                    int urlCount = 0;
                    // 각 가격 정보의 shopLink 변환
                    for (PriceDTO price : product.getPrices()) {
                        if (price.getShopLink() != null && !price.getShopLink().isEmpty()) {
                            totalUrls.incrementAndGet();
                            try {
                                String finalUrl = finalUrlResolver.resolve(price.getShopLink(), urlDriver);
                                price.setShopLink(finalUrl);
                                successUrls.incrementAndGet();
                                urlCount++;
                            } catch (Exception e) {
                                log.warn("상품 '{}', 쇼핑몰 '{}' URL 변환 실패: {}",
                                        product.getProductName(), price.getShopName(), e.getMessage());
                                failUrls.incrementAndGet();
                            }
                        }
                    }

                    log.info("[{}/{}] URL 변환 완료: {} ({}개 링크)",
                            index + 1, products.size(), product.getProductName(), urlCount);

                } catch (InterruptedException e) {
                    log.warn("상품 '{}' URL 변환 인터럽트", product.getProductName());
                    Thread.currentThread().interrupt();
                } catch (Exception e) {
                    log.error("상품 '{}' URL 변환 중 오류: {}",
                            product.getProductName(), e.getMessage());
                } finally {
                    // WebDriver 반납
                    if (urlDriver != null) {
                        driverPool.returnDriver(urlDriver);
                    }
                }
            });

            futures.add(future);
        }

        // 모든 작업 완료 대기
        for (Future<?> future : futures) {
            try {
                future.get();
            } catch (Exception e) {
                log.error("URL 변환 작업 대기 중 오류: {}", e.getMessage());
            }
        }

        // ExecutorService 종료
        executor.shutdown();
        try {
            if (!executor.awaitTermination(10, TimeUnit.MINUTES)) {
                executor.shutdownNow();
            }
        } catch (InterruptedException e) {
            executor.shutdownNow();
            Thread.currentThread().interrupt();
        }

        log.info("========== URL 변환 완료 - 전체: {}개, 성공: {}개, 실패: {}개 ==========",
                totalUrls.get(), successUrls.get(), failUrls.get());
    }

    /**
     * 페이지 로딩 완료 대기
     * @param driver WebDriver
     */
    private void waitForPageLoad(WebDriver driver) {
        try {
            WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
            wait.until(webDriver ->
                ((JavascriptExecutor) webDriver)
                    .executeScript("return document.readyState")
                    .equals("complete")
            );

            // 추가 대기 (동적 콘텐츠 로딩)
            Thread.sleep(500);

        } catch (Exception e) {
            log.warn("페이지 로딩 대기 중 오류: {}", e.getMessage());
        }
    }
}