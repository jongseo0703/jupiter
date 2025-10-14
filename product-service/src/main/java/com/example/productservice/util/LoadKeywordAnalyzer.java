package com.example.productservice.util;


import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public class LoadKeywordAnalyzer {
    // 맛 평가
    private final Map<String, List<String>> flavorKeywords = new LinkedHashMap<>();
    // 바디감 평가
    private final Map<String, List<String>> bodyKeywords = new LinkedHashMap<>();
    // 가성비 평가
    private final Map<String, List<String>> valueKeywords = new LinkedHashMap<>();
    // 만족도 평가
    private final Map<String, List<String>> satisfactionKeywords = new LinkedHashMap<>();

    private void loadFlavorKeywords() {
        flavorKeywords.put("단맛", Arrays.asList("달다", "달콤", "단맛","달달"));
        flavorKeywords.put("쓴맛", Arrays.asList("쓰다", "쌉싸름", "쓴맛"));
        flavorKeywords.put("신맛", Arrays.asList("새콤", "시다", "톡 쏜다","신맛","상큼"));
    }
    private void loadBodyKeywords() {
        bodyKeywords.put("부드러움", Arrays.asList("부드", "목넘김 좋다","순하다", "매끄럽다", "술술 넘어간다", "거슬림이 없다"
                            ,"마일드","편안","매끈","크리미","유연"));
        bodyKeywords.put("깔끔함", Arrays.asList("깔끔", "담백", "청량","라이트","경쾌","가뿐","맑다"));
        bodyKeywords.put("묵직함", Arrays.asList("묵직", "진하다","진한", "무겁다","무거움"));
        bodyKeywords.put("가벼움", Arrays.asList("가볍", "산뜻","가벼움","후레쉬"));
        bodyKeywords.put("거칠음", Arrays.asList("거칠", "자극적"));
    }
}
