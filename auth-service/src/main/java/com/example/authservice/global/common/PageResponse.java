package com.example.authservice.global.common;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/** 페이징 처리된 데이터를 API 응답으로 반환하기 위한 클래스임. */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PageResponse<T> {
  private List<T> content;
  private int page;
  private int size;
  private long totalElements;
  private int totalPage;
  private boolean first;
  private boolean last;

  public static <T> PageResponse<T> of(List<T> content, int page, int size, long totalElements) {
    int totalPages = (int) Math.ceil((double) totalElements / size);
    boolean isFirst = page == 0;
    boolean isLast = page >= totalPages - 1;

    return new PageResponse<>(content, page, size, totalElements, totalPages, isFirst, isLast);
  }
}
