package com.example.productservice.config;

import kr.co.shineware.nlp.komoran.constant.DEFAULT_MODEL;
import kr.co.shineware.nlp.komoran.core.Komoran;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Komoran의 인터페이스를 사용하기 위한 config
 */
@Configuration
public class KomoranConfig {
    @Bean
    public Komoran komoran() {
        return new Komoran(DEFAULT_MODEL.FULL);
    }
}
