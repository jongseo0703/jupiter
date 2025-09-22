package com.example.crawlingservice.config;

import lombok.RequiredArgsConstructor;
import org.apache.ibatis.session.SqlSessionFactory;
import org.mybatis.spring.SqlSessionFactoryBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.sql.DataSource;

/**
 * MyBatis 설정을 명시적으로 정의하는 Configuration 클래스
 */
@Configuration
@RequiredArgsConstructor
public class MyBatisConfig {
    //데이터베이스 연결을 관리해 주는 Java 인터페이스
    private final DataSource dataSource;

    /**
     * SqlSessionFactory를 수동으로 생성하는 메서드<br>
     * - 데이터베이스 연결, SQL 매핑, 트랜잭션 관리를 담당
     * @return SqlSessionFactory 객체를 생성해서 반환
     * @throws Exception 수행 중 발생하는 문제 예외처리
     */
    @Bean
    public SqlSessionFactory sqlSessionFactory() throws Exception {
        //데이터베이스 연결 정보를 주입
        SqlSessionFactoryBean factoryBean = new SqlSessionFactoryBean();
        //데이터베이스 연결 정보를 주입
        factoryBean.setDataSource(dataSource);

        // MyBatis 설정
        org.apache.ibatis.session.Configuration configuration = new org.apache.ibatis.session.Configuration();
        // 데이터베이스의 snake_case 컬럼명을 Java의 camelCase 필드명으로 자동 매핑
        configuration.setMapUnderscoreToCamelCase(true);
        // 한 번에 가져올 레코드 수 설정 (성능 최적화)
        configuration.setDefaultFetchSize(100);
        //설정한 모든 MyBatis 설정을 SqlSessionFactoryBean에 적용
        factoryBean.setConfiguration(configuration);

        return factoryBean.getObject();
    }
}
