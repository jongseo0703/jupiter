package com.example.productservice.util;


import jakarta.annotation.PostConstruct;
import kr.co.shineware.nlp.komoran.core.Komoran;
import kr.co.shineware.nlp.komoran.model.KomoranResult;
import kr.co.shineware.nlp.komoran.model.Token;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Component
@RequiredArgsConstructor
public class LoadKeywordAnalyzer {
    private final Komoran komoran;
    private final Map<String, List<String>> keywordMorphemeCache = new ConcurrentHashMap<>();

    // 제외 키워드
    private static final List<String> SERVICE_KEYWORDS = Arrays.asList(
        "배송", "택배", "직원", "서비스", "일처리", "응대",
        "매장", "가게", "상점", "결혼식", "픽업", "이동하기"
    );

    // 제품 관련 키워드
    private static final List<String> PRODUCT_KEYWORDS = Arrays.asList(
        "맛", "향", "느낌", "술", "와인", "위스키", "맥주", "소주", "막걸리",
        "목넘김", "바디", "풍미", "여운", "도수", "알콜", "탄산",
        "한잔", "마시", "음용", "시음", "맛보", "포장상태", "병", "선물용"
    );

    // 맛 평가
    private final Map<String, List<String>> flavorKeywords = new LinkedHashMap<>();
    // 바디감 평가
    private final Map<String, List<String>> bodyKeywords = new LinkedHashMap<>();
    // 가성비 평가
    private final Map<String, List<String>> valueKeywords = new LinkedHashMap<>();
    // 만족도 평가
    private final Map<String, List<String>> satisfactionKeywords = new LinkedHashMap<>();

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
        bodyKeywords.put("깔끔해요", Arrays.asList("무난","평범","적당","밸런스 좋다","깔끔", "담백", "청량","라이트","경쾌","가뿐","맑다","밸런스"));
        bodyKeywords.put("묵직해요", Arrays.asList("거칠", "자극적","풍부","묵직","무겁","진하다","강함", "진한", "무겁다","무거움","숙성감","무게감"));
        bodyKeywords.put("가벼워요", Arrays.asList("가볍", "산뜻","가벼움","후레쉬","도수가 약","약주"));
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
                "기대 이상", "입문자 추천", "재구매", "최고","맘에드네요","굳","기대","맛있","짱","편리","좋았"));
        satisfactionKeywords.put("보통이에요", Arrays.asList("그닥","아쉽", "별로", "나쁘진 않은","괜찮","에매","다르","다른","그럭저럭","개성은 없"));
        satisfactionKeywords.put("별로에요", Arrays.asList("불만족","실망","최악","상한","느린","늦","선입선출이 잘안","상할"));
    }

    @PostConstruct
    public void init() {
        loadFlavorKeywords();
        loadBodyKeywords();
        loadValueKeywords();
        loadSatisfactionKeywords();
    }


    /**
     * 각 카테고리별로 키워드를 찾아 점수화하는 메서드<br>
     * 키워드 발견 시 1점씩 부여
     * @param comment 리뷰 내용
     * @param keywordMap 키워드
     * @return 점수
     */
    private Map<String, Integer> analyzeCategory(String comment, Map<String, List<String>> keywordMap) {
        return analyzeCategoryWithMorpheme(comment, keywordMap);
    }

    /**
     * 형태소 분석 기반 카테고리 분석
     */
    private Map<String, Integer> analyzeCategoryWithMorpheme(String comment, Map<String, List<String>> keywordMap) {
        Map<String, Integer> scores = new LinkedHashMap<>();

        //형태소 분석 수행
        KomoranResult result = komoran.analyze(comment);
        List<Token> tokens = result.getTokenList();

        // 형태소 원형 추출
        List<String> morphemes = new ArrayList<>();
        for (Token token : tokens) {
            String pos = token.getPos(); // 품사
            String morph = token.getMorph(); // 형태소 원형

            // NNG(일반명사), NNP(고유명사), VA(형용사), VV(동사), MAG(일반부사) 추출
            if (pos.startsWith("NN") || pos.startsWith("VA") || pos.startsWith("VV") || pos.equals("MAG")) {
                morphemes.add(morph);
            }
        }

        log.debug("형태소 분석 결과: {}", morphemes);

        // 각 카테고리별로 형태소 매칭
        for (String category : keywordMap.keySet()) {
            int count = 0;

            for (String keyword : keywordMap.get(category)) {
                // 키워드도 형태소 분석하여 원형 추출
                List<String> keywordMorphemes = keywordMorphemeCache.computeIfAbsent(keyword, this::extractMorphemes);

                // 형태소 리스트에서 키워드 원형 찾기
                for (String keywordMorph : keywordMorphemes) {

                    if (morphemes.contains(keywordMorph)) {
                        // 문맥 확인
                        if (isProductContextByMorpheme(keywordMorph, tokens)) {
                            count++;
                            log.debug("포함: '{}' (원형: '{}', 카테고리: {})", keyword, keywordMorph, category);
                            break; // 같은 키워드 중복 카운트 방지
                        }
                    }
                }
            }
            scores.put(category, count);
        }

        return scores;
    }

    /**
     * 키워드의 형태소 원형 추출
     */
    private List<String> extractMorphemes(String keyword) {
        List<String> morphemes = new ArrayList<>();
        KomoranResult result = komoran.analyze(keyword);

        for (Token token : result.getTokenList()) {
            String pos = token.getPos();
            String morph = token.getMorph();

            // 의미있는 품사만 추출
            if (pos.startsWith("NN") || pos.startsWith("VA") || pos.startsWith("VV") || pos.equals("MAG")) {
                morphemes.add(morph);
            }
        }

        return morphemes;
    }

    /**
     * 형태소 기반 제품 문맥 확인
     */
    private boolean isProductContextByMorpheme(String keywordMorph, List<Token> tokens) {
        // 키워드가 등장하는 위치 찾기
        int keywordIndex = -1;
        for (int i = 0; i < tokens.size(); i++) {
            if (tokens.get(i).getMorph().equals(keywordMorph)) {
                keywordIndex = i;
                break;
            }
        }

        if (keywordIndex == -1) return false;

        // 앞뒤 5개 형태소 범위 확인
        int start = Math.max(0, keywordIndex - 5);
        int end = Math.min(tokens.size(), keywordIndex + 6);

        // 제품 키워드 확인
        boolean hasProductKeyword = false;
        for (int i = start; i < end; i++) {
            String morph = tokens.get(i).getMorph();
            if (PRODUCT_KEYWORDS.contains(morph) && !morph.equals(keywordMorph)) {
                hasProductKeyword = true;
                log.debug("제품 키워드 '{}' 발견", morph);
                break;
            }
        }

        // 서비스 키워드 확인
        for (int i = start; i < end; i++) {
            String morph = tokens.get(i).getMorph();
            if (SERVICE_KEYWORDS.contains(morph)) {
                log.debug("서비스 키워드 '{}' 발견", morph);
                // 제품 키워드도 있으면 제품으로 인정
                if (hasProductKeyword) {
                    log.debug("하지만 제품 키워드도 있어서 포함");
                    return true;
                }
                return false;
            }
        }

        // 서비스 키워드 없으면 제품으로 인정
        return true;
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
        log.debug("리뷰 분석 결과 {}",result);
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
