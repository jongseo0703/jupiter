package com.example.crawlingservice.util;

import lombok.extern.slf4j.Slf4j;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.TimeoutException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.springframework.stereotype.Component;

import java.time.Duration;

@Component
@Slf4j
public class WaitUtils {
    /**
     * 페이지가 완전이 로드될 때까지 대기하는 메서드
     * @param driver 현재 사용하고 있는 드라이버
     * @param timeoutSeconds 최대 대기 사간
     * @return 로딩 성공 여부<br> 성공 =true 실패 = false
     */
    public static boolean waitForPageLoad(WebDriver driver, int timeoutSeconds){
        try {
            //Selenium에서 제공하는 명시적 대기 클래스
            WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(timeoutSeconds));
            //완전히 로딩될 때가지 대기
            wait.until(webDriver->{
                //JavaScript로 driver 실행
                String readyState = ((JavascriptExecutor) webDriver)
                //document.readyState가 'complete'가 될 때까지
                        .executeScript("return document.readyState").toString();
                //성공 시 통과
                return "complete".equals(readyState);
            });

            // jQuery가 있는 경우 jQuery도 완료될 때까지 대기
            wait.until(webDriver -> {
                Boolean jqueryDefined = (Boolean) ((JavascriptExecutor) webDriver)
                        .executeScript("return typeof jQuery !== 'undefined'");
                if (jqueryDefined) {
                    //현재 실행 중인 Ajax 요청 수가 0일 때 통과
                    return (Boolean) ((JavascriptExecutor) webDriver)
                            .executeScript("return jQuery.active === 0");
                }
                // jQuery가 없으면 통과
                return true;
            });
            return true;
        } catch (TimeoutException e) {
            log.debug("페이지 로딩 시간 초과 {}초",timeoutSeconds);
            return false;
        }catch (Exception e){
            log.error("페이지 로딩 실패 : {}",e.getMessage());
            return false;
        }
    }

    /**
     * URL 변경 후 안전화될 때까지 대기하는 메서드
     * @param driver 사용중인 Chrom Driver
     * @param url 변경 할 URL
     * @param maxWaitSeconds 최대 대기 시간
     * @return 최종적으로 변경된 URL
     */
    public static String waitForUrlStabilization(WebDriver driver, String url, int maxWaitSeconds){
        String currentUrl = url;
        //최종적으로 반환할 URL 초기화
        String finalUrl = null;
        //URL이 안전적으로 유지한 횟수 변수 초기화
        int stableCount = 0;
        //최종적으로 3번 연속 유지하면 안전화로 판단
        final int STABLE_THRESHOLD = 3;
        try {
            //최대시간 동안 반복하되 URL이 연속으로 유지될 시 안전화로 판단
            for (int i = 0; i < maxWaitSeconds && stableCount < STABLE_THRESHOLD; i++) {
                Thread.sleep(1000); // 1초 대기

                //1초마다 반환 할 URL과 현재 URL를 일치여부 확인
                finalUrl = currentUrl;
                currentUrl = driver.getCurrentUrl();
                if (currentUrl.equals(finalUrl)) {
                    // 같은 URL이면 카운트 증가
                    stableCount++;
                } else {
                    // URL이 변경되면 카운트 리셋
                    stableCount = 0;
                }
            }
            //반복문 이후 임계치 도달 확인
            if (stableCount >= STABLE_THRESHOLD) {
                log.debug("URL 안정화 완료: {}", currentUrl);
            } else {
                log.warn("URL 안정화 시간 초과. 마지막 URL 사용: {}", currentUrl);
            }

        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            log.warn("URL 안정화 대기 중 인터럽트 발생");
        } catch (Exception e) {
            log.error("URL 안정화 대기 중 오류: {}", e.getMessage());
        }
        //최종 URL 반환
        return finalUrl;
    }

}
