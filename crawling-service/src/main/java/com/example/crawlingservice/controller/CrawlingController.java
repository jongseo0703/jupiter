package com.example.crawlingservice.controller;

import com.example.crawlingservice.dto.ProductDTO;
import com.example.crawlingservice.service.CrawlingService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class CrawlingController {
    //크롤링할 웹사이트 url
    @Value("${website.url}")
    private String url;

    private final CrawlingService crawlingService;

    //전체 상품목록을 추출
    @GetMapping("/crawling")
    public List<ProductDTO> test(){
        return crawlingService.starePage(url);
    }
}
