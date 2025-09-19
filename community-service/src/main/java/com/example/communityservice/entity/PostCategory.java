package com.example.communityservice.entity;

import lombok.Getter;

@Getter
public enum PostCategory {
  FREE_BOARD("자유게시판"),
  PRICE_INFO("가격정보"),
  LIQUOR_REVIEW("술리뷰"),
  QNA("질문답변"),
  EVENT("이벤트");

  private final String displayName;

  PostCategory(String displayName) {
    this.displayName = displayName;
  }
}
