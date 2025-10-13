package com.example.productservice.domain;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

/**
 * 사용자 행동 추적 엔티티 클래스
 * <ul>
 *     <li>activityId : 행동 고유아이디</li>
 *     <li>userId : 사용자 아이디</li>
 *     <li>productId : 상품 아이디</li>
 *     <li>activityType : 행동 타입 (CLICK, FAVORITE)</li>
 *     <li>createdAt : 행동 발생 시간</li>
 * </ul>
 */
@Data
@Entity
@Table(name = "user_activity")
public class UserActivity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long activityId;

    private Long userId;

    private Integer productId;

    @Enumerated(EnumType.STRING)
    private ActivityType activityType;

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public enum ActivityType {
        CLICK,      // 상품 상세 페이지 조회 - 3점
        FAVORITE    // 즐겨찾기 - 5점
    }
}
