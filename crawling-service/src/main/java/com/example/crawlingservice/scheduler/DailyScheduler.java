package com.example.crawlingservice.scheduler;

import com.example.crawlingservice.dto.ProductDTO;
import com.example.crawlingservice.service.CrawlingService;
import com.example.crawlingservice.service.SaveService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * 매일 자동으로 크롤링 작업을 수행하는 스케줄러 클래스
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DailyScheduler {
    //크롤링할 웹사이트 url
    @Value("${website.url}")
    private String url;

    private final CrawlingService crawlingService;
    private final SaveService saveService;

    /**
     * 매일 서울 기준으로 자정에 자동으로 실행되는 스케줄러 메서드
     */
//    @Scheduled(cron = "0 0 0 * * *", zone = "Asia/Seoul")
    @Scheduled(initialDelay = 60000, fixedDelay = Long.MAX_VALUE) // 테스트용
    public void dailySchedule() {

        try {
            //시작시간
            LocalDateTime startTime = LocalDateTime.now();
            //날짜/시간을 원하는 형식의 문자열로 변환
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

            log.debug("-----일일 크롤링 작업 시작:{}-----",startTime.format(formatter));

            //데이터 크롤링 실행
            List<ProductDTO> crawledData = crawlingService.starePage(url);

            //크롤링된 데이터가 있으면 저장
            if (crawledData != null && !crawledData.isEmpty()) {
                log.debug("총 {}개 상품 수집",crawledData.size());
                //DB 저장
                saveService.saveProducts(crawledData);
            } else {
                log.debug("크롤링된 데이터가 없습니다.");
            }
            // 작업 완료 시간
            LocalDateTime endTime = LocalDateTime.now();
            //소유 시간
            long durationSeconds = java.time.Duration.between(startTime, endTime).getSeconds();
            log.debug("-----일일 크롤링 작업 완료:{} 소유시간 : {}-----",endTime.format(formatter),durationSeconds);

        } catch (Exception e) {
            log.error("스케줄된 크롤링 작업 중 오류 발생: {}",e.getMessage());
        }
    }
}
