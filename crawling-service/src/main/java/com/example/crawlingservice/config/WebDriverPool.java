package com.example.crawlingservice.config;

import jakarta.annotation.PreDestroy;
import lombok.extern.slf4j.Slf4j;
import org.openqa.selenium.PageLoadStrategy;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * WebDriver를 재사용하는 풀 관리 클래스
 * - Chrome 프로세스 생성/종료 오버헤드 제거
 * - 리소스 누수 방지
 * - 성능 향상
 */
@Component
@Slf4j
public class WebDriverPool {
    // 동시 실행 가능한 최대 크롤링 작업 수
    private static final int POOL_SIZE = 10;

    // WebDriver 보관 풀
    private final BlockingQueue<WebDriver> availableDrivers = new LinkedBlockingQueue<>(POOL_SIZE);

    // 생성된 전체 드라이버 목록 (종료 시 정리용)
    private final ConcurrentHashMap<WebDriver, Boolean> allDrivers = new ConcurrentHashMap<>();

    // 현재 생성된 드라이버 수
    private final AtomicInteger createdCount = new AtomicInteger(0);

    @Value("${chrome.driver.path}")
    private String WEB_DRIVER_PATH;

    /**
     * 풀에서 WebDriver 대여
     * - 사용 가능한 드라이버가 있으면 즉시 반환
     * - 없으면 새로 생성
     * - 풀이 가득 차면 반납될 때까지 대기
     */
    public WebDriver borrowDriver() throws InterruptedException {
        // 가능한 드라이버 확인
        WebDriver driver = availableDrivers.poll();

        if (driver != null) {
            // 드라이버 상태 체크 (크래시 감지)
            if (!isDriverHealthy(driver)) {
                log.warn("크래시된 WebDriver 감지, 새로 생성");
                safeQuitDriver(driver);
                allDrivers.remove(driver);
                createdCount.decrementAndGet();
                driver = createNewDriver();
            }
            log.debug("WebDriver 풀에서 대여 (사용 가능: {}개)", availableDrivers.size());
            return driver;
        }

        // 풀이 비어있고 최대 개수 미달이면 새로 생성
        if (createdCount.get() < POOL_SIZE) {
            driver = createNewDriver();
            log.info("새 WebDriver 생성 (전체: {}/{})", createdCount.get(), POOL_SIZE);
            return driver;
        }

        // 풀이 가득 차면 반납될 때까지 대기 (최대 30초)
        log.debug("WebDriver 풀이 가득 참, 반납 대기 중...");
        driver = availableDrivers.poll(30, TimeUnit.SECONDS);

        if (driver == null) {
            log.error("WebDriver 대여 타임아웃 (30초), 새 드라이버 강제 생성");
            // 타임아웃 시 예외 대신 새 드라이버 생성 (안정성 우선)
            driver = createNewDriver();
        }

        return driver;
    }

    /**
     * 풀에 WebDriver 반납
     * - 세션 정리 (쿠키, 캐시 삭제)
     * - 풀에 다시 추가
     */
    public void returnDriver(WebDriver driver) {
        if (driver == null) return;

        try {
            // 드라이버 상태 체크 (크래시 확인)
            if (!isDriverHealthy(driver)) {
                log.warn("크래시된 WebDriver 반납 시도, 폐기");
                safeQuitDriver(driver);
                allDrivers.remove(driver);
                createdCount.decrementAndGet();
                return;
            }

            // 세션 정리 (다음 사용을 위해)
            driver.manage().deleteAllCookies();

            // 풀에 반납
            boolean returned = availableDrivers.offer(driver, 5, TimeUnit.SECONDS);

            if (returned) {
                log.debug("WebDriver 풀에 반납 (사용 가능: {}개)", availableDrivers.size());
            } else {
                // 풀이 가득 차면 (비정상 상황) 강제 종료
                log.warn("WebDriver 풀이 가득 차서 강제 종료");
                safeQuitDriver(driver);
                allDrivers.remove(driver);
                createdCount.decrementAndGet();
            }

        } catch (Exception e) {
            log.error("WebDriver 반납 실패, 강제 종료: {}", e.getMessage());
            safeQuitDriver(driver);
            allDrivers.remove(driver);
            createdCount.decrementAndGet();
        }
    }

    /**
     * WebDriver 상태 체크 (크래시 여부 확인)
     */
    private boolean isDriverHealthy(WebDriver driver) {
        try {
            // 간단한 명령으로 드라이버 응답 확인
            driver.getTitle();
            return true;
        } catch (Exception e) {
            // 크래시되거나 세션이 종료된 경우
            log.debug("WebDriver 상태 체크 실패: {}", e.getMessage());
            return false;
        }
    }

    /**
     * 새 WebDriver 생성
     */
    private WebDriver createNewDriver() {
        System.setProperty("webdriver.chrome.driver", WEB_DRIVER_PATH);

        ChromeOptions options = createOptimizedChromeOptions();
        WebDriver driver = new ChromeDriver(options);

        // 타임아웃 설정 (공격적 성능 최적화)
        driver.manage().timeouts().pageLoadTimeout(Duration.ofSeconds(15));
        driver.manage().timeouts().implicitlyWait(Duration.ofSeconds(2));
        driver.manage().timeouts().scriptTimeout(Duration.ofSeconds(8));

        // 추적 목록에 추가
        allDrivers.put(driver, true);
        createdCount.incrementAndGet();

        return driver;
    }

    /**
     * 최적화된 Chrome 옵션 생성
     */
    private ChromeOptions createOptimizedChromeOptions() {
        ChromeOptions options = new ChromeOptions();

        // 헤드리스 모드
        options.addArguments("--headless");
        options.setPageLoadStrategy(PageLoadStrategy.EAGER);

        // 보안 프로세스 비활성화
        options.addArguments("--no-sandbox");
        options.addArguments("--allow-running-insecure-content");
        options.addArguments("--ignore-certificate-errors");

        // 그래픽 렌더링 제거
        options.addArguments("--disable-gpu");
        options.addArguments("--disable-images");
        options.addArguments("--disable-features=VizDisplayCompositor");

        // 불필요한 기능 제거
        options.addArguments("--disable-extensions");
        options.addArguments("--disable-plugins");
        options.addArguments("--disable-translate");
        options.addArguments("--disable-popup-blocking");
        options.addArguments("--disable-background-timer-throttling");

        // 메모리 최적화
        options.addArguments("--disable-dev-shm-usage");
        options.addArguments("--memory-pressure-off");
        options.addArguments("--max_old_space_size=4096");

        // 네트워크 최적화
        options.addArguments("--aggressive-cache-discard");
        options.addArguments("--disable-background-networking");

        return options;
    }

    /**
     * WebDriver를 안전하게 종료
     * - 타임아웃 적용 (5초)
     * - 실패 시 프로세스 강제 종료
     */
    private void safeQuitDriver(WebDriver driver) {
        if (driver == null) return;

        // 타임아웃이 있는 종료
        CompletableFuture<Void> quitFuture = CompletableFuture.runAsync(() -> {
            try {
                driver.quit();
            } catch (Exception e) {
                log.warn("WebDriver quit 실패: {}", e.getMessage());
            }
        });

        try {
            // 5초 안에 종료되지 않으면 강제 종료
            quitFuture.get(5, TimeUnit.SECONDS);
        } catch (TimeoutException e) {
            log.error("WebDriver 종료 타임아웃, 프로세스 강제 종료");
            quitFuture.cancel(true);
            killChromeProcesses();
        } catch (Exception e) {
            log.error("WebDriver 종료 중 예외: {}", e.getMessage());
        }
    }

    /**
     * Chrome 프로세스 강제 종료
     */
    private void killChromeProcesses() {
        try {
            String os = System.getProperty("os.name").toLowerCase();

            if (os.contains("win")) {
                // Windows: taskkill 사용
                Runtime.getRuntime().exec("taskkill /F /IM chrome.exe /T");
                Runtime.getRuntime().exec("taskkill /F /IM chromedriver.exe /T");
            } else {
                // Linux/Mac: pkill 사용
                Runtime.getRuntime().exec("pkill -9 chrome");
                Runtime.getRuntime().exec("pkill -9 chromedriver");
            }
        } catch (Exception e) {
            log.error("Chrome 프로세스 강제 종료 실패: {}", e.getMessage());
        }
    }

    /**
     * 애플리케이션 종료 시 모든 WebDriver 정리
     */
    @PreDestroy
    public void destroy() {
        log.info("WebDriverPool 종료 시작 (전체 드라이버: {}개)", allDrivers.size());

        // 풀에서 모든 드라이버 제거 및 종료
        WebDriver driver;
        while ((driver = availableDrivers.poll()) != null) {
            safeQuitDriver(driver);
        }

        // 혹시 반납되지 않은 드라이버도 종료
        allDrivers.keySet().forEach(this::safeQuitDriver);
        allDrivers.clear();

        log.info("모든 WebDriver 종료 완료");
    }
}
