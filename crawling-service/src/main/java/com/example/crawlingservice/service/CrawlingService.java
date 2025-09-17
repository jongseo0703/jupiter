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
                        // 새로운 탭 열기
                        ((JavascriptExecutor) driver).executeScript(
                                "window.open(arguments[0], '_blank');", p.getDetailLink()
                        );

                        //새 탭이 열릴 때까지 대기 (핸들 수가 2개 이상이 될 때)
                        new WebDriverWait(driver, Duration.ofSeconds(10))
                                .until(d -> d.getWindowHandles().size() > 1);

                        //새로 열린 상세 탭으로 전환
                        String detailHandle = driver.getWindowHandles().stream()
                                .filter(h -> !h.equals(originalTab))
                                .findFirst().orElseThrow();
                        driver.switchTo().window(detailHandle);

                        // 상세 크롤링 (동일 드라이버 사용)
                        ProductDTO product = detailPageService.detailPage(p, driver);

                        // 상세페이지 탭만 닫고
                        driver.close();

                        //원래 '목록' 탭으로 복귀
                        driver.switchTo().window(originalTab);

                        // 결과 파싱
                        p.setCategory(product.getCategory()); // 주종
                        p.setProductKind(product.getProductKind()); // 종류
                        p.setContent(product.getContent()); //상품정보
                        p.setPrices(product.getPrices()); // 상품 가격리스트
                        p.setReviews(product.getReviews()); // 상품 리뷰 리스트
                        allProducts.add(p);
                    }

                    //최종 상품리스트에 담기
                    log.info("현재 페이지에서 {}개 상품 수집, 총 {}개", pageItems.size(), allProducts.size());

                    //다음 페이지로 넘어가는 ui가져오기
                    List<WebElement> nextButtons = driver.findElements(By.cssSelector("div.num_nav_wrap a.num.now_on + a.num, div.num_nav_wrap a.edge_nav.nav_next, div.num_nav_wrap a.nav_next"));
//                    List<WebElement> nextButtons = driver.findElements(By.cssSelector("div.num_nav_wrap a.num.now_on + a.num")); // 테스트용
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
}
