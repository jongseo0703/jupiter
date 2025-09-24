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
import org.openqa.selenium.support.ui.WebDriverWait;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

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

    /**
     * 자동으로 목록페이지를 다음페이지로 전환해주는 서비스
     * @param url 상품품목록 링크
     * @return 전체 상품 목록 반환
     */
    public List<ProductDTO> starePage(String url)throws ShowPageException {
        //전체 페이지에 있는 상품들을 저장한 리스트
        List<ProductDTO> allProducts = new ArrayList<>();
        try {
            System.setProperty("webdriver.chrome.driver", WEB_DRIVER_PATH);
            driver = new ChromeDriver();
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

                    //자동으로 상세페이지 들어가기
                    for (ProductDTO p : pageItems) {
                        processDetailPage(p,originalTab);
                        allProducts.add(p);
                    }

                    //최종 상품리스트에 담기
                    log.info("현재 페이지에서 {}개 상품 수집, 총 {}개", pageItems.size(), allProducts.size());

                    //다음 페이지로 넘어가는 ui가져오기
//                    List<WebElement> nextButtons = driver.findElements(By.cssSelector("div.num_nav_wrap a.num.now_on + a.num, div.num_nav_wrap a.edge_nav.nav_next, div.num_nav_wrap a.nav_next"));
                    List<WebElement> nextButtons = new ArrayList<>(); // 테스트용
                    if (nextButtons.isEmpty()) {
                        // 다음 페이지 버튼이 없으면 마지막 페이지
                        log.info("마지막 페이지 도달");
                        break;
                    }

                    //다음페이지로 넘가기기 클릭
                    WebElement next = nextButtons.get(0);
                    ((JavascriptExecutor) driver).executeScript("arguments[0].click();", next);
                    Thread.sleep(3000);
                } catch (InterruptedException e){
                    Thread.currentThread().interrupt();
                    if(driver != null){
                        throw new RuntimeException("스레드 정지");
                    }
                }

            }

        } catch (Exception e) {
            throw new ShowPageException(e.getMessage());
        }finally {
            if(driver!=null){
                //드라이버 닫기
                driver.quit();
            }
        }
        log.debug("가져온 상품 수 {}",allProducts.size());
        return allProducts;
    }

    public void processDetailPage(ProductDTO productDTO,String originalTab){
        String detailHandle = null;

        try {
            // 현재 열려있는 모든 탭 수 확인 (새 탭 생성 전 상태)
            int initialTabCount = driver.getWindowHandles().size();

            // JavaScript를 사용하여 새 탭에서 상세 페이지 열기
            ((JavascriptExecutor) driver).executeScript(
                    "window.open(arguments[0], '_blank');", productDTO.getDetailLink()
            );

            // 새 탭이 생성될 때까지 대기 (최대 10초)
            new WebDriverWait(driver, Duration.ofSeconds(10))
                    .until(d -> d.getWindowHandles().size() > initialTabCount);

            // 새로 생성된 탭의 핸들 찾기
            detailHandle = findNewTabHandle(originalTab);

            if (detailHandle == null) {
                log.warn("새 탭을 찾을 수 없습니다: {}", productDTO.getProductName());
                return;
            }

            // 상세 페이지 탭으로 전환
            driver.switchTo().window(detailHandle);

            //상세 정보 크롤링
            ProductDTO detailedProduct = detailPageService.detailPage(productDTO, driver);

            // 크롤링한 상세 정보를 원본 ProductDTO에 병합
            mergeProductDetails(productDTO, detailedProduct);

        } catch (Exception e) {
            log.error("상품 '{}' 상세 정보 처리 실패: {}", productDTO.getProductName(), e.getMessage());
        } finally {
            //상세페이지 탭 닫기
            cleanupDetailTab(detailHandle, originalTab);
        }
    }

    /**
     * 새로 생성된 탭의 핸들을 찾는 메서드
     * 기존 탭과 구분하여 새 탭만 식별합니다.
     * @param originalTab 기존 목록 페이지 탭 핸들
     * @return 새 탭 핸들
     */
    private String findNewTabHandle(String originalTab) {
        // 현재 열려있는 모든 탭 핸들 가져오기
        Set<String> allHandles = driver.getWindowHandles();

        //기존 탭이 아닌 새 탭 찾기
        return allHandles.stream()
                .filter(handle -> !handle.equals(originalTab)) // 원본 탭 제외
                // 첫 번째 매치 결과 반환
                .findFirst()
                // 찾지 못하면 null 반환
                .orElse(null);
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

    /**
     * 상세 페이지 탭을 안전하게 정리하는 메서드
     * 목록페이지 탭으로 안전하게 복귀합니다.
     * @param detailHandle 정리할 상세 페이지 탭 핸들
     * @param originalTab 목록페이지 탭 핸들
     */
    private void cleanupDetailTab(String detailHandle, String originalTab) {
        try {
            // 상세 페이지 탭이 존재하는 경우에만 정리
            if (detailHandle != null) {
                // 현재 열려있는 탭들 확인
                Set<String> currentHandles = driver.getWindowHandles();

                // 해당 핸들이 실제로 존재하는지 확인 후 정리
                if (currentHandles.contains(detailHandle)) {
                    driver.switchTo().window(detailHandle);
                    // 현재 탭만 닫기 (driver.quit()와 구분)
                    driver.close();
                }
            }

            // 원본 목록 페이지 탭으로 안전하게 복귀
            Set<String> remainingHandles = driver.getWindowHandles();
            if (remainingHandles.contains(originalTab)) {
                driver.switchTo().window(originalTab);
            } else if (!remainingHandles.isEmpty()) {
                // 원본 탭이 없는 경우 남은 탭 중 첫 번째로 이동
                driver.switchTo().window(remainingHandles.iterator().next());
            }

        } catch (Exception e) {
            log.error("탭 정리 중 오류 발생: {}", e.getMessage());
            // 오류 발생 시에도 최소한 원본 탭으로 복귀 시도
            try {
                if (driver.getWindowHandles().contains(originalTab)) {
                    driver.switchTo().window(originalTab);
                }
            } catch (Exception ex) {
                log.error("원본 탭 복귀 실패: {}", ex.getMessage());
            }
        }
    }

}
