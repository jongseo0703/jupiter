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
import org.openqa.selenium.JavascriptExecutor;
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
        long startTime = System.currentTimeMillis();
        try {
            //상품 상세페이지로 이동
            driver.get(productDTO.getDetailLink());

            //상세 페이지 로딩 대기 (5초 -> 3초로 단축)
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
        log.debug("⏱️ 상세페이지 크롤링: {}ms", System.currentTimeMillis() - startTime);
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
        // PriceDTO: 가격 정보를 담는 객체 (가격, 배송비, 구매링크 등)
        PriceDTO priceDTO = new PriceDTO();

        // 상점 정보 파싱
        priceDTO.setShopName("키햐");
        priceDTO.setShopIcon(kihyaLogo);
        priceDTO.setShopLink(productDto.getDetailLink());

        // 구매 링크는 현재 페이지의 URL (상세 페이지 자체가 구매 페이지)
        priceDTO.setShopLink(productDto.getDetailLink());

        // === 가격 파싱 (최저가) ===
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

        // === 배송비 파싱 ===
        // dt 태그에 "배송비"라는 텍스트가 있는 경우, 다음에 오는 dd 태그의 내용을 가져옴
        // HTML 구조: <dt>판매처<br>배송비</dt><dd><strong>무료 배송</strong></dd>
        Element deliveryEl = doc.selectFirst("dt:contains(배송비) + dd");

        if (deliveryEl != null) {
            // 배송비 텍스트 전체를 가져옴 (예: "무료 배송", "3,000원", "3만 원 이상 무료 배송, 그 외 3,000원")
            String deliveryText = deliveryEl.text().toLowerCase();  // 소문자로 변환 (대소문자 구분 없이 처리)

            // contains(): 문자열에 특정 단어가 포함되어 있는지 확인
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

        // 완성된 PriceDTO를 ProductDTO의 prices 리스트에 추가
        // product.getPrices(): ProductDTO 안의 prices 필드 (List<PriceDTO>)
        // ArrayList: 동적 배열, 크기가 자동으로 늘어나는 리스트
        productDto.getPrices().add(priceDTO);
    }

    private void parseProductInfo(Document doc, ProductDTO productDto) {
        // === 상품 설명 파싱 (Taste 정보) ===
        // "Taste"를 포함하는 li 요소 찾기
        Element tasteLi = doc.selectFirst("li:has(span:contains(Taste))");

        if (tasteLi != null) {
            // li의 전체 텍스트 가져오기 (예: "Taste 깔끔하고 부드러운 맛, 풍부한 곡물 풍미")
            String fullText = tasteLi.text();

            // "Taste" 다음의 내용만 추출
            if (fullText.startsWith("Taste")) {
                String content = fullText.substring(5).trim();
                productDto.setContent(content);
            }
        }

        // === 상품 상세 정보 파싱 (종류, 용량, 도수) ===
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

            // === 용량 파싱 ===
            else if (text.startsWith("용량")) {
                String volumeText = s;
                int volume = parseNum.getNum(volumeText);
                if (volume > 0) {
                    productDto.setVolume(volume);
                }
            }

            // === 도수 파싱 ===
            else if (text.startsWith("도수")) {
                String alcoholText = s;
                int alcoholInt = parseNum.getNum(alcoholText);

                if (alcoholInt > 0) {
                    productDto.setAlcohol((double) alcoholInt);
                }
            }
        }
    }

    private void parseReviews(WebDriver driver, ProductDTO productDto) {
        List<ReviewDTO> allReviews = new ArrayList<>();

        // 5초 -> 2초로 더 단축
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(2));

        try {
            // 상품후기 탭 클릭 (대기 시간 단축)
            WebElement reviewTab = null;
            try {
                reviewTab = wait.until(ExpectedConditions.elementToBeClickable(
                    By.cssSelector("li#detailReview a[data-target='js_board_goodsreview_view']")
                ));
            } catch (Exception e1) {
                try {
                    reviewTab = wait.until(ExpectedConditions.elementToBeClickable(
                        By.cssSelector("a[data-target='js_board_goodsreview_view']")
                    ));
                } catch (Exception e2) {
                    productDto.setReviews(allReviews);
                    return;
                }
            }

            // JavaScript로 직접 클릭 (스크롤 대기 제거)
            ((JavascriptExecutor) driver).executeScript("arguments[0].click();", reviewTab);

            // 짧은 대기 후 즉시 파싱 시도
            Thread.sleep(500);

            // HTML 파싱
            String html = driver.getPageSource();

            // 리뷰가 없으면 즉시 종료
            if (html.contains("등록된 상품후기가 없습니다")) {
                productDto.setReviews(allReviews);
                return;
            }

            // iframe 전환 시도 (타임아웃 1초)
            try {
                WebDriverWait shortWait = new WebDriverWait(driver, Duration.ofSeconds(1));
                List<WebElement> iframes = driver.findElements(By.tagName("iframe"));

                for (WebElement iframe : iframes) {
                    String iframeSrc = iframe.getAttribute("src");
                    if (iframeSrc != null && (iframeSrc.contains("crema") || iframeSrc.contains("review"))) {
                        driver.switchTo().frame(iframe);
                        shortWait.until(ExpectedConditions.presenceOfElementLocated(By.tagName("body")));
                        break;
                    }
                }
            } catch (Exception e) {
                // iframe 전환 실패해도 계속
            }

            // 리뷰 영역 로딩 대기 (1초)
            try {
                WebDriverWait shortWait = new WebDriverWait(driver, Duration.ofSeconds(1));
                shortWait.until(ExpectedConditions.presenceOfElementLocated(By.cssSelector(".Body__review")));
            } catch (Exception e) {
                // 타임아웃 무시
            }

            // HTML 재파싱
            html = driver.getPageSource();
            Document doc = Jsoup.parse(html);

            // 리뷰 요소 선택
            Elements currentReviews = doc.select(".WidgetProductReviewsBoardMobile__review");
            if (currentReviews.isEmpty()) {
                currentReviews = doc.select(".Body__review");
            }

            if (currentReviews.isEmpty()) {
                productDto.setReviews(allReviews);
                driver.switchTo().defaultContent();
                return;
            }

            // 각 리뷰를 파싱 (최대 10개만)
            int count = 0;
            for (Element reviewEl : currentReviews) {
                if (count >= 10) break;
                try {
                    ReviewDTO review = new ReviewDTO();
                    review.setReviewer("익명");

                    // 별점 파싱
                    Elements stars = reviewEl.select(".AppRate__item");
                    review.setStar(stars.size() * 20);

                    // 리뷰 내용 파싱
                    Element contentEl = reviewEl.selectFirst(".AppReviewInfoSectionBoard__message");
                    if (contentEl == null) {
                        Elements contentElements = reviewEl.select(".AppReviewInfoSectionListV3__message");
                        for (Element el : contentElements) {
                            Element parent = el.parent();
                            if (parent != null && !parent.attr("style").contains("display: none")) {
                                review.setContent(el.text().trim());
                                break;
                            }
                        }
                    } else {
                        review.setContent(contentEl.text().trim());
                    }

                    review.setShopName("키햐");
                    allReviews.add(review);
                    count++;

                } catch (Exception e) {
                    // 개별 리뷰 파싱 실패 시 무시
                }
            }

        } catch (Exception e) {
            log.debug("리뷰 크롤링 스킵: {}", e.getMessage());
        } finally {
            // 파싱한 모든 리뷰를 ProductDTO에 저장
            productDto.setReviews(allReviews);

            // 메인 프레임으로 돌아가기
            driver.switchTo().defaultContent();
        }

        log.debug("리뷰 {}개 파싱 완료", allReviews.size());
    }
}
