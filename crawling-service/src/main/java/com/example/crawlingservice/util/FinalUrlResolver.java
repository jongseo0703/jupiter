package com.example.crawlingservice.util;

import lombok.extern.slf4j.Slf4j;
import org.openqa.selenium.WebDriver;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class FinalUrlResolver {
    public String resolve(String url, WebDriver driver) {
        //최종 URL 초기화
        String finalUrl = url;
        //제품 상세페이지로 돌아가기 위한 탭 저장
        String originalTab =  driver.getCurrentUrl();
        //새로운 탭을 저장할 변수 초기화
        String newTab = null;

        //최종 URL 반환
        return  finalUrl;
    }
}
