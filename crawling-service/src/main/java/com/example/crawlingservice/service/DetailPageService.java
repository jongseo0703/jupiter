package com.example.crawlingservice.service;

import com.example.crawlingservice.dto.PriceDTO;
import com.example.crawlingservice.dto.ProductDTO;
import com.example.crawlingservice.dto.ReviewDTO;
import com.example.crawlingservice.util.FinalUrlResolver;
import com.example.crawlingservice.util.ParseNum;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.openqa.selenium.*;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * 상품의 상세페이지 크롤링하기
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class DetailPageService {
    private final ParseNum parseNum;
    private final FinalUrlResolver finalUrlResolver;

    /**
     * 상품상세 페이지 얻어온 데이터를 파싱하는 메서드<br>
     * -주종, 종류, 리뷰목록, 가격목록, 상품정보
     * @param productDTO //상품목록페이지에서 받아온 정보
     * @param driver // 사용하던 크롬 드라이버
     * @return productDTO로 반환
     */
    public ProductDTO detailPage(ProductDTO productDTO, WebDriver driver) {
        ProductDTO item = productDTO;
        try {
            //상세페이지 html 얻기
            String html = driver.getPageSource();
            if(html != null){
                //상세페이지 ui 조사
                Document doc = Jsoup.parse(html, "https://prod.danawa.com");

                //상품정보 가져오기
                item.setContent(isContent(doc));


                //상품 주종 및 종류 ,정보 가져오기
                String category = getCategory(doc).get(0);
                String kind= getCategory(doc).get(1);
                item.setCategory(category);
                item.setProductKind(kind);

                //리뷰페이지 넘아기기 반복문 후 파싱
                item.setReviews(getReviews(driver,html));

                //가격들을 저장할 리스트
                List<PriceDTO> priceList = getPrices(doc,driver);
                item.setPrices(priceList);
            }

        }
        catch (Exception e){
            log.error("상품 '{}' 상세 페이지 크롤링 실패: {}", productDTO.getProductName(), e.getMessage());
        }
        return item;
    }

    /**
     * 상품 리뷰 데이터 구하기<br>
     *
     * @param driver 상품목록 때 사용한 driver 재사용
     * @param html 상품상세페이지 html
     * @return 리부리스트 반환
     */
    public List<ReviewDTO> getReviews(WebDriver driver, String html) {
        List<ReviewDTO> reviews = new ArrayList<>();
        //페이지 초기화
        int pageCount =1;
        while (true){
            try {
                //다음페이지로 넘어가는 UI이 조회

                //현재 페이지
                Document doc = Jsoup.parse(html, "https://prod.danawa.com");

                //리뷰 가져오기
                for (Element li : doc.select("li.danawa-prodBlog-companyReview-clazz-more")){
                    ReviewDTO review = new ReviewDTO();
                    //작성자
                    Element nameEl = li.selectFirst(".top_info .name");
                    if (nameEl != null) review.setReviewer(nameEl.text().trim());

                    //작성일
                    Element dateEl = li.selectFirst(".top_info .date");
                    if (dateEl != null) review.setReviewDate(dateEl.text().trim());

                    //별점
                    int star = 0;
                    Element starEl = li.selectFirst(".top_info .star_mask");
                    if (starEl != null) {
                        String t = starEl.text();//점수 예) "100점"
                        if (!t.isEmpty()) {
                            star = parseNum.getNum(t);
                        } else {
                            String w = starEl.attr("style");// style에 있는 width 예) "width:100%"
                            if (!w.isEmpty()) star = parseNum.getNum(w);
                        }
                    }
                    review.setStar(star);

                    //쇼핑물명
                    String shopName = null;
                    //1차로 저회
                    Element mallImg = li.selectFirst(".top_info .mall img[alt]");
                    if (mallImg != null && !mallImg.attr("alt").isBlank()) {
                        shopName = mallImg.attr("alt").trim();
                    }
                    if (shopName == null) {
                        //2차 조회
                        Element mallSpan = li.selectFirst(".top_info .mall span");
                        if (mallSpan != null) shopName = mallSpan.text().trim();
                    }
                    review.setShopName(shopName);

                    //리뷰제목
                    Element titleEl = li.selectFirst(".rvw_atc .tit_W .tit");
                    if (titleEl != null) review.setTitle(titleEl.text().trim());

                    //내용
                    Element contentEl = li.selectFirst(".rvw_atc .atc_cont .atc");
                    if (contentEl != null) review.setContent(contentEl.text().trim());

                    //리뷰정보 목록에 추가
                    reviews.add(review);
                }

                //최대페이지 설정
                int MAX_PAGES = 3;
                //다음 리뷰페이지 전환 UI 모음
                List<WebElement> next = driver.findElements(By
                        .cssSelector(
                                "div.page_nav_area .nums_area .page_num.now_page + a.page_num"));

                //최대페이지 도달
                if(pageCount > MAX_PAGES){
                    log.debug("최대 패이지 도달했습니다");
                    break;
                }
                //마지막페이지 도달
                if(next.isEmpty()){
                    log.debug("리뷰 마지막패이지 도달했습니다");
                    break;
                }

                //다음페이지로 넘가기기 클릭
                WebElement nextReview = next.getFirst();
                WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
                wait.until(ExpectedConditions.elementToBeClickable(nextReview));
                try {
                    //일반적인 클릭 시도
                    nextReview.click();
                } catch (ElementNotInteractableException ex) {
                    //실패 시 JavaScript로 클릭 시도
                    ((JavascriptExecutor) driver).executeScript("arguments[0].click();", nextReview);
                }
                //페이지 카운터 증가
                pageCount++;
                //새로운 페이지 로딩 대기
                Thread.sleep(2000);
                //새로운 페이지 html 확득
                html = driver.getPageSource();

            }catch (InterruptedException e){
                log.debug("리뷰 수집 중 스레드 중단");
                Thread.currentThread().interrupt();
                break;
            }catch (TimeoutException e){
                log.debug("페이딩 로딩 시간 초과");
                break;
            }catch (NoSuchElementException e){
                log.debug("다음 버튼을 찾을 수 없음");
                break;
            } catch (StaleElementReferenceException  e) {
                try {
                    //패이지 새로고침
                    driver.navigate().refresh();
                    Thread.sleep(3000);
                    html = driver.getPageSource();
                    continue;
                } catch (InterruptedException ex) {
                    log.debug("페이지 새로 고침 실패 {}",ex.getMessage());
                }
            }catch (WebDriverException e){
                log.error("Chrome Driver 오류 발생 : {}",e.getMessage());
                break;
            }catch (Exception e){
                log.error("리뷰 수집 중 예기치 못할 오류 발생 {}",e.getMessage());
            }
        }
        return reviews;
    }

    /**
     * 상품 주종과 종류를 파싱하기
     * @param doc 파싱을 html
     * @return index(0)=category<br>
     * index(1)=kind<br>
     * index(2)=content
     * 인 String 리스트 반환
     */
    public List<String> getCategory(Document doc){
        List<String> ck = new ArrayList<>();
        Element root =
                doc.selectFirst("table:has(th:matchesOwn(^\\s*주종\\s*$)), " +   // '주종' th를 가진 테이블
                        "#infoBottom, #productSpec, .prod_spec, .detail_info"); // 페이지별 ID/클래스
        String category = null;
        String kind     = null;
        if(root != null){
            // "...종류 " 아래에 있는 <td> 찾기
            Element tdKindFirst = root.selectFirst(
                    "tr > th.tit:matchesOwn(종\\s*류\\s*(?:[:：])?\\s*$) + td.dsc"
            );
            //첫번째 <td> 찾기
            if (tdKindFirst != null) {
                //상품 종류 파싱(위스키, 레드와인 등)
                kind = tdKindFirst.text().trim();
                if (kind.isEmpty()) kind = null;
            }

            //주종 찾기
            Element tdCategory = root.selectFirst(
                    "tr:has(> th.tit:matchesOwn(^\\s*주종\\s*$)) > td.dsc"
            );
            //상품 주종 파싱
            if (tdCategory != null) {
                category = tdCategory.text().trim();
            }
        }


        ck.add(category); // index(0)
        ck.add(kind); // index(1)
        return ck;
    }

    /**
     * 상품 가격 리스트 구하기<br>
     * 쇼핑물, 쇼핑몰 아이콘, 가격, 배송비, 구매링크
     * @param doc 파싱할 html
     * @return 상품 가격 리스트 반환
     */
    public List<PriceDTO> getPrices(Document doc,WebDriver driver) {
        List<PriceDTO> prices = new ArrayList<>();
        for(Element element : doc.select("#lowPriceCompanyArea ul.list__mall-price li.list-item")) {
            PriceDTO price = new PriceDTO();

            //쇼핑몰 구하기
            Element logoImg = element.selectFirst(".box__logo img.image[alt]");
            if (logoImg != null) {
                price.setShopName(logoImg.attr("alt").trim());
                String icon = logoImg.attr("abs:src");
                if (icon.isEmpty()) {
                    icon = logoImg.attr("src");
                    if (icon.startsWith("//")) icon = "https:" + icon;
                }
                price.setShopIcon(icon);
            } else {
                //텍스트 로고 처리(술픽 등)
                Element textLogo = element.selectFirst(".box__logo .text__logo");
                if (textLogo != null) {
                    String name = textLogo.hasAttr("aria-label")
                            ? textLogo.attr("aria-label").trim()
                            : textLogo.text().trim();
                    price.setShopName(name);
                }
                // 아이콘은 없음(null 허용)
            }


            //가격
            Element priceNum = element.selectFirst(".box__price .sell-price .text__num");
            if (priceNum != null) {
                //숫자만 얻어오기
                price.setPrice(parseNum.getNum(priceNum.text()));
            }

            //배송비
            Element delivery = element.selectFirst(".box__delivery");
            if (delivery != null) {
                String d = delivery.text().trim();
                //무료라고 적혀있으면 0, 배송비 끝 '원'제거하고 숫자로 저장
                int fee = d.contains("무료") ? 0 : parseNum.getNum(d);
                price.setDeliveryFee(fee);
            }
            //구매사이트
            Element link = element.selectFirst("a.link__full-cover[href]");
            if (link != null) {
                //상세페이지에 있는 구매사이트 링크 대입
                String url = link.attr("href");
                //로딩 페이지 없는 최종 사이트 링크 추출
                String finalUrl = finalUrlResolver.resolve(url,driver);
                log.debug("{}의 최종 상품구매링크 {}",price.getShopName(),finalUrl);
                if(!finalUrl.isEmpty()){
                    price.setShopLink(finalUrl);
                }
            }
            prices.add(price);
        }

        return  prices;
    }

    /**
     * 상품정보 구하기
     * @param doc 파싱 할 html 정보
     * @return String content 반환
     */
    public String isContent(Document doc) {
        String content = null;
        //가져온 html를 텍스트화
        String fullText = doc.text();
        //제품설명 앞뒤 공백 및 허용하고 한글이 아닌 글자 제거(그릅1)하고 각 줄에 최소 한 글자 이상의 한글이 포함된 열 구하기(그릅2)
        Pattern pattern = java.util.regex.Pattern.compile(
                "제품\\s*설명\\s*([^가-힣]*?)([가-힣][^\\n]*(?:\\n[^가-힣\\n]*[가-힣][^\\n]*)*)",
                Pattern.MULTILINE | Pattern.DOTALL
        );

        //특정 문자열에 검색기 초기화
        Matcher matcher = pattern.matcher(fullText);

        if (matcher.find()) {
            //그룸2의 문자열에서 공백 제거 얻기
            String extracted = matcher.group(2).trim();
            //수상|인증|제조사|본 콘텐츠 앞부분 문자까지 구하기
            extracted = extracted.split("(?=수상|인증|제조사|본 콘텐츠)")[0].trim();
            if (extracted.length() > 10) {
                //불필요한 공백 제거
                content = extracted.replaceAll("\\s{2,}", " ");
            }
        }
        return content;
    }
}
