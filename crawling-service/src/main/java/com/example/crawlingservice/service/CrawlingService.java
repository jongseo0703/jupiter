package com.example.crawlingservice.service;

import com.example.crawlingservice.dto.ProductDTO;
import com.example.crawlingservice.exception.ShowPageException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.stream.Collectors;

/**
 * 크롤링 할 웹사이트를 자동으로 페이지 넘겨주는 서비스
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class CrawlingService {
    private final ListPageService listPageService;
    private final DetailPageService detailPageService;

    //ChromDriver.exe 위치
    @Value("${chrom.driver.path}")
    private String WEB_DRIVER_PATH;
    //웹브라우저를 프로그래밍적으로 제어하는 인터페이스
    private WebDriver driver;

    // 멀티스레딩을 위한 스레드풀 (6개 스레드로 속도와 안정성 최적화)
    private ThreadPoolExecutor executor;

    /**
     * 스레드풀을 초기화하는 메서드
     * 6개의 스레드를 생성하여 사이트 로딩 속도를 고려한 최적의 병렬 처리
     */
    private void initializeThreadPool() {
        if (executor == null || executor.isShutdown()) {
            //초기 스레드 수(6개), 최대 스레드 수(6개) 대기시간(0초), 시간단위 설정
            executor = new ThreadPoolExecutor(6, 6, 0L, TimeUnit.MILLISECONDS,
                //FIFO 구조의 큐 (큐가 비어있을 때는 대기)
                new LinkedBlockingQueue<>()
            );
        }
    }

    /**
     * 최적화된 Chrome 옵션을 생성하는 메서드
     * 대부분의 브라우저 창의 기능 비활성화
     */
    private ChromeOptions createOptimizedChromeOptions() {
        ChromeOptions options = new ChromeOptions();

        // 헤드리스 모드 (브라우저 창 없이 실행) -->속도를 위해
        options.addArguments("--headless");

        // 페이지 로딩 전략: 페이지 로딩 완료를 기다리지 않음 (필요한 요소만 명시적 대기)
        options.setPageLoadStrategy(org.openqa.selenium.PageLoadStrategy.NONE);

        // 성능 최적화 옵션들
        //보안 프로세스 비활성화
        options.addArguments("--no-sandbox");// 샌드박스 비활성화
        options.addArguments("--allow-running-insecure-content"); // Mixed Content 허용
        options.addArguments("--ignore-certificate-errors"); // SSL 인증서 오류 무시

        //불필요한 그래픽 렌더링 제거
        options.addArguments("--disable-gpu");// GPU 가속 비활성화
        options.addArguments("--disable-images");// 이미지 로딩 안함 (더 빠름)
        options.addArguments("--disable-features=VizDisplayCompositor"); // 렌더링 최적화

        //불필요한 브라우저 기능 제거
        options.addArguments("--disable-extensions"); // 확장프로그램 비활성화
        options.addArguments("--disable-plugins");// 플러그인 비활성화
        options.addArguments("--disable-translate");// 번역 기능 비활성화

        // options.addArguments("--disable-javascript");            // JS 비활성화 - 다나와 사이트는 JS 필요하므로 제거
        options.addArguments("--disable-popup-blocking");        // 팝업 차단 비활성화
        options.addArguments("--disable-background-timer-throttling"); // 백그라운드 타이머 제한 해제

        // 메모리 최적화
        options.addArguments("--disable-dev-shm-usage");// /dev/shm 사용 안함
        options.addArguments("--memory-pressure-off");// 메모리 압박 모드 해제
        options.addArguments("--max_old_space_size=4096");// 최대 메모리 4GB

        //불필요한 네트와크 요청 차단
        options.addArguments("--aggressive-cache-discard");// 캐시 적극 정리
        options.addArguments("--disable-background-networking"); // 백그라운드 네트워킹 비활성화

        return options;
    }

    /**
     * 스레드풀을 안전하게 종료하는 메서드
     */
    private void shutdownThreadPool() {
        if (executor != null && !executor.isShutdown()) {
            executor.shutdown();
            try {
                // 30초 동안 작업 완료 대기(데이터 손실 방지)
                if (!executor.awaitTermination(30, TimeUnit.SECONDS)) {
                    // 강제 종료
                    executor.shutdownNow();
                }
            } catch (InterruptedException e) {
                executor.shutdownNow();
                Thread.currentThread().interrupt();
            }
            log.info("스레드풀 종료 완료");
        }
    }

    /**
     * 자동으로 목록페이지를 다음페이지로 전환해주는 서비스
     * @param url 상품품목록 링크
     * @return 전체 상품 목록 반환
     */
    public List<ProductDTO> starePage(String url)throws ShowPageException {
        //전체 페이지에 있는 상품들을 저장한 리스트
        List<ProductDTO> allProducts = new ArrayList<>();
        try {
            // 스레드풀 초기화 (병렬 처리를 위해)
            initializeThreadPool();

            System.setProperty("webdriver.chrome.driver", WEB_DRIVER_PATH);
            driver = new ChromeDriver(createOptimizedChromeOptions());

            // 페이지 로딩 타임아웃 설정 (메인 driver는 더 여유있게)
            driver.manage().timeouts().pageLoadTimeout(Duration.ofSeconds(90));
            driver.manage().timeouts().implicitlyWait(Duration.ofSeconds(15));
            driver.manage().timeouts().scriptTimeout(Duration.ofSeconds(30));

            driver.get(url);


            while (true) {
                try {
                    //상품목록 html
                    if(driver == null){
                        return null;
                    }
                    String html = driver.getPageSource();
                    //현재 탭(상품 목록 페이지)의 핸들(고유 ID)을 저장
                    String originalTab = driver.getWindowHandle();
                    //각 페이지의 전체 상품을 담은 리스트 가져오기 가져오기
                    List<ProductDTO> pageItems = listPageService.crawler(html);

                    // 병렬 처리 (FinalUrlResolver 제거로 안정성 확보)
                    List<CompletableFuture<ProductDTO>> futures = pageItems.stream()
                            .map(product -> CompletableFuture.supplyAsync(
                                    () -> processDetailPageParallel(product), executor))
                            .toList();

                    // 모든 병렬 작업 완료까지 대기 및 결과 수집
                    List<ProductDTO> processedProducts = futures.stream()
                            .map(CompletableFuture::join)
                            .toList();

                    // 병렬 처리된 상품들을 최종 리스트에 추가
                    allProducts.addAll(processedProducts);

                    //최종 상품리스트에 담기
                    log.info("현재 페이지에서 {}개 상품 수집, 총 {}개", pageItems.size(), allProducts.size());

                    //다음 페이지로 넘어가는 ui가져오기
                    List<WebElement> nextButtons = driver.findElements(By.cssSelector("div.num_nav_wrap a.num.now_on + a.num, div.num_nav_wrap a.edge_nav.nav_next, div.num_nav_wrap a.nav_next"));
                    if (nextButtons.isEmpty()) {
                        // 다음 페이지 버튼이 없으면 마지막 페이지
                        log.info("마지막 페이지 도달");
                        break;
                    }

                    //다음페이지로 넘가기기 클릭
                    WebElement next = nextButtons.get(0);
                    ((JavascriptExecutor) driver).executeScript("arguments[0].click();", next);

                    //동적 대기로 교체 - 새 페이지의 상품 목록이 로드될 때까지 대기
                    WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
                    wait.until(ExpectedConditions.presenceOfElementLocated(
                        By.cssSelector("li.prod_item.prod_layer > div.prod_main_info, div.prod_main_info")));
                } catch (Exception e){
                    log.error("페이지 크롤링 중 오류 발생: {}", e.getMessage(), e);
                    // 오류가 발생해도 수집한 데이터는 반환하도록 break
                    break;
                }

            }

        } catch (Exception e) {
            throw new ShowPageException(e.getMessage());
        }finally {
            if(driver!=null){
                //드라이버 닫기
                driver.quit();
            }
            // 스레드풀 안전하게 종료
            shutdownThreadPool();
        }
        log.debug("가져온 상품 수 {}",allProducts.size());
        return allProducts;
    }

    /**
     * 병렬 처리를 위한 독립적인 상세페이지 처리 메서드
     * 각 스레드가 독립적인 WebDriver를 사용하여 동시에 여러 상품을 처리합니다.
     * @param productDTO 처리할 상품 정보
     * @return 상세정보가 추가된 상품 정보
     */
    private ProductDTO processDetailPageParallel(ProductDTO productDTO) {
        WebDriver parallelDriver = null;
        try {
            // 각 스레드마다 독립적인 최적화된 WebDriver 생성
            System.setProperty("webdriver.chrome.driver", WEB_DRIVER_PATH);
            parallelDriver = new ChromeDriver(createOptimizedChromeOptions());

            // 병렬 처리용 타임아웃 설정
            parallelDriver.manage().timeouts().pageLoadTimeout(Duration.ofSeconds(30));
            parallelDriver.manage().timeouts().implicitlyWait(Duration.ofSeconds(5));
            parallelDriver.manage().timeouts().scriptTimeout(Duration.ofSeconds(15));

            // 상세 페이지로 직접 이동 (탭 생성/전환 오버헤드 제거)
            parallelDriver.get(productDTO.getDetailLink());

            // 상세 정보 크롤링
            ProductDTO detailedProduct = detailPageService.detailPage(productDTO, parallelDriver);

            // 크롤링한 상세 정보를 원본 ProductDTO에 병합
            mergeProductDetails(productDTO, detailedProduct);

            return productDTO;

        } catch (Exception e) {
            log.warn("상품 '{}' 크롤링 실패: {}", productDTO.getProductName(), e.getMessage());
            // 실패해도 기본 정보는 반환
            return productDTO;
        } finally {
            // 독립적인 WebDriver 정리
            if (parallelDriver != null) {
                try {
                    parallelDriver.quit();
                } catch (Exception e) {
                    // quit 실패 무시
                }
            }
        }
    }


    /**
     * 상세 정보를 원본 ProductDTO에 병합하는 메서드
     * 각 필드별로 안전하게 데이터를 복사합니다.
     * @param target 기존 ProductDTO
     * @param detail 상세페이지의 ProductDTO
     */
    private void mergeProductDetails(ProductDTO target, ProductDTO detail) {
        // 주종
        if (detail.getCategory() != null) {
            target.setCategory(detail.getCategory());
        }
        // 종류
        if (detail.getProductKind() != null) {
            target.setProductKind(detail.getProductKind());
        }
        // 상품정보
        if (detail.getContent() != null) {
            target.setContent(detail.getContent());
        }
        // 상품 가격리스트
        if (detail.getPrices() != null) {
            target.setPrices(detail.getPrices());
        }
        // 상품 리뷰 리스트
        if (detail.getReviews() != null) {
            target.setReviews(detail.getReviews());
        }
    }

}
