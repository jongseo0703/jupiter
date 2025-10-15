package com.example.crawlingservice.scheduler;

import com.example.crawlingservice.dto.ProductDTO;
import com.example.crawlingservice.service.CrawlingService;
import com.example.crawlingservice.service.ProductServiceClient;
import com.example.crawlingservice.service.SaveService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.io.File;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
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
    private final ProductServiceClient productServiceClient;
    private final ObjectMapper objectMapper = new ObjectMapper().enable(SerializationFeature.INDENT_OUTPUT);

    @Value("${crawling.backup.dir:crawling-backup}")
    private String backupDir;

    private static final String BACKUP_FILE_PREFIX = "crawled-data-";

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

                // 파일로 백업
                String backupFilePath = saveToFile(crawledData, startTime);
                log.info("크롤링 데이터를 파일로 백업: {}", backupFilePath);

                //Crawling DB 저장
                saveService.saveProducts(crawledData);
                log.debug("크롤링 데이터베이스에 저장");

                //Product-service로 데이터 전송
                boolean sent = productServiceClient.sendBulkProducts(crawledData);
                if (sent) {
                    log.info("Product-service로 데이터 전송 완료");
                } else {
                    log.warn("Product-service 데이터 전송 실패 - 백업 파일에서 복구 가능: {}", backupFilePath);
                }
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

    /**
     * 크롤링 데이터를 JSON 파일로 저장
     * @param data 크롤링된 상품 목록
     * @param timestamp 크롤링 시작 시간
     * @return 저장된 파일 경로
     */
    private String saveToFile(List<ProductDTO> data, LocalDateTime timestamp) {
        try {
            // 백업 디렉토리 생성 (상대경로)
            File backupDirectory = new File(backupDir);
            if (!backupDirectory.exists()) {
                backupDirectory.mkdirs();
            }

            // 파일명 생성 (예: crawled-data-2025-01-15_143020.json)
            DateTimeFormatter fileNameFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd_HHmmss");
            String fileName = BACKUP_FILE_PREFIX + timestamp.format(fileNameFormatter) + ".json";
            String filePath = backupDir + File.separator + fileName;

            // JSON 파일로 저장
            objectMapper.writeValue(new File(filePath), data);
            return filePath;
        } catch (IOException e) {
            log.error("크롤링 데이터를 파일로 저장하는 중 오류 발생: {}", e.getMessage());
            return null;
        }
    }

    /**
     * 백업 파일에서 데이터를 읽어서 DB에 저장
     * @param filePath 백업 파일 경로
     */
    public void loadAndSaveFromFile(String filePath) {
        try {
            log.info("=== 백업 파일에서 데이터 읽기 시작: {} ===", filePath);

            // JSON 파일 읽기
            File file = new File(filePath);
            if (!file.exists()) {
                log.error("파일이 존재하지 않습니다: {}", filePath);
                return;
            }

            ProductDTO[] dataArray = objectMapper.readValue(file, ProductDTO[].class);
            List<ProductDTO> crawledData = Arrays.asList(dataArray);

            if (!crawledData.isEmpty()) {
                log.info("파일에서 {}개 상품 데이터 읽음", crawledData.size());

                // DB 저장
                saveService.saveProducts(crawledData);
                log.info("데이터베이스에 저장 완료");
            } else {
                log.warn("파일에 데이터가 없습니다.");
            }
        } catch (IOException e) {
            log.error("파일에서 데이터를 읽는 중 오류 발생: {}", e.getMessage());
        } catch (Exception e) {
            log.error("DB 저장 중 오류 발생: {}", e.getMessage());
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
