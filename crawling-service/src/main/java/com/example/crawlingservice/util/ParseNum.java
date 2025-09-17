package com.example.crawlingservice.util;

/**
 * 문자열 안에 있는 숫자를 찾는 기능
 */
public class ParseNum {
    /**
     * 숫자를 찾으면 int 형을 반환
     * @param text 추출한 문자
     * @return int ---값이 없을 경우 0 반환
     */
    public int getNum(String text){
        String digits = text.replaceAll("[^0-9]", "");
        return digits.isEmpty() ? 0 : Integer.parseInt(digits);
    }
}
