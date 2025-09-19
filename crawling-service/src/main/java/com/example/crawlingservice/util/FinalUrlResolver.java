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

        try {
            //현재 있는 모든 탭 저장
            Set<String>allTabs = driver.getWindowHandles();
            //탭들이 있는지 확인
            if(allTabs.isEmpty()){
                return finalUrl;
            }

            //새로운 탭 열고 잠시 대기
            ((JavascriptExecutor) driver).executeScript("window.open('', '_blank');");
            Thread.sleep(1000);

            //새로운 탭까지 포합한 모든 탭들 가져오기
            Set<String> afterAllTabs = driver.getWindowHandles();
            for (String handle : afterAllTabs) {
                //기존 탭들에서 다른 탭 찾아서 대입
                if (!allTabs.contains(handle)) {
                    newTab = handle;
                    break;
                }
            }

            //구매사이트 탭이 존재 여부 확인
            if (newTab == null) {
                log.warn("새 탭을 찾을 수 없습니다");
                return finalUrl;
            }

            //구매사이트 탭으로 이동
            driver.switchTo().window(newTab);
            //페이지 로딩 시간 제한(45초) 오버 시 에러
            driver.manage().timeouts().pageLoadTimeout(Duration.ofSeconds(45));
            //사이트에 팝업이 있을 경우 무시하고 경로 가져오기
            finalUrl = withOutPopup(driver, url);

        }catch (InterruptedException e){
            log.debug("링크 리졸빙 중 스레드 중단");
            Thread.currentThread().interrupt();
        }catch (TimeoutException e){
            log.debug("구매 링크 로딩 초과 대기 발생");
            try {
                //시간 초과 시 현재 URL 시도
                finalUrl= driver.getCurrentUrl();
            } catch (Exception ex) {
                log.debug("시간 초과로 URL 추출 실패 : {}", ex.getMessage());
            }

        }catch (WebDriverException e){
            log.debug("Chrom Driver 오류 발생 : {}",e.getMessage());
        }catch (Exception e) {
            log.debug("구매사이트를 찾을 수 없습니다");
        }finally {
            try {
                //구매사이트 탭 닫기
                closeNewTab(driver,newTab);
                //상세페이지로 돌아가기
                toDetailPage(originalTab,driver);
            } catch (Exception e) {
                log.error("탭 정리 중 오류 발생 {}",e.getMessage());
            }
        }

        //최종 URL 반환
        return  finalUrl;
    }

    /**
     * 더이상 사용하지 않는 구매사이트 탭 자동으로 닫기
     * @param driver 현재 사용하고 있는 크롬 드라이버
     * @param newTab 닫고 싶은 탭
     */
    public void closeNewTab(WebDriver driver, String newTab) {
        //닫고 싶은 탭의 존재 여부 확인
        if (newTab == null) return;

        try {
            // 현재 열린 탭들
            Set<String> openTabs = driver.getWindowHandles();

            // 닫고 싶은 탭 위치 찾기
            if (openTabs.contains(newTab)) {
                //확인 후 닫기
                driver.switchTo().window(newTab);
                driver.close();
            }
        } catch (Exception e) {
            log.warn("탭 닫기 중 오류: {}", e.getMessage());
        }
    }

    /**
     * 다시 상품 상세페이지로 돌아가는 메서드
     * @param originalTab 상세페이지 탭
     * @param driver 현재 사용하기 있는 드라이버
     */
    public void toDetailPage(String originalTab, WebDriver driver) {
        //상품 상세피이지의 존재 여부 확인
        if (originalTab == null) return;

        try {
            // 현재 열린 탭들 확인
            Set<String> openTabs = driver.getWindowHandles();

            //탭들 중에서 원하는 탭 찾기
            if (openTabs.contains(originalTab)) {
                //상세 페이지 탭으로 반환
                driver.switchTo().window(originalTab);
            }else {
                if (!openTabs.isEmpty()) {
                    driver.switchTo().window(openTabs.iterator().next());
                }
            }

        } catch (Exception e) {
            log.error("탭 전환 중 오류: {}", e.getMessage());
        }
    }

    /**
     * 팝업창 무시하고 링크 추출 후 반환<br>
     * "성인 인증", "로그인 필요" 등과 같은 모든 팝업창 무시
     * @param driver 현재 사용하고 있는 크롬 드라이버
     * @param url 들어간 페이지 URL
     * @return (String)최종 페이지 URL 반환
     */
    public String withOutPopup(WebDriver driver, String url) {
        String finalUrl = url;
        try {
            log.debug("WaitUtils를 사용한 페이지 로딩 시작: {}", url);

            // 페이지 로드
            driver.get(url);

            // 페이지가 완전히 로드되는지 확인
            boolean loadSuccess = WaitUtils.waitForPageLoad(driver, INITIAL_PAGE_LOAD_TIMEOUT);

            if (!loadSuccess) {
                log.warn("페이지 로딩 시간 초과, 현재 상태로 진행");
            } else {
                log.debug("페이지 로딩 완료 확인");
            }

            //초기 URL 추출
            String initialUrl = getSafeCurrentUrl(driver, url);

            try {
                //라디렉션 감지를 위한 대기
                Thread.sleep(REDIRECTION_WAIT_TIME * 1000);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                //현재 URL를 안전하게 추출
                return getSafeCurrentUrl(driver, url);
            }

            // 현재 URL를 안전하게 추출
            String currentUrl = getSafeCurrentUrl(driver, initialUrl);
            //최종 URL를 안전화가 된 후 추출
            finalUrl = WaitUtils.waitForUrlStabilization(driver, currentUrl, URL_STABILIZATION_TIMEOUT);

            // 안정화된 URL이 null인 경우 현재 URL 사용
            if (finalUrl == null) {
                finalUrl = getSafeCurrentUrl(driver, url);
                log.warn("URL 안정화 실패, 현재 URL 사용: {}", finalUrl);
            }

            // 페이지를 안전하게 이동하기 위해 10초 대기
            WaitUtils.waitAfterNavigation(driver, 10);

            // 최종 URL 한 번 더 확인
            String verifiedUrl = getSafeCurrentUrl(driver, finalUrl);
            if (!verifiedUrl.equals(finalUrl)) {
                finalUrl = verifiedUrl;
            }

            log.debug("최종 완료 URL: {}", finalUrl);

        } catch (TimeoutException e) {
            log.debug("페이지 로딩 시간초과 발생 - 현재 URL로 대체");
            finalUrl = getSafeCurrentUrl(driver, url);
        } catch (WebDriverException e) {
            log.debug("WebDriver 예외 발생: {}", e.getMessage());
            finalUrl = getSafeCurrentUrl(driver, url);
        } catch (Exception e) {
            log.error("예기치 못한 오류 발생: {}", e.getMessage());
            finalUrl = getSafeCurrentUrl(driver, url);
        }

        return finalUrl;
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
                log.debug("현재 URL이 null 또는 빈 문자열, 대체 URL 사용");
                return fallbackUrl;
            }
            return currentUrl;
        } catch (Exception ex) {
            log.debug("현재 URL 획득 실패, 대체 URL 사용: {}", ex.getMessage());
            return fallbackUrl;
        }
    }
}
