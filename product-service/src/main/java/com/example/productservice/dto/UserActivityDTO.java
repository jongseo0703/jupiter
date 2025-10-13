package com.example.productservice.dto;

import com.example.productservice.domain.UserActivity;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserActivityDTO {
    private Long userId;
    private Integer productId;
    private UserActivity.ActivityType activityType;
}
