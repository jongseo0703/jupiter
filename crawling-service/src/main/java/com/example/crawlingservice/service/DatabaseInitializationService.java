package com.example.crawlingservice.service;

import com.example.crawlingservice.db.SchemaMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.DependsOn;
import org.springframework.stereotype.Service;

/**
 * 애플리케이션 시작 시 데이터베이스를 초기화하는 서비스
 */
@Service
@Slf4j
@RequiredArgsConstructor
@DependsOn("schemaMapper")
public class DatabaseInitializationService implements ApplicationRunner {
    private final SchemaMapper schemaMapper;

    /**
     * 애플리케이션이 시작된 후 자동으로 실행되는 메서드
     * @param args incoming application arguments 애플리케이션 실행 시 전달된 명령행 인수들
     * @throws Exception 실행 중 발생할 수 있는 예외
     */
    @Override
    public void run(ApplicationArguments args) throws Exception {
        try {
            //모든 테이블 생성
            schemaMapper.createAllTables();
            log.debug("모든 테이블들이 생성되었습니다");
        } catch (Exception e) {
            log.debug("이미 테이블이 존재합니다. {}", e.getMessage());
            throw e;
        }
    }
}
