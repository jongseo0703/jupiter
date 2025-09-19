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
            //페이지 로딩 시간 제한(10초) 오버 시 에러
            driver.manage().timeouts().pageLoadTimeout(Duration.ofSeconds(25));
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
            //구매상세 페이지 로드하고 잠시 대기
            driver.get(url);
            WebDriverWait wait1 = new WebDriverWait(driver, Duration.ofSeconds(25));
            wait1.until(d -> "complete".equals(
                    ((JavascriptExecutor) d).executeScript("return document.readyState")));

            //현재 페이지 상태 확인
            String currentUrl = driver.getCurrentUrl();

            //리다이렉션이 있을 수 있으므로 짧은 시간 더 대기
            WebDriverWait wait2 = new WebDriverWait(driver, Duration.ofSeconds(12));

            // URL 변경 감지 (리다이렉션 처리)
            wait2.until(ExpectedConditions.not(ExpectedConditions.urlToBe(currentUrl)));
            finalUrl = driver.getCurrentUrl();

            // URL 안정화 확인(3번) (추가 리다이렉션 대기)
            for (int i = 0; i < 6; i++) {
                Thread.sleep(1000);
                String newUrl = driver.getCurrentUrl();
                if (finalUrl != null&&!finalUrl.equals(newUrl)) {
                    //URL 변경이 있을 경우 잠시 대기
                    finalUrl = newUrl;
                } else {
                    break; // URL이 안정화됨
                }
            }
        }catch (InterruptedException e){
            log.debug("팝업 무시 중 스레드 중단");
            Thread.currentThread().interrupt();
            try {
                finalUrl=driver.getCurrentUrl();
            } catch (Exception ex) {
                log.debug("중단 후 URL 추출 실패");
                finalUrl=url;
            }
        }catch (TimeoutException e){
            log.debug("페이지 로딩 시간초과로 스레드 중단");
            try {
                finalUrl = driver.getCurrentUrl();
            } catch (Exception ex) {
                log.debug("시간 초과 후 URL 확득 실패");
                finalUrl=url;
            }
        }catch (WebDriverException e){
            log.debug("WebDriver 예외 발색 {}",e.getMessage());
            try {
                finalUrl = driver.getCurrentUrl();
            } catch (Exception ex) {
                log.debug("예외 후 URL 획득 실패");
                finalUrl = url;
            }
        }catch (Exception e) {
            log.error("예기치 못한 오류 발생 {}",e.getMessage());
            try {
                //팝업창이 없을 경우 그대로 추출
                finalUrl = driver.getCurrentUrl();
            } catch (Exception ex) {
                log.error("구매사이트를 찾을 수 없음");
                finalUrl = url;
            }
        }
        return  finalUrl;
    }
}
