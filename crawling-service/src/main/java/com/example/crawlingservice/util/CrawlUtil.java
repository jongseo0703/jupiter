package com.example.crawlingservice.util;

import lombok.extern.slf4j.Slf4j;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.List;

/**
 * 크롤링 공통 유틸리티
 */
@Slf4j
@Component
public class CrawlUtil {

    /**
     * 무한 스크롤을 끝까지 내려서 모든 컨텐츠 로딩
     * @param driver WebDriver
     * @param itemSelector 상품 아이템 CSS 선택자
     */
    public void scrollToLoadAll(WebDriver driver, String itemSelector) {
        //스크롤를 실행
        JavascriptExecutor js = (JavascriptExecutor) driver;
        //이전 스크롤 시 확인한 상품 개수 초기화
        int previousProductCount = 0;
        //상품 개수 변경 없음에 대한 횟 수
        int noChangeCount = 0;
        //최대 3번 확인
        int maxNoChangeAttempts = 3;
        //동적 대기 설정 (최대 3초)
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(3));

        log.info("무한 스크롤 시작 (선택자: {})", itemSelector);

        while (true) {
            // 모든 상품 요소 찾기
            List<WebElement> currentProducts = driver.findElements(By.cssSelector(itemSelector));
            //상품 개수
            int currentProductCount = currentProducts.size();

            log.debug("현재 로딩된 상품 수: {}", currentProductCount);

            // 상품 개수가 변하지 않으면 카운트 증가
            if (currentProductCount == previousProductCount) {
                //변화 없을 시 증가
                noChangeCount++;
                //최대 횟수 확인
                if (noChangeCount >= maxNoChangeAttempts) {
                    log.info("더 이상 새 상품이 로딩되지 않음. 스크롤 종료");
                    break;
                }
            } else {
                // 변화가 있으면 리셋
                noChangeCount = 0;
            }

            //현재 상품 개수 저장
            previousProductCount = currentProductCount;

            // 페이지 끝까지 스크롤
            js.executeScript("window.scrollTo(0, document.body.scrollHeight);");

            try {
                // 상품 개수가 증가할 때까지 대기
                wait.until(driver1 -> {
                    int newCount = driver1.findElements(By.cssSelector(itemSelector)).size();
                    // 상품 개수가 증가하면 true
                    return newCount > currentProductCount;
                });
            } catch (Exception e) {
                log.debug("새 상품 로딩 대기 타임아웃 (상품 개수 변화 없음)");
            }
        }

        log.info("스크롤 완료. 총 {}개 상품 로딩됨", previousProductCount);
    }
}
