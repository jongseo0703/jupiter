package com.example.productservice.util;

/**
 * 이미지 사이즈 정보 제거 클래스
 */
public class UrlShrinkRemover {
    /**
     * 이미지 URL에서 'shrink=숫자:숫자'를 제거
     * @param url 이미지
     * @return 사이즈를 제거하 이미지 URL
     */
    public static String removeShrinkFromUrl(String url) {

        return url
                // shrink=숫자:숫자 패턴만 제거
                .replaceAll("shrink=\\d+:\\d+", "")
                // 연속된 &&를 &로 변경
                .replaceAll("&&", "&")
                // 마지막에 &가 남아있으면 제거
                .replaceAll("&$", "");
    }
}
