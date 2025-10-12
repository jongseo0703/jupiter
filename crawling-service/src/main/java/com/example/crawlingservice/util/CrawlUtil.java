package com.example.crawlingservice.util;

import lombok.extern.slf4j.Slf4j;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
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
        //최대 횟 수
        int maxNoChangeAttempts = 3;
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(2));

        log.info("무한 스크롤 시작 (선택자: {})", itemSelector);

        while (true) {
            // 현재 스크롤 높이 저장
            Long currentHeight = (Long) js.executeScript("return document.body.scrollHeight");

            // 모든 상품 요소 찾기
            List<WebElement> currentProducts = driver.findElements(By.cssSelector(itemSelector));
            int currentProductCount = currentProducts.size();

            // 상품 개수가 변하지 않으면 카운트 증가
            if (currentProductCount == previousProductCount) {
                //변화 없을 시 증가
                noChangeCount++;
                //최대 횟수 확인
                if (noChangeCount >= maxNoChangeAttempts) {
                    log.info("더 이상 새 상품이 로딩되지 않음. 스크롤 종료 (총 {}개)", currentProductCount);
                    break;
                }
            } else {
                noChangeCount = 0;
            }

            previousProductCount = currentProductCount;

            // 상품 목록의 마지막 요소로 스크롤 (무한 스크롤 트리거)
            if (!currentProducts.isEmpty()) {
                WebElement lastProduct = currentProducts.get(currentProducts.size() - 1);
                js.executeScript("arguments[0].scrollIntoView({block: 'center'});", lastProduct);
            } else {
                // 상품이 없으면 페이지 끝으로 스크롤
                js.executeScript("window.scrollTo(0, document.body.scrollHeight);");
            }

            try {
                // 스크롤 높이가 증가하거나 상품 개수가 증가할 때까지 대기
                wait.until(driver1 -> {
                    Long newHeight = (Long) js.executeScript("return document.body.scrollHeight");
                    int newCount = driver1.findElements(By.cssSelector(itemSelector)).size();
                    return newHeight > currentHeight || newCount > currentProductCount;
                });
            } catch (Exception e) {
                // 타임아웃 시 무시하고 계속
            }

            // 추가 안정화 대기
            try {
                Thread.sleep(100);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }

        log.info("스크롤 완료: {}개 상품", previousProductCount);
    }
}
