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
}
