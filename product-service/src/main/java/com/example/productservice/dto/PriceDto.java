package com.example.productservice.dto;

import lombok.Data;
/**가격 DTO 클래스
 * <ul>
 *     <li>priceId : 아이디</li>
 *     <li>price : 가격</li>
 *     <li>deliveryFee : 배송비</li>
 *     <li>link : 구매링크</li>
 *     <li>shopDto : 상점 정보</li>
 * </ul>
 */
@Data
public class PriceDto {
    private int priceId;
    private int price;
    private int deliveryFee;
    private String link;
    private ShopDto shopDto;
}
