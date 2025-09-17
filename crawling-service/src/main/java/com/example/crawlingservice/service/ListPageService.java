package com.example.crawlingservice.service;

import com.example.crawlingservice.dto.ProductDTO;
import com.example.crawlingservice.util.ProductNameParser;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * 상품목록페이지를 크롤링해서 정보를 추출하는 서비스<br>
 *
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class ListPageService {
    private final ProductNameParser productNameParser;
    /**
     * 상세페이지에 있는 상품 정보들을 ProductDTO에 파싱하는 메서드
     * @param html 웹사이트 html
     * @return List 반환
     */
    public List<ProductDTO> crawler(String html){
        //상품을 저장할 리스트
        List<ProductDTO> products = new ArrayList<>();
        //크롤링할 웹사이트 html
        Document doc = Jsoup.parse(html);
        //상품정보들이 포함되여 있는 <il>의 class 이름
        Elements productItems = doc.select("li.prod_item.prod_layer > div.prod_main_info");
        if (productItems.isEmpty()) {
            productItems = doc.select("div.prod_main_info");
        }



        //더 이상 찾을 수 없으면 상품 리스트 리턴
        if(productItems.isEmpty()){
            log.debug("No products found");
            return products;
        }
        //상품목록만큼 반복문 적용
        for (Element item : productItems) {
            try {
                ProductDTO product = getProduct(item);
                if (!product.getProductName().trim().isEmpty()) {
                    products.add(product);
                }
            } catch (Exception e) {
                log.warn("상품 정보 추출 중 오류: {}", e.getMessage());
            }
        }

        if (products.isEmpty()) {
            log.warn("상품을 찾을 수 없습니다.");
        }

        return products;
    }

    /**
     * 추출한 상품정보 Product에 대입
     * @param item 상품정보가 담겨있는 객체
     * @return product 반환
     */
    private ProductDTO getProduct(Element item) {
        ProductDTO product = new ProductDTO();

        // 1. 상품명 추출 (브랜드 + 상품명)과 상품명에 있는 용량과 구성 추출
        String productName = null;
        String volume = null;
        String lineup;
        String brand = null;

        Element titleElement = item.select("a[name=productName]").first();
        if (titleElement != null) {
            productName = titleElement.text().trim();

            //상품명 검사 추가
            if(productNameParser.checkProductName(productName)){
                log.debug("크롤링 제외 상품입니다");
                return null;
            }

            //상품브랜드 메서드 호출
            brand = productNameParser.getBrand(productName);

            //용량과 구성이 있는 Map 호출
            Map<String,String> map = productNameParser.usedName(productName);
            if (map != null) {
                volume = map.get("volume");
                if (volume != null) {
                    product.setVolume(Integer.parseInt(volume));
                }
                lineup = map.get("lineup");
                if (lineup != null) {
                    product.setLineup(lineup);
                }
            }
        }

        // 2. 상품 이미지 추출
        String imageUrl = null;
        Element imgElement = item.select("div.thumb_image a.thumb_link img").first();
        if (imgElement != null) {
            imageUrl = imgElement.attr("src");
            if (imageUrl.startsWith("//")) {
                imageUrl = "https:" + imageUrl;
            }
        }

        // 3. 다나와 상세페이지 링크 추출
        String detailLink = null;
        Element linkElement = item.select("a[name=productName]").first();
        if (linkElement != null) {
            detailLink = linkElement.attr("href");
            if (!detailLink.startsWith("http")) {
                detailLink = "https://prod.danawa.com" + detailLink;

            }
        }

        //도수랑 포장상태를 추출
        Element container = item.selectFirst(
                ".spec_list"
        );
        Map<String,String> map2 = isMap(container);
        if (map2 != null) {
            String packaging =  map2.get("packaging");
            if (packaging != null) {
                product.setPackaging(packaging);
            }
            String alcohol = map2.get("alcohol");
            if (alcohol != null) {
                product.setAlcohol(Double.parseDouble(alcohol));
            }
            if(volume== null){
                String v = map2.get("volume");
                if (v != null) {
                    product.setVolume(Integer.parseInt(v));
                }
            }
        }


        // Product 객체 설정
        product.setProductName(productName);
        if(brand != null){
            product.setBrand(brand);
        }
        product.setImageUrl(imageUrl);
        product.setDetailLink(detailLink);
        return product;
    }


    /**
     * div.spec_list 안에 있는 정보 파싱하기<br>
     * @param container 파싱할 영역
     * @return packaging= 포장상태 alcohol= 도수 volume = 용량<br> Map 반환
     */
    public Map<String,String> isMap(Element container) {
        Map<String,String> result = new HashMap<>();

        String packaging = null;
        String alcohol   = null;
        String volume = null;

        if (container != null) {
            // 태그 구조가 제각각이라 안전하게 '텍스트'에서 정규식으로 추출
            String text = container.text();

            // 포장형태: "포장형태 : 페트" / "포장형태:페트" 등 변형 대응
            // 한글/영문/숫자/슬래시/하이픈/언더스코어 정도까지 허용
            Matcher pkgM = Pattern.compile("포장형태\\s*[:：]?\\s*([가-힣A-Za-z0-9/_\\-]+)")
                    .matcher(text);
            if (pkgM.find()) {
                packaging = pkgM.group(1).trim();
                if (packaging.isEmpty()) packaging = null;
            }

            // 도수: "도수: 6도" / "도수: 16%" 등 변형 대응
            Matcher alcM = Pattern.compile("도수\\s*[:：]?\\s*([0-9]{1,3})\\s*[도%]")
                    .matcher(text);
            if (alcM.find()) {
                alcohol = alcM.group(1).trim(); // 숫자만
                if (alcohol.isEmpty()) alcohol = null;
            }

            //'구성'이 있는데 찾기
            Matcher listM = Pattern.compile("구성\\s*[:：]?\\s*([^\\r\\n]+)").matcher(text);
            if (listM.find()) {
                //'구성'다음 문자열 추출
                String tt = listM.group(1).trim();
                if(alcohol == null){
                    //추출한 문자열중에 '도','%'찾아서 앞에는는 숫자 추출
                    Pattern p = Pattern.compile("((?:[1-9]?\\d|100)(?:\\.\\d{1,2})?)\\s*[도%]");
                    Matcher m = p.matcher(tt);

                    // 모든 매치 순회하며 최댓값 계산
                    double max = Double.NEGATIVE_INFINITY;
                    while (m.find()) {
                        double v = Double.parseDouble(m.group(1));
                        if (v > max) max = v;
                    }

                    if (max != Double.NEGATIVE_INFINITY) {
                        //여러 도수중 제일 큰 도수 적용
                        alcohol = (Math.floor(max) == max) ? Integer.toString((int) max) : Double.toString(max);
                    }
                }

                //추출한 문자열에서 ml,l,L,ML 등 용량 단위 찾아서 앞에 있는 문자 추출
                Pattern volumePattern = Pattern.compile("(\\d+(?:\\.\\d+)?)\\s*(?:ml|ML|mL|Ml|리터|ℓ|L|l)");
                Matcher volumeMatcher = volumePattern.matcher(tt);
                // 모든 용량 매치를 순회하면서 최댓값 찾기
                while (volumeMatcher.find()) {

                    //문자열을 숫자(소주점까지)으로 변환
                    double v = Double.parseDouble(volumeMatcher.group(1));

                    // 전체 매치된 텍스트에서 단위 확인
                    String fullMatch = volumeMatcher.group(0);
                    //숫자와 공백 부분을 제거하여 단위만 남김
                    String unit = fullMatch.replaceAll("\\d+(?:\\.\\d+)?\\s*", "").toLowerCase();

                    // 리터 단위를 ml로 변환 (1L = 1000ml)
                    int volumeInMl;
                    if (unit.equals("리터") || unit.equals("ℓ") || unit.equals("l")) {
                        v = v * 1000; // 리터를 ml로 변환
                        volumeInMl= (int) v;
                    }else {
                        //ml면 그대로 대입
                        volumeInMl =(int) v;
                    }
                    //숫자를 다시 문자열로 변환
                    volume= String.valueOf(volumeInMl);
                }
            }
        }

        result.put("volume", volume);
        result.put("packaging",packaging);
        result.put("alcohol",alcohol);
        return result;
    }
}
