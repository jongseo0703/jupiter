package com.example.productservice.dto;

import lombok.Data;
/**상점 DTO 클래스
 * <ul>
 *     <li>shopId : 상점 아이디</li>
 *     <li>shopName : 상점명</li>
 *     <li>logoIcon : 로고 아이콘</li>
 * </ul>
 */
@Data
public class ShopDto {
    private int shopId;
    private String shopName;
    private String logoIcon;
}
