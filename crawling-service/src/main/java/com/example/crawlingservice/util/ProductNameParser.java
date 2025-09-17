package com.example.crawlingservice.util;

import org.springframework.stereotype.Component;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * 상품명에서 정보를 추출하는 클래스<br>
 * -제외 상품(세트,키트 등) 확인하는 메서드<br>
 * -브랜드 추출하는 메서드<br>
 */
@Component
public class ProductNameParser {
    /**
     * 상품명에 제외시킬 키워드 와 숫자+호 구조가 포함되여있는지 확인하는 메서드
     * @param productName 검사할 상품명
     * @return 상품명에 조건이 맞으면 false<br> 제외키워드 또는 숫자+호 구조 발견 시 true
     */
    public boolean checkProductName(String productName) {
        //제외시킬 키워드 배열
        String[] excludeKeywords = {"키트", "세트"};
        //제외 키워드의 수만큼 반복
        for (String keyword : excludeKeywords) {
            //제외키워드가 포함되여 있는 여부 확인
            if (productName.contains(keyword)) {
                return true;
            }
        }

        //숫자+호, (숫자)호 모두 찾기
        if (Pattern.compile("(?:\\(\\d+\\)|\\d+)호").matcher(productName).find()) {
            return true;
        }
        return false;
    }

    /**
     * 상품명 앞부분에 있는 브랜드 추출하는 메스드
     * @param productName 추출한 상품명
     * @return brand 반환
     */
    public String getBrand(String productName) {
        String brand = null;
        //상품멱에 공백제거
        String chackName = productName.trim();
        //(),[]로 시작할 경우 제거
        while (true) {
            String next = chackName.replaceFirst("^\\s*(?:\\([^)]*\\)|\\[[^]]*\\])\\s*", "");
            if (next.equals(chackName)) break; // 더 이상 제거할 게 없으면 중단
            chackName = next;
        }

        //상품명 중간에 (),[],공백이 있으면 그전까지만 추출
        Matcher m = Pattern.compile("^([^\\s(\\[]+)").matcher(chackName);
        if(m.find()){
            brand = m.group(1);
        }
        return  brand;
    }
}
