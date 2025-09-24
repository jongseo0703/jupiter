package com.example.crawlingservice.util;

import lombok.extern.slf4j.Slf4j;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.TimeoutException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.HashSet;
import java.util.Set;

@Component
@Slf4j
public class FinalUrlResolver {
    // 초기 페이지 로딩 최대 대기시간
    private static final int INITIAL_PAGE_LOAD_TIMEOUT = 40;
    // URL 안정화 최대 대기시간
    private static final int URL_STABILIZATION_TIMEOUT = 20;
    // 리다이렉션 감지를 위한 추가 대기시간
    private static final int REDIRECTION_WAIT_TIME = 3;
    /**
     * 상세페이지에서 얻은 구매링크를 로딩페이지 없이 최종 구매사이트 링크를 추출하는 메서드
     * @param url 상세페이지에서 가져온 링크
     * @param driver 현재 사용하고 있는 크롬 드라이버
     * @return (String)최종 구매사이트 링크
     */
    public String resolve(String url, WebDriver driver) {
        //최종 URL 초기화
        String finalUrl = url;
        //제품 상세페이지로 돌아가기 위한 탭 저장
        String originalTab =  driver.getWindowHandle();
        //새로운 탭을 저장할 변수 초기화
        String newTab = null;
        // 처리 시작 전 기존 탭들
        Set<String> initialTabs = new HashSet<>(driver.getWindowHandles());

        try {

            // 새 탭 생성
            newTab = createIsolatedTab(driver, initialTabs);
            if (newTab == null) {
                return finalUrl;
            }

            // 생성된 탭으로 전환하여 URL 처리
            driver.switchTo().window(newTab);
            driver.manage().timeouts().pageLoadTimeout(Duration.ofSeconds(45));

            // 실제 URL 추출
            finalUrl = extractFinalUrl(driver, url);


        } catch (Exception e) {
            log.error("구매 사이트 URL 추출 중 오류: {}", e.getMessage());
            finalUrl = getSafeCurrentUrl(driver, url);
        } finally {
            // 반드시 완전한 정리 수행
            performCompleteCleanup(driver, newTab, originalTab, initialTabs);
        }

        //최종 URL 반환
        return  finalUrl;
    }

    /**
     * 새 탭을 생성하는 메서드
     * @param driver 사용중이 드라이버
     * @param initialTabs 초기 탭 목록
     * @return 새 탭 핸들
     */
    private String createIsolatedTab(WebDriver driver, Set<String> initialTabs) {
        try {
            // JavaScript로 빈 새 탭 생성
            ((JavascriptExecutor) driver).executeScript("window.open('', '_blank');");
            Thread.sleep(1000); // 탭 생성 대기

            // 새로 생성된 탭 찾기
            Set<String> currentTabs = driver.getWindowHandles();
            return currentTabs.stream()
                    .filter(handle -> !initialTabs.contains(handle))
                    .findFirst()
                    .orElse(null);

        } catch (Exception e) {
            log.error("격리된 탭 생성 실패: {}", e.getMessage());
            return null;
        }
    }

    /**
     * 실제 최종 URL을 추출하는 메서드
     * @param driver 사용중이 드라이버
     * @param url 처리할 URL
     * @return 최종 구매 링크
     */
    private String extractFinalUrl(WebDriver driver, String url) {
        try {
            // 페이지 로드
            driver.get(url);
            // 페이지 로딩 대기
            Thread.sleep(3000);

            // 리다이렉션 완료 대기
            String currentUrl = getSafeCurrentUrl(driver, url);
            // 추가 리다이렉션 대기
            Thread.sleep(2000);

            // 최종 URL 확인
            return getSafeCurrentUrl(driver, currentUrl);

        } catch (Exception e) {
            log.debug("URL 추출 중 오류: {}", e.getMessage());
            return getSafeCurrentUrl(driver, url);
        }
    }

    /**
     * 모든 생성된 리소스를 완전히 정리하는 메서드
     * @param driver 사용중이 드라이버
     * @param newTab 정리할 새 탭
     * @param originalTab 복귀할 원본 탭
     * @param initialTabs 초기 탭 목록
     */
    private void performCompleteCleanup(WebDriver driver, String newTab, String originalTab, Set<String> initialTabs) {
        try {
            // 새 탭 정리
            if (newTab != null && driver.getWindowHandles().contains(newTab)) {
                driver.switchTo().window(newTab);
                driver.close();
                log.debug("새 탭 정리 완료");
            }

            //원본 탭 제외한 모든 탭 닫기
            cleanupLeakedTabs(driver, initialTabs, originalTab);

            //원본 탭으로 복귀
            if (driver.getWindowHandles().contains(originalTab)) {
                driver.switchTo().window(originalTab);
                log.debug("원본 탭 복귀 완료");
            }

        } catch (Exception e) {
            log.error("정리 작업 중 오류: {}", e.getMessage());
            // 비상 복귀
            try {
                Set<String> remainingTabs = driver.getWindowHandles();
                if (remainingTabs.contains(originalTab)) {
                    //원본 탭이 있을 경우
                    driver.switchTo().window(originalTab);
                } else if (!remainingTabs.isEmpty()) {
                    //원본 탭을 못 찾을 경우 옆 다른 탭 선택
                    driver.switchTo().window(remainingTabs.iterator().next());
                }
            } catch (Exception ex) {
                log.error("비상 복귀 실패: {}", ex.getMessage());
            }
        }
    }

    /**
     * 탭들을 정리하는 메서드
     */
    private void cleanupLeakedTabs(WebDriver driver, Set<String> initialTabs, String originalTab) {
        try {
            //현재 탭목록
            Set<String> currentTabs = driver.getWindowHandles();
            //비교를 위해 현재 탭목록 복사
            Set<String> leakedTabs = new HashSet<>(currentTabs);
            //현재 탭목록에서 초기(목록페이지, 상세페이지)탭들 삭제
            leakedTabs.removeAll(initialTabs);

            //누수 탭 발견
            if (!leakedTabs.isEmpty()) {
                log.warn("탭 누수 감지: {}개", leakedTabs.size());
                for (String leakedTab : leakedTabs) {
                    //원본 탭을 제외한 모든 탭 닫기
                    if (!leakedTab.equals(originalTab) && currentTabs.contains(leakedTab)) {
                        driver.switchTo().window(leakedTab);
                        driver.close();
                    }
                }
            }
        } catch (Exception e) {
            log.error("누수 탭 정리 중 오류: {}", e.getMessage());
        }
    }

    /**
     * 안전하게 현재 URL을 가져오는 메서드
     * WebDriver 예외 발생 시 대체 URL 반환으로 안정성 보장
     * @param driver 현재 사용중인 Chrom Driver
     * @param fallbackUrl 실패 시 반환할 URL
     * @return 현재 URL 또는 대체 URL
     */
    private String getSafeCurrentUrl(WebDriver driver, String fallbackUrl) {
        try {
            //현재 URL 가져오기
            String currentUrl = driver.getCurrentUrl();
            // null 또는  빈 문자열 체크
            if (currentUrl == null || currentUrl.trim().isEmpty()) {
                return fallbackUrl;
            }
            return currentUrl;
        } catch (Exception ex) {
            return fallbackUrl;
        }
    }
}
