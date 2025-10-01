package com.example.productservice.service;

import com.example.productservice.domain.SubCategory;
import com.example.productservice.domain.TopCategory;
import com.example.productservice.dto.SubCategoryDto;
import com.example.productservice.dto.TopCategoryDto;
import com.example.productservice.repository.SubCategoryRepository;
import com.example.productservice.repository.TopCategoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
@RequiredArgsConstructor
public class CategoryService {
    private final TopCategoryRepository topCategoryRepository;
    private final SubCategoryRepository subCategoryRepository;

    public Map<TopCategoryDto, List<SubCategoryDto>> getAllCategoryList(){
        Map<TopCategoryDto, List<SubCategoryDto>> map = new HashMap<>();

        //전체 상위 카테고리 조회
        List<TopCategory> topCategories = topCategoryRepository.findAll();

        for (TopCategory topCategory : topCategories) {
            //TopCategoryDto 파싱
            TopCategoryDto topCategoryDto = new TopCategoryDto();
            topCategoryDto.setTopCategoryId(topCategory.getTopcategoryId());
            topCategoryDto.setTopName(topCategory.getTopName());

            //하위카테고리 목록 조회
            List<SubCategory> subCategories= subCategoryRepository.findByTopCategoryTopcategoryId(topCategory.getTopcategoryId());
            //SubCategoryDto 목록 추출
            List<SubCategoryDto> subCategoryDtoList = new ArrayList<>();
            for (SubCategory subCategory : subCategories) {
                SubCategoryDto subCategoryDto = new SubCategoryDto();
                subCategoryDto.setSubCategoryId(subCategory.getSubcategoryId());
                subCategoryDto.setSubName(subCategory.getSubName());
                subCategoryDtoList.add(subCategoryDto);
            }
            map.put(topCategoryDto, subCategoryDtoList);
        }
        return map;
    }
}
