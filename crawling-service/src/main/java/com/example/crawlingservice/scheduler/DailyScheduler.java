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
    private final CrawlingService crawlingService;
    private final SaveService saveService;

    /**
     * 매일 서울 기준 3번(9시,12시,18시) 자동으로 실행되는 스케줄러 메서드
     */
    @Scheduled(cron = "0 0 9,12,18 * * *", zone = "Asia/Seoul")
//    @Scheduled(initialDelay = 10000, fixedDelay = Long.MAX_VALUE) // 테스트용
    public void dailySchedule() {
        log.info("=== 크롤링 작업 시작 ===");

        try {
            //시작시간
            LocalDateTime startTime = LocalDateTime.now();
            //날짜/시간을 원하는 형식의 문자열로 변환
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

            //데이터 크롤링 실행
            List<ProductDTO> crawledData = crawlingService.crawlAllShops();

            //크롤링된 데이터가 있으면 저장
            if (crawledData != null && !crawledData.isEmpty()) {
                log.debug("총 {}개 상품 수집",crawledData.size());
                //DB 저장
                saveService.saveProducts(crawledData);
                log.debug("데이터베이스에 저장");
            } else {
                log.debug("크롤링된 데이터가 없습니다.");
            }
            // 작업 완료 시간
            LocalDateTime endTime = LocalDateTime.now();
            //소유 시간
            long durationSeconds = java.time.Duration.between(startTime, endTime).getSeconds();
            String time = formatDuration(durationSeconds);
            log.debug("-----일일 크롤링 작업 완료:{} 소요시간 : {}-----",endTime.format(formatter),time);

        } catch (Exception e) {
            log.error("스케줄된 크롤링 작업 중 오류 발생: {}",e.getMessage());
        }
    }

    // 소요시간을 표기변환 메서드
    private String formatDuration(long seconds) {
        long hours = seconds / 3600;
        long minutes = (seconds % 3600) / 60;
        long secs = seconds % 60;

        if (hours > 0) {
            return String.format("%d시간 %d분 %d초", hours, minutes, secs);
        } else if (minutes > 0) {
            return String.format("%d분 %d초", minutes, secs);
        } else {
            return String.format("%d초", secs);
        }
    }
}
