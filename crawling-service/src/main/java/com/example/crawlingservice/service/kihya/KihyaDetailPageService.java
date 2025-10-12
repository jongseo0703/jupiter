package com.example.crawlingservice.service.kihya;

import com.example.crawlingservice.dto.PriceDTO;
import com.example.crawlingservice.dto.ProductDTO;
import com.example.crawlingservice.dto.ReviewDTO;
import com.example.crawlingservice.util.CategoryParser;
import com.example.crawlingservice.util.ParseNum;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;

/**
 * 상품의 상세페이지 크롤링하기
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class KihyaDetailPageService {
    private final ParseNum parseNum;
    private final CategoryParser categoryParser;

    @Value("${kihya_logo.url}")
    private String kihyaLogo;

    public ProductDTO getDetailPage(ProductDTO productDTO, WebDriver driver){
        try {
            //상품 상세페이지로 이동
            driver.get(productDTO.getDetailLink());

            //상세 페이지 로딩 대기
            WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(3));

            //상세페이지 html 문자열로 전환
            String html = driver.getPageSource();

            //정적페이지 조작하여 데이터 추출
            Document doc = Jsoup.parse(html);

            parseImage(doc, productDTO);        // 상품 이미지 URL 추출
            parsePriceInfo(doc, productDTO);    // 가격 및 배송비 정보 추출
            parseProductInfo(doc, productDTO);  // 상품 설명, 도수, 용량 등 추출
            parseReviews(driver, productDTO);   // 리뷰 정보 추출 (페이징 처리 포함)

            // 카테고리 보정 (productKind 기반)
            String adjustedCategory = categoryParser.adjustCategory(
                productDTO.getCategory(),
                productDTO.getProductKind()
            );
            productDTO.setCategory(adjustedCategory);

        } catch (Exception e) {
            log.error("키햐: {}의 크롤링 실패 -{}",productDTO.getProductName(),e.getMessage());
        }
    return productDTO;
    }

    private void parseImage(Document doc, ProductDTO product) {
        // 여러 선택자를 시도하여 이미지 찾기
        Element imgEl = doc.selectFirst("li.slick-slide img");
        if (imgEl == null) {
            imgEl = doc.selectFirst(".slick-slide img");
        }
        if (imgEl == null) {
            imgEl = doc.selectFirst("img[alt*='대표이미지']");
        }
        if (imgEl == null) {
            // 첫 번째 상품 이미지
            imgEl = doc.selectFirst("img[src*='goods']");
        }

        // 이미지 요소가 존재하는지 확인
        if (imgEl != null) {
            String imageUrl = imgEl.attr("src");

            // 이미지 URL이 비어있지 않을 때만 저장
            if (imageUrl != null && !imageUrl.trim().isEmpty()) {
                product.setImageUrl(imageUrl);
            }
        }
    }

    private void parsePriceInfo(Document doc, ProductDTO productDto) {
        PriceDTO priceDTO = new PriceDTO();

        // 상점 정보 파싱
        priceDTO.setShopName("키햐");
        priceDTO.setShopIcon(kihyaLogo);
        priceDTO.setShopLink(productDto.getDetailLink());

        // 구매 링크는 현재 페이지의 URL (상세 페이지 자체가 구매 페이지)
        priceDTO.setShopLink(productDto.getDetailLink());

        // 가격(최저가)
        // "원" 앞에 있는 숫자만 추출하여 최저가 선택
        Elements priceWithWon = doc.select(".price_box");

        int lowestPrice = Integer.MAX_VALUE;
        if (!priceWithWon.isEmpty()) {
            String priceBoxText = priceWithWon.first().html();

            // "숫자원" 패턴을 찾아서 모든 가격 추출
            java.util.regex.Pattern pattern = java.util.regex.Pattern.compile("(\\d{1,3}(?:,\\d{3})*)\\s*<span[^>]*>원</span>");
            java.util.regex.Matcher matcher = pattern.matcher(priceBoxText);

            while (matcher.find()) {
                String priceText = matcher.group(1); // "28,500" 형태
                int price = parseNum.getNum(priceText);

                // 0보다 큰 가격 중에서 최저가 찾기
                if (price > 0 && price < lowestPrice) {
                    lowestPrice = price;
                }
            }
        }

        // 최저가를 찾았으면 설정
        if (lowestPrice != Integer.MAX_VALUE) {
            priceDTO.setPrice(lowestPrice);
        }

        //배송비 찾기
        Element deliveryEl = doc.selectFirst("dt:contains(배송비) + dd");

        if (deliveryEl != null) {
            // 배송비 텍스트 전체
            String deliveryText = deliveryEl.text().toLowerCase();

            //"무료", "픽업" 은 배송비 0 처리
            if (deliveryText.contains("무료") || deliveryText.contains("픽업")) {
                priceDTO.setDeliveryFee(0);
            } else if (deliveryText.contains("그 외")) {
                int idx = deliveryText.indexOf("그 외");
                String feeText = deliveryText.substring(idx);
                int fee = parseNum.getNum(feeText);
                priceDTO.setDeliveryFee(fee);
            } else {
                int fee = parseNum.getNum(deliveryText);
                priceDTO.setDeliveryFee(fee);
            }
        }
        productDto.getPrices().add(priceDTO);
    }

    private void parseProductInfo(Document doc, ProductDTO productDto) {
        // "Taste"를 포함하는 li 요소 찾기
        Element tasteLi = doc.selectFirst("li:has(span:contains(Taste))");

        if (tasteLi != null) {
            // 상품설명용 텍스트 추출
            String fullText = tasteLi.text();

            // "Taste" 다음의 내용만 추출
            if (fullText.startsWith("Taste")) {
                String content = fullText.substring(5).trim();
                productDto.setContent(content);
            }
        }

        //상품 상세 정보 파싱 (종류, 용량, 도수)
        Elements infoItems = new Elements();

        // 1. PC 버전: div.product-detail 시도
        Element productDetail = doc.selectFirst("div.product-detail");
        if (productDetail != null) {
            infoItems = productDetail.select("li.mb-1");
            if (infoItems.isEmpty()) {
                infoItems = productDetail.select("li[class*=mb-1]");
            }
        }

        // 2. 모바일 버전: div.js_openblock > div.openblock_content > ul > li 시도
        if (infoItems.isEmpty()) {
            Element mobileInfo = doc.selectFirst("div.js_openblock div.openblock_content ul");
            if (mobileInfo != null) {
                infoItems = mobileInfo.select("li");
            }
        }

        // for-each 문: infoItems의 모든 요소를 하나씩 순회
        for (Element item : infoItems) {
            // item.text(): li 요소의 전체 텍스트 (예: "종류 일반증류주")
            String text = item.text();

            // === 종류 파싱 ===
            // 모바일: "종류: 스파클링 와인" / PC: "종류 일반증류주"
            String s = text.contains(":")
                    ? text.substring(text.indexOf(":") + 1).trim()
                    : text.substring(2).trim();
            String s1 = s;
            if (text.startsWith("종류")) {
                // "종류: 스파클링 와인" → "스파클링 와인" 또는 "종류 일반증류주" → "일반증류주"
                String productKind = s;

                // 상품 종류 정규화
                String normalizedKind = categoryParser.normalizeProductKind(productKind);
                productDto.setProductKind(normalizedKind);
            }

            //용량
            else if (text.startsWith("용량")) {
                String volumeText = s;
                int volume = parseNum.getNum(volumeText);
                if (volume > 0) {
                    productDto.setVolume(volume);
                }
            }

            //도수
            else if (text.startsWith("도수")) {
                String alcoholText = s;
                double alcohol = parseNum.getDouble(alcoholText);

                if (alcohol > 0) {
                    productDto.setAlcohol(alcohol);
                }
            }
        }
    }

    private void parseReviews(WebDriver driver, ProductDTO productDto) {
        List<ReviewDTO> allReviews = new ArrayList<>();

        try {
            WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));

            // Crema iframe 찾기
            WebElement cremaFrame = driver.findElements(By.tagName("iframe")).stream()
                    .filter(iframe -> {
                        String src = iframe.getAttribute("src");
                        return src != null && src.contains("crema");
                    })
                    .findFirst()
                    .orElse(null);

            if (cremaFrame == null) {
                log.warn("Crema iframe을 찾지 못함");
                productDto.setReviews(allReviews);
                return;
            }

            driver.switchTo().frame(cremaFrame);
            log.info("Crema iframe으로 전환 성공");

            // 리뷰 로드 대기
            wait.until(ExpectedConditions.presenceOfElementLocated(
                    By.cssSelector("div.WidgetProductReviewsBoardMobile__review")
            ));

            List<WebElement> reviewElements = driver.findElements(
                    By.cssSelector("div.WidgetProductReviewsBoardMobile__review")
            );
            log.info("리뷰 요소 개수: {}", reviewElements.size());

            int count = 0;
            for (WebElement el : reviewElements) {
                if (count >= 10) break;
                try {
                    ReviewDTO review = new ReviewDTO();

                    // ✅ 작성자
                    try {
                        WebElement nameEl = el.findElement(
                                By.cssSelector("div.AppReviewUserInfoSectionUserDisplay__display-name")
                        );
                        String name = nameEl.getText().trim();
                        review.setReviewer(name.isEmpty() ? "익명" : name);
                    } catch (Exception e) {
                        review.setReviewer("익명");
                    }

                    // ✅ 내용
                    String content = "";
                    try {
                        WebElement msgEl = el.findElement(
                                By.cssSelector("div.AppReviewInfoSectionBoard__message, div.AppReviewInfoSectionListV3__message")
                        );
                        content = msgEl.getText().trim();
                    } catch (Exception ignore) {}

                    if (content.isEmpty()) continue;
                    review.setContent(content);

                    // ✅ 별점
                    int stars = el.findElements(By.cssSelector("svg.AppRate__icon--fill")).size();
                    review.setStar(stars > 0 ? stars * 20 : 100);

                    review.setShopName("키햐");
                    allReviews.add(review);
                    count++;

                    log.info("리뷰 {} 추출: [{}] {}", count, review.getReviewer(),
                            content.substring(0, Math.min(20, content.length())));

                } catch (Exception e) {
                    log.warn("리뷰 파싱 실패: {}", e.getMessage());
                }
            }

            log.info("총 {}개 리뷰 추출 완료", allReviews.size());

        } catch (Exception e) {
            log.error("리뷰 크롤링 실패: {}", e.getMessage());
        } finally {
            try {
                driver.switchTo().defaultContent();
            } catch (Exception ignore) {}
            productDto.setReviews(allReviews);
        }
    }
}
