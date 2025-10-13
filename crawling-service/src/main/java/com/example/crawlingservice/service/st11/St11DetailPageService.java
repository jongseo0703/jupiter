package com.example.crawlingservice.service.st11;

import com.example.crawlingservice.dto.ProductDTO;
import com.example.crawlingservice.dto.ReviewDTO;
import com.example.crawlingservice.util.CategoryParser;
import com.example.crawlingservice.util.ProductNameParser;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class St11DetailPageService {

    private final ProductNameParser productNameParser;
    private final CategoryParser categoryParser;

    /**
     * 상세 페이지에서 카테고리 추출
     * 구조: 홈 > 전통식품 > 전통주(상위) > 약주/청주(하위)
     * @param driver WebDriver
     * @param product ProductDTO
     */
    public void extractCategories(WebDriver driver, ProductDTO product) {
        try {
            // em.selected 요소들 찾기 (선택된 카테고리들)
            List<WebElement> selectedCategories = driver.findElements(By.cssSelector("em.selected"));

            // 전통식품(0) > 상위 카테고리(1) > 하위 카테고리(2) 구조
            if (selectedCategories.size() >= 3) {
                // 상위 카테고리 추출
                String rawCategory = selectedCategories.get(1).getText().trim();

                // 하위 카테고리 추출
                String rawProductKind = selectedCategories.get(2).getText().trim();

                // 괄호 제거
                String cleanedCategory = rawCategory != null ? productNameParser.removeBrackets(rawCategory) : null;
                String cleanedProductKind = rawProductKind != null ? productNameParser.removeBrackets(rawProductKind) : null;

                if (cleanedProductKind != null) {
                    // 카테고리면 정규화
                    String normalizedProductKind = categoryParser.normalizeProductKind(cleanedProductKind);
                    product.setProductKind(normalizedProductKind);
                }

                if (cleanedCategory != null) {
                    String adjustedCategory = categoryParser.adjustCategory(cleanedCategory, product.getProductKind());
                    product.setCategory(adjustedCategory);
                }
            }
        } catch (Exception e) {
            log.error("카테고리 추출 중 오류 발생: {}", e.getMessage());
        }
    }

    /**
     * 상세 페이지에서 마지막 상품 이미지 추출
     * @param driver WebDriver
     * @param product ProductDTO
     */
    public void extractProductImage(WebDriver driver, ProductDTO product) {
        try {
            // 상품 이미지목록 추출
            List<WebElement> images = driver.findElements(By.cssSelector("div#productImg div.img_full > img"));

            if (!images.isEmpty()) {
                // 마지막 이미지 선택
                WebElement lastImage = images.get(images.size() - 1);
                String imageUrl = lastImage.getAttribute("src");

                if (imageUrl != null && !imageUrl.isEmpty() && !imageUrl.contains("no_image")) {
                    product.setImageUrl(imageUrl);
                }
            }
        } catch (Exception e) {
            log.error("상품 이미지 추출 중 오류 발생: {}", e.getMessage());
        }
    }

    /**
     * 상세 페이지에서 리뷰 목록 추출
     * @param driver WebDriver
     * @return 리뷰 목록
     */
    public List<ReviewDTO> extractReviews(WebDriver driver) {
        List<ReviewDTO> reviews = new ArrayList<>();

        try {
            JavascriptExecutor js = (JavascriptExecutor) driver;

            // WebDriverWait 생성 (리뷰 최적화)
            WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(5));

            // 리뷰 보기 버튼 확인
            List<WebElement> reviewButtons = driver.findElements(By.cssSelector("a#prdReview"));
            if (reviewButtons.isEmpty()) {
                return reviews;
            }

            // 리뷰 보기 버튼 클릭
            WebElement reviewButton = reviewButtons.get(0);
            js.executeScript("arguments[0].click();", reviewButton);

            // iframe이 로드될 때까지 대기
            try {
                wait.until(ExpectedConditions.frameToBeAvailableAndSwitchToIt(By.id("ifrmReview")));
            } catch (Exception e) {
                return reviews;
            }

            // iframe 내부에서 첫 번째 리뷰가 나타날 때까지 대기
            try {
                wait.until(ExpectedConditions.presenceOfElementLocated(
                    By.cssSelector("li.review_list_element")));
            } catch (Exception e) {
                driver.switchTo().defaultContent(); // iframe에서 나가기
                return reviews;
            }

            // 리뷰 더보기 버튼 클릭
            loadAllReviews(driver);

            // 리뷰 목록 가져오기
            List<WebElement> reviewElements = driver.findElements(By.cssSelector("li.review_list_element"));

            if (reviewElements.isEmpty()) {
                return reviews;
            }
            // 최대 리뷰 개수 정의
            int maxReviews = 20;
            int count = 0;

            for (WebElement element : reviewElements) {
                if (count >= maxReviews) break;

                try {
                    ReviewDTO review = new ReviewDTO();

                    // 작성자
                    try {
                        WebElement nameElement = element.findElement(By.cssSelector("dt.name"));
                        String reviewer = nameElement.getAttribute("data-nick");
                        if (reviewer == null || reviewer.isBlank()) {
                            reviewer = nameElement.getText().trim();
                        }
                        review.setReviewer(reviewer);
                    } catch (Exception ignore) {}

                    // 별점
                    try {
                        WebElement starElement = element.findElement(By.cssSelector("p.grade em"));
                        String starText = starElement.getText().trim();
                        if (!starText.isEmpty()) {
                            review.setStar(Integer.parseInt(starText) * 20);
                        }
                    } catch (Exception ignore) {}

                    // 내용
                    try {
                        WebElement contentElement = element.findElement(By.cssSelector("p.cont_review_hide"));
                        review.setContent(contentElement.getText().trim());
                    } catch (Exception ignore) {}

                    // 날짜
                    try {
                        WebElement dateElement = element.findElement(By.cssSelector("span.date"));
                        review.setReviewDate(dateElement.getText().trim());
                    } catch (Exception ignore) {}

                    // 쇼핑몰 이름
                    review.setShopName("11번가");

                    // 내용이 있는 리뷰만 추가
                    if (review.getContent() != null && !review.getContent().isEmpty()) {
                        reviews.add(review);
                        count++;
                    }

                } catch (Exception e) {
                    // 개별 리뷰 추출 실패
                }
            }

            log.info("총 {}개의 리뷰를 추출했습니다.", reviews.size());

            // iframe에서 메인 페이지로 돌아가기
            driver.switchTo().defaultContent();

        } catch (org.openqa.selenium.TimeoutException e) {
            // 타임아웃 발생 시 빠르게 스킵
            try {
                driver.switchTo().defaultContent();
            } catch (Exception ignored) {}
        } catch (Exception e) {
            // 예외 발생 시에도 iframe에서 나가기
            try {
                driver.switchTo().defaultContent();
            } catch (Exception ignored) {}
        }

        return reviews;
    }


    /**
     * 리뷰 더보기 버튼이 있을 시 자동 클릭 후 리뷰 추출 메서드
     * @param driver WebDriver
     */
    private void loadAllReviews(WebDriver driver) {
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(2));
        //최대 20개로 정의
        int maxReviews = 20;

        try {
            while (true) {
                try {
                    // 현재 로드된 리뷰 개수 확인
                    List<WebElement> currentReviews = driver.findElements(By.cssSelector("ul.area_list li.review_list_element"));

                    if (currentReviews.size() >= maxReviews) {
                        break;
                    }

                    // 리뷰 더보기 버튼 찾기
                    try {
                        WebElement moreButton = wait.until(ExpectedConditions.elementToBeClickable(
                                By.cssSelector("button.c_product_btn.c_product_btn_more8.review-next-list")));

                        if (moreButton != null && moreButton.isDisplayed()) {
                            moreButton.click();
                            Thread.sleep(200);
                        } else {
                            break;
                        }
                    } catch (org.openqa.selenium.TimeoutException e) {
                        // 타임아웃 발생 시 즉시 종료
                        break;
                    }
                } catch (Exception e) {
                    // 더 이상 더보기 버튼이 없으면 종료
                    break;
                }
            }
        } catch (Exception e) {
            // 리뷰 로드 실패
        }
    }

}
