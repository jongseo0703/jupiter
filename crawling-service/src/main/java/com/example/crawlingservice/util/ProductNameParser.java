package com.example.crawlingservice.util;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * 상품명에서 정보를 추출하는 클래스<br>
 * -제외 상품(세트,키트 등) 확인하는 메서드<br>
 * -브랜드 추출하는 메서드<br>
 * -용량, 구성을 추출하는 메서드
 */
@Component
@Slf4j
public class ProductNameParser {
    /**
     * 상품명에 제외시킬 키워드 와 숫자+호,가지,종 구조가 포함되여있는지 확인하는 메서드
     * @param productName 검사할 상품명
     * @return 상품명에 조건이 맞으면 false<br> 제외키워드 또는 숫자+호 구조 발견 시 true
     */
    public boolean checkProductName(String productName) {
        //제외시킬 키워드 배열
        String[] excludeKeywords = {"키트", "세트","+","선물","x","X","*","투뿔광어"};
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

        //숫자+종 찾기
        if (Pattern.compile("\\d+종").matcher(productName).find()) {
            return true;
        }

        //숫자+가지 찾기
        if (Pattern.compile("\\d+가지").matcher(productName).find()) {
            return true;
        }

        return false;
    }

    /**
     * 상품명에서 (), [] 제거하는 메서드
     * @param productName 원본 상품명
     * @return 괄호 내용이 제거된 상품명
     */
    public String removeBrackets(String productName) {
        if (productName == null || productName.isEmpty()) {
            return productName;
        }

        // (), [] 모두 제거
        String cleaned = productName
            // () 제거
            .replaceAll("\\([^)]*\\)", "")
            // [] 제거
            .replaceAll("\\[[^]]*\\]", "")
            // 앞뒤 공백 제거
            .trim();

        // 연속된 공백을 하나로 변환
        cleaned = cleaned.replaceAll("\\s{2,}", " ");

        return cleaned;
    }

    /**
     * 상품명 앞부분에 있는 브랜드 추출하는 메서드
     * @param productName 추출한 상품명
     * @return brand 반환
     */
    public String getBrand(String productName) {
        String brand = null;
        //상품명에 공백제거
        String checkName = productName.trim();
        //(),[]로 시작할 경우 제거
        while (true) {
            String next = checkName.replaceFirst("^\\s*(?:\\([^)]*\\)|\\[[^]]*\\])\\s*", "");
            if (next.equals(checkName)) break; // 더 이상 제거할 게 없으면 중단
            checkName = next;
        }

        //상품명 중간에 (),[],공백이 있으면 그전까지만 추출
        Matcher m = Pattern.compile("^([^\\s(\\[]+)").matcher(checkName);
        if(m.find()){
            brand = m.group(1);
        }
        return brand;
    }

    /**
     * 상품명에 포함되여 있는 용량(mL,L)와 구성(2개, 2입)을 파싱하기<br>
     * ml 기준으로 L는 ml로 변환 후 반환
     * @param productName 상품명
     * @return  volume(용량), lineup(구성)<br> Map 반환
     */
    public Map<String,String> usedName(String productName){
        Map<String,String> map = new HashMap<>();
        String volume = null;
        String lineup;

        //상품명에 있는 ml,l 찾기
        Pattern volumePattern = Pattern.compile("(\\d+(?:\\.\\d+)?)\\s*[mM][lL]|(\\d+(?:\\.\\d+)?)\\s*[lL]");
        Matcher volumeMatcher = volumePattern.matcher(productName);

        if (volumeMatcher.find()) {
            String volumeStr = volumeMatcher.group(1) != null ? volumeMatcher.group(1) : volumeMatcher.group(2);
            try {
                double volumeDouble = Double.parseDouble(volumeStr);
                // L 단위인 경우 ml로 변환
                if (volumeMatcher.group(0).toLowerCase().contains("l") && !volumeMatcher.group(0).toLowerCase().contains("ml")) {
                    volumeDouble *= 1000; // L를 ml로 변환
                }
                volume = String.valueOf((int) volumeDouble);
            } catch (NumberFormatException e) {
                log.debug("용량 파싱 실패: {}", volumeStr);
            }
            map.put("volume", volume);
        }

        //상품명에서 구성(1개, 1입,1구) 얻어오기
        Pattern lineupPattern = Pattern.compile("(\\d+)\\s*[개입구]");
        Matcher lineupMatcher = lineupPattern.matcher(productName);

        if (lineupMatcher.find()) {
            try {
                lineup = lineupMatcher.group(1)+" 개";
                map.put("lineup", lineup);
            } catch (NumberFormatException e) {
                log.debug("개수 파싱 실패: {}", lineupMatcher.group(1));
            }
        }

        return  map;
    }
}
