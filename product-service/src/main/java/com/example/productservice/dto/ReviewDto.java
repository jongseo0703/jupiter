package com.example.productservice.dto;

import lombok.Data;
/**리뷰 DTO 클래스
 * <ul>
 *     <li>reviewId : 아이디</li>
 *     <li>writer : 작성자</li>
 *     <li>rating : 별점</li>
 *     <li>reviewDate : 작성일</li>
 *     <li>title : 제목</li>
 *     <li>content : 내용</li>
 *     <li>shopDto : 작성한 상점</li>
 * </ul>
 */
@Data
public class ReviewDto {
    private int reviewId;
    private String writer;
    private int rating;
    private String reviewDate;
    private String title;
    private String content;
    private ShopDto shopDto;
}
