package com.example.crawlingservice.controller;

import com.example.crawlingservice.scheduler.DailyScheduler;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/**
 * 크롤링 관련 REST API 컨트롤러
 */
@RestController
@RequestMapping("/api/crawling")
@RequiredArgsConstructor
@Slf4j
public class CrawlingController {

    private final DailyScheduler dailyScheduler;

    @Value("${crawling.backup.dir:crawling-backup}")
    private String backupDir;

    /**
     * 백업 파일 목록 조회
     * @return 백업 파일 목록
     */
    @GetMapping("/backups")
    public ResponseEntity<List<String>> listBackupFiles() {
        try {
            File backupDirectory = new File(backupDir);
            if (!backupDirectory.exists() || !backupDirectory.isDirectory()) {
                return ResponseEntity.ok(new ArrayList<>());
            }

            File[] files = backupDirectory.listFiles((dir, name) -> name.endsWith(".json"));
            List<String> fileNames = files != null
                ? Arrays.stream(files).map(File::getName).sorted().toList()
                : new ArrayList<>();

            return ResponseEntity.ok(fileNames);
        } catch (Exception e) {
            log.error("백업 파일 목록 조회 중 오류: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 백업 파일에서 데이터를 읽어 DB에 저장
     * @param fileName 백업 파일명 (예: crawled-data-2025-01-15_143020.json)
     * @return 처리 결과
     */
    @PostMapping("/restore")
    public ResponseEntity<String> restoreFromBackup(@RequestParam String fileName) {
        try {
            String filePath = backupDir + File.separator + fileName;
            log.info("백업 파일 복구 요청: {}", filePath);

            dailyScheduler.loadAndSaveFromFile(filePath);

            return ResponseEntity.ok("백업 파일에서 데이터 복구 완료: " + fileName);
        } catch (Exception e) {
            log.error("백업 파일 복구 중 오류: {}", e.getMessage());
            return ResponseEntity.internalServerError()
                .body("복구 실패: " + e.getMessage());
        }
    }

    /**
     * 가장 최근 백업 파일에서 자동으로 복구
     * @return 처리 결과
     */
    @PostMapping("/restore-latest")
    public ResponseEntity<String> restoreLatest() {
        try {
            File backupDirectory = new File(backupDir);
            if (!backupDirectory.exists() || !backupDirectory.isDirectory()) {
                return ResponseEntity.badRequest().body("백업 디렉토리가 없습니다.");
            }

            File[] files = backupDirectory.listFiles((dir, name) -> name.endsWith(".json"));
            if (files == null || files.length == 0) {
                return ResponseEntity.badRequest().body("백업 파일이 없습니다.");
            }

            // 가장 최근 파일 찾기 (파일명 정렬, 가장 마지막이 최신)
            File latestFile = Arrays.stream(files)
                .max((f1, f2) -> f1.getName().compareTo(f2.getName()))
                .orElse(null);

            if (latestFile == null) {
                return ResponseEntity.badRequest().body("백업 파일을 찾을 수 없습니다.");
            }

            log.info("가장 최근 백업 파일 복구: {}", latestFile.getName());
            dailyScheduler.loadAndSaveFromFile(latestFile.getAbsolutePath());

            return ResponseEntity.ok("최신 백업 파일에서 데이터 복구 완료: " + latestFile.getName());
        } catch (Exception e) {
            log.error("최신 백업 복구 중 오류: {}", e.getMessage());
            return ResponseEntity.internalServerError()
                .body("복구 실패: " + e.getMessage());
        }
    }
}
