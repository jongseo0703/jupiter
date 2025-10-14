package com.example.productservice.util;


import lombok.extern.slf4j.Slf4j;

import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Slf4j
public class LoadKeywordAnalyzer {
    // 맛 평가
    private final Map<String, List<String>> flavorKeywords = new LinkedHashMap<>();
    // 바디감 평가
    private final Map<String, List<String>> bodyKeywords = new LinkedHashMap<>();
    // 가성비 평가
    private final Map<String, List<String>> valueKeywords = new LinkedHashMap<>();
    // 만족도 평가
    private final Map<String, List<String>> satisfactionKeywords = new LinkedHashMap<>();

    public LoadKeywordAnalyzer() {
        loadFlavorKeywords();
        loadBodyKeywords();
        loadValueKeywords();
        loadSatisfactionKeywords();
    }
    /**
     * 맛표현 키워드
     */
    private void loadFlavorKeywords() {
        flavorKeywords.put("단맛이 나요", Arrays.asList("달다", "달콤", "단맛","달달"));
        flavorKeywords.put("과일향이 나요", Arrays.asList("과일향","베리향","사과향","복숭아향"));
        flavorKeywords.put("꽃향이 나요", Arrays.asList("꽃향","플로럴","장미향"));
        flavorKeywords.put("쓴맛이 나요", Arrays.asList("쓰다", "쌉싸름", "쓴맛"));
        flavorKeywords.put("신맛이 나요", Arrays.asList("새콤", "시다", "톡 쏜다","신맛","상큼"));
    }

    /**
     * 바디감 키워드
     */
    private void loadBodyKeywords() {
        bodyKeywords.put("부드러워요", Arrays.asList("부드", "목넘김 좋다","순하다", "매끄럽다", "술술 넘어간다", "거슬림이 없다"
                            ,"마일드","편안","매끈","크리미","여운"));
        bodyKeywords.put("깔끔해요", Arrays.asList("무난","평범","적당","밸런스 좋다","깔끔", "담백", "청량","라이트","경쾌","가뿐","맑다"));
        bodyKeywords.put("묵직해요", Arrays.asList("거칠", "자극적","풍부","묵직","무겁","진하다","강함", "진하다","진한", "무겁다","무거움","숙성감","무게감"));
        bodyKeywords.put("가벼워요", Arrays.asList("가볍", "산뜻","가벼움","후레쉬","무난","도수가 약","약주"));
    }

    /**
     * 가성비 키워드
     */
    private void loadValueKeywords() {
        valueKeywords.put("가성비가 좋아요", Arrays.asList("가성비", "저렴", "가격대비 좋다", "합리적", "부담 없는",
                            "재구매", "자주 구매", "합리적인 가격", "가격 만족","낮음"));
        valueKeywords.put("가성비가 나빠요", Arrays.asList("비싸", "가격이 아깝다"));
    }

    /**
     * 만족도 키워드
     */
    private void loadSatisfactionKeywords() {
        satisfactionKeywords.put("추천해요", Arrays.asList("만족", "좋다", "또 마시고 싶다", "추천", "선물", "포장상태 좋은",
                "기대 이상", "입문자 추천", "재구매", "최고"));
        satisfactionKeywords.put("보통이에요", Arrays.asList("그닥","아쉽다", "별로", "나쁘진 않은"));
        satisfactionKeywords.put("별로에요", Arrays.asList("불만족","실망","최악"));
    }


    /**
     * 각 카테고리별로 키워드를 찾아 점수화하는 메서드<br>
     * 키워드 발견 시 1점씩 부여
     * @param comment 리뷰 내용
     * @param keywordMap 키워드
     * @return 점수
     */
    private Map<String, Integer> analyzeCategory(String comment, Map<String, List<String>> keywordMap) {
        //점수 분석표
        Map<String, Integer> scores = new LinkedHashMap<>();

        //정의한 카테고리 만큼 반복
        for (String category : keywordMap.keySet()) {
            int count = 0;
            //키워드 수만큼 반복
            for (String keyword : keywordMap.get(category)) {
                //키워드 발견 시 1점 추가
                if (comment.contains(keyword)) count++;
            }
            // 분석표에 추가
            scores.put(category, count);
        }
        return scores;
    }

    /**
     * 리뷰목록를 분석하는 메서드
     * @param commentList 리뷰 목록
     * @return 리뷰 분석표
     */
    public Map<String, Map<String, Integer>> analyzeReview(List<String> commentList) {
        // 결과 누적용 맵 초기화
        Map<String, Map<String, Integer>> result = new LinkedHashMap<>();
        result.put("맛", initScoreMap(flavorKeywords));
        result.put("바디감", initScoreMap(bodyKeywords));
        result.put("가성비", initScoreMap(valueKeywords));
        result.put("만족도", initScoreMap(satisfactionKeywords));

        // 리뷰 목록만큼 반복
        for (String comment : commentList) {
            mergeScores(result.get("맛"), analyzeCategory(comment, flavorKeywords));
            mergeScores(result.get("바디감"), analyzeCategory(comment, bodyKeywords));
            mergeScores(result.get("가성비"), analyzeCategory(comment, valueKeywords));
            mergeScores(result.get("만족도"), analyzeCategory(comment, satisfactionKeywords));
        }

        return result;
    }

    /**
     * 카테고리별 점수 초기화 메서드
     * @param keywordMap 모든 카테고리
     * @return 모든 점수 0점으로 초기화 분석표
     */
    private Map<String, Integer> initScoreMap(Map<String, List<String>> keywordMap) {
        Map<String, Integer> map = new LinkedHashMap<>();
        for (String category : keywordMap.keySet()) {
            map.put(category, 0);
        }
        return map;
    }

    /**
     *  각 리뷰의 점수를 전체 점수에 누적
     * */
    private void mergeScores(Map<String, Integer> total, Map<String, Integer> current) {
        //카테고리 별 대표 키워드만큼 반복
        for (String key : current.keySet()) {
            //전체 대표 키워드별 점수 합산
            total.put(key, total.getOrDefault(key, 0) + current.get(key));
        }
    }

}
