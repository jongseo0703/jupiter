package com.example.crawlingservice.util;
import lombok.extern.slf4j.Slf4j;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.HashSet;
import java.util.Set;

@Component
@Slf4j
public class FinalUrlResolver {
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
            driver.manage().timeouts().pageLoadTimeout(Duration.ofSeconds(10));
            driver.manage().timeouts().scriptTimeout(Duration.ofSeconds(5));

            // 실제 URL 추출
            finalUrl = extractFinalUrl(driver, url);

        } catch (Exception e) {
            log.error("URL 추출 중 오류: {}", e.getMessage());
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
            ((JavascriptExecutor) driver).executeScript("window.open('', '_blank');");
            Thread.sleep(300);

            Set<String> currentTabs = driver.getWindowHandles();
            return currentTabs.stream()
                    .filter(handle -> !initialTabs.contains(handle))
                    .findFirst()
                    .orElse(null);

        } catch (Exception e) {
            log.error("탭 생성 실패: {}", e.getMessage());
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

            // 다나와 로딩 페이지인지 확인하고 JavaScript에서 최종 URL 추출
            String danawaFinalUrl = extractDanawaRedirectUrl(driver);
            if (danawaFinalUrl != null) {
                log.debug("다나와 리디렉션 URL 추출: {}", danawaFinalUrl);
                return danawaFinalUrl;
            }

            // 일반 페이지: 짧은 대기 후 리디렉션 확인
            Thread.sleep(1500);
            String currentUrl = getSafeCurrentUrl(driver, url);

            // URL이 변경되지 않았으면 바로 반환
            if (currentUrl.equals(url)) {
                return currentUrl;
            }

            // URL이 변경되었으면 추가 대기 후 최종 확인
            Thread.sleep(1000);
            return getSafeCurrentUrl(driver, currentUrl);

        } catch (Exception e) {
            log.debug("URL 추출 중 오류: {}", e.getMessage());
            return getSafeCurrentUrl(driver, url);
        }
    }

    /**
     * 다나와 로딩 페이지에서 최종 리디렉션 URL을 추출하는 메서드
     * @param driver 사용중인 드라이버
     * @return 최종 URL 또는 null (다나와 로딩 페이지가 아닌 경우)
     */
    private String extractDanawaRedirectUrl(WebDriver driver) {
        try {
            // 다나와 로딩 페이지 확인 (loadingBridge)
            String currentUrl = driver.getCurrentUrl();
            if (!currentUrl.contains("danawa.com") || !currentUrl.contains("loadingBridge")) {
                return null;
            }

            // JavaScript에서 goLink 함수의 URL 추출
            Object result = ((JavascriptExecutor) driver).executeScript(
                    "var scriptTags = document.getElementsByTagName('script');" +
                            "for (var i = 0; i < scriptTags.length; i++) {" +
                            "    var scriptContent = scriptTags[i].textContent;" +
                            "    var match = scriptContent.match(/goLink\\([\"'](https?:\\/\\/[^\"']+)[\"']\\)/);" +
                            "    if (match && match[1]) {" +
                            "        return match[1];" +
                            "    }" +
                            "}" +
                            "return null;"
            );

            if (result instanceof String) {
                String extractedUrl = (String) result;
                if (!extractedUrl.isEmpty() && extractedUrl.startsWith("http")) {
                    return extractedUrl;
                }
            }

            return null;

        } catch (Exception e) {
            log.debug("다나와 URL 추출 실패: {}", e.getMessage());
            return null;
        }
    }

    /**
     * 모든 생성된 리소스를 완전히 정리하는 메서드
     */
    private void performCompleteCleanup(WebDriver driver, String newTab, String originalTab, Set<String> initialTabs) {
        try {
            //새 탭 정리
            if (newTab != null && driver.getWindowHandles().contains(newTab)) {
                driver.switchTo().window(newTab);
                driver.close();
            }

            //원본 탭 제외한 모든 탭 닫기
            cleanupLeakedTabs(driver, initialTabs, originalTab);

            //원본 탭으로 복귀
            if (driver.getWindowHandles().contains(originalTab)) {
                driver.switchTo().window(originalTab);
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
     * 누수된 탭들을 정리하는 메서드
     */
    private void cleanupLeakedTabs(WebDriver driver, Set<String> initialTabs, String originalTab) {
        try {
            //현재 탭목록
            Set<String> currentTabs = driver.getWindowHandles();
            //비교를 위해 현재 탭목록 복사
            Set<String> leakedTabs = new HashSet<>(currentTabs);
            //현재 탭목록에서 초기(목록페이지, 상세페이지)탭들 삭제
            leakedTabs.removeAll(initialTabs);

            //원본 탭을 제외한 모든 탭 닫기
            for (String leakedTab : leakedTabs) {
                if (!leakedTab.equals(originalTab) && currentTabs.contains(leakedTab)) {
                    driver.switchTo().window(leakedTab);
                    driver.close();
                }
            }
        } catch (Exception e) {
            log.error("탭 정리 중 오류: {}", e.getMessage());
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
