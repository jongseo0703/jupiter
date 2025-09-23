package com.example.crawlingservice.domain;

import lombok.Data;

@Data
public class SubCategory {
    private int subCategoryId;
    private String subName;
    private TopCategory topCategory;
}
