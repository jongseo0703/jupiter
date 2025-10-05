package com.example.crawlingservice.util;

import org.springframework.stereotype.Component;

/**
 * 문자열 안에 있는 숫자를 찾는 기능
 */
@Component
public class ParseNum {
    /**
     * 숫자를 찾으면 int 형을 반환
     * @param text 추출한 문자
     * @return int ---값이 없을 경우 0 반환
     */
    public int getNum(String text){
        String digits = text.replaceAll("[^0-9]", "");
        if (digits.isEmpty()) {
            return 0;
        }

        try {
            return Integer.parseInt(digits);
        } catch (NumberFormatException e) {
            // int 범위 초과 시 0 반환 (바코드 등 불필요한 큰 숫자)
            return 0;
        }
    }

    /**
     * 소수점을 포함한 숫자를 찾아 double 형으로 반환
     * @param text 추출할 문자
     * @return double - 값이 없을 경우 0.0 반환
     */
    public double getDouble(String text) {
        // 숫자, 소수점, 음수 부호만 추출
        String digits = text.replaceAll("[^0-9.]", "");
        if (digits.isEmpty()) {
            return 0.0;
        }

        try {
            return Double.parseDouble(digits);
        } catch (NumberFormatException e) {
            return 0.0;
        }
    }
}
