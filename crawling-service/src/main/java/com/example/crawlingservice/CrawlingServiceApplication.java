package com.example.crawlingservice;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@MapperScan("com.example.crawlingservice.db")

public class CrawlingServiceApplication {

  public static void main(String[] args) {
    SpringApplication.run(CrawlingServiceApplication.class, args);
  }

}
