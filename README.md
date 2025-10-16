# 🪐 Jupiter

> **스마트 주류 가격비교 플랫폼**
> AI 기반 가격 예측과 실시간 최저가 비교를 제공하는 마이크로서비스 아키텍처 기반 웹 애플리케이션

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.4.0%20%7C%203.5.5-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-19.1.1-blue.svg)](https://reactjs.org/)
[![Java](https://img.shields.io/badge/Java-21-orange.svg)](https://www.oracle.com/java/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 목차

- [프로젝트 소개](#-프로젝트-소개)
- [주요 기능](#-주요-기능)
- [기술 스택](#-기술-스택)
- [시스템 아키텍처](#-시스템-아키텍처)
- [프로젝트 구조](#-프로젝트-구조)
- [마이크로서비스](#-마이크로서비스)
- [API 문서](#-api-문서)
- [데이터베이스](#-데이터베이스)
- [팀 구성](#-팀-구성)

---

## 프로젝트 소개

**Ju(酒)piter**는 주류 구매를 더욱 스마트하게 만들어주는 가격비교 플랫폼입니다.

### 왜 Ju(酒)piter인가?

- **💰 최저가 보장**: 여러 쇼핑몰의 가격을 실시간으로 비교하여 최저가를 찾아드립니다
- **🤖 AI 가격 예측**: OpenAI GPT를 활용한 미래 가격 예측으로 최적의 구매 시점을 추천합니다
- **🎯 개인화 추천**: 사용자의 취향을 분석하여 맞춤형 상품을 추천합니다
- **👥 커뮤니티**: 혼술러들을 위한 정보 공유 및 소통 공간을 제공합니다
- **🔔 스마트 알림**: 가격 변동 및 특가 정보를 SMS로 알려드립니다

### 타겟 사용자

- 20-30대 MZ세대
- 가성비를 중시하는 소비자
- 온라인 구매를 선호하는 사용자
- 혼술 및 소량 구매를 선호하는 1인 가구

---

## 주요 기능

### 🛒 상품 관리
- ✅ 실시간 가격 비교 (쿠팡, 이마트몰, 롯데온 등)
- ✅ 카테고리별 상품 검색 및 필터링
- ✅ 가격순/평점순/인기순 정렬
- ✅ 상품 상세 정보 및 리뷰
- ✅ 찜하기 및 좋아요 기능

### 🤖 AI 기능
- ✅ **가격 예측**: 과거 가격 데이터를 분석하여 미래 4주 가격 예측
- ✅ **개인화 추천**: 사용자 취향 기반 맞춤 상품 추천
- ✅ **구매 최적 시점**: AI가 분석한 최적의 구매 타이밍 제안
- ✅ **트렌드 분석**: 실시간 주류 트렌드 및 인기 상품 분석

### 🕷️ 크롤링 시스템
- ✅ 주요 쇼핑몰 자동 크롤링 (Selenium + Jsoup)
- ✅ 실시간 가격 정보 수집 및 업데이트
- ✅ 가격 변동 이력 저장 (AI 학습 데이터)
- ✅ 스케줄링을 통한 정기적 데이터 갱신

### 💬 커뮤니티
- ✅ 자유게시판, 후기, 꿀팁 공유
- ✅ 댓글 및 좋아요 기능
- ✅ 인기글 정렬 및 검색
- ✅ 카테고리별 게시판

### 🔔 알림 시스템
- ✅ SMS 알림 발송 (Cool SMS)
- ✅ 가격 변동 알림
- ✅ 특가/이벤트 알림
- ✅ 커뮤니티 활동 알림
- ✅ 알림 설정 관리 (ON/OFF)

### 🔐 사용자 인증
- ✅ 회원가입/로그인
- ✅ JWT 기반 인증 (Access/Refresh Token)
- ✅ 비밀번호 암호화 (BCrypt)
- ✅ 프로필 관리

---

## 기술 스택

### Backend

#### Framework & Language
- **Java 21** - 최신 LTS 버전
- **Spring Boot 3.4.0 / 3.5.5** - 마이크로서비스 프레임워크
- **Spring Cloud 2025.0.0** - MSA 인프라

#### Microservices Architecture
- **Spring Cloud Gateway** - API Gateway & Routing
- **Netflix Eureka** - Service Discovery
- **Spring Security** - 보안 및 인증
- **JWT** - 토큰 기반 인증

#### Data Access
- **Spring Data JPA** - ORM
- **Hibernate** - JPA 구현체
- **MySQL 8.x** - RDBMS

#### External Libraries
- **Lombok** - 보일러플레이트 코드 제거
- **KOMORAN** - 한국어 형태소 분석
- **Jsoup** - HTML 파싱 (정적 크롤링)
- **Selenium** - 동적 웹 크롤링
- **WebDriverManager** - 브라우저 드라이버 관리
- **OpenAI Java SDK** - AI 가격 예측 및 추천
- **Cool SMS SDK** - SMS 발송
- **Springdoc OpenAPI** - API 문서 자동화 (Swagger)

### Frontend

#### Framework & Library
- **React 19.1.1** - UI 라이브러리
- **Vite 7.1.5** - 빌드 도구
- **TypeScript 4.9.5** - 타입 안정성

#### Styling
- **Tailwind CSS 3.4.17** - 유틸리티 우선 CSS
- **PostCSS** - CSS 전처리
- **Autoprefixer** - 브라우저 호환성

#### State Management & Routing
- **React Router Dom 7.8.2** - 클라이언트 사이드 라우팅
- **TanStack React Query 5.89.0** - 서버 상태 관리

#### Data Visualization
- **Chart.js 4.5.0** - 차트 라이브러리
- **React Chart.js 2 5.3.0** - React 래퍼

#### Testing
- **Vitest 3.2.4** - 단위 테스트
- **jsdom 27.0.0** - DOM 환경 시뮬레이션

### DevOps & Tools
- **Git/GitHub** - 버전 관리
- **Gradle** - 빌드 도구
- **IntelliJ IDEA** - Java IDE
- **VS Code** - 프론트엔드 개발
- **Postman** - API 테스트
- **MySQL Workbench** - 데이터베이스 관리

---

## 시스템 아키텍처

```
┌─────────────────────────────────────────────────┐
│              Frontend Layer                     │
│         React 19 + Vite + Tailwind              │
└─────────────────┬───────────────────────────────┘
                  │ HTTP/REST
┌─────────────────▼───────────────────────────────┐
│          API Gateway (Port 8080)                │
│         Spring Cloud Gateway                    │
│    - 라우팅 - JWT 인증 - CORS - 로깅                │
└─────────────────┬───────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────┐
│      Service Discovery (Port 8761)              │
│           Netflix Eureka Server                 │
└─────────────────┬───────────────────────────────┘
                  │
        ┌─────────┴──────────┐
        │                    │
┌───────▼────────┐  ┌────────▼────────┐
│ Auth Service   │  │Product Service  │
│   (인증/회원)    │  │   (상품 관리)      │
└────────────────┘  └─────────────────┘

┌────────────────┐  ┌─────────────────┐
│Crawling Service│  │  GPT Service    │
│    (크롤링)      │  │  (AI 예측)       │
└────────────────┘  └─────────────────┘

┌────────────────┐  ┌─────────────────┐
│Community Svc   │  │Notification Svc │
│   (커뮤니티)     │  │    (알림)         │
└────────────────┘  └─────────────────┘
        │                    │
        └─────────┬──────────┘
                  │
┌─────────────────▼───────────────────────────────┐
│              Data Layer                         │
│    MySQL Database + External APIs               │
│    (OpenAI GPT, Cool SMS)                       │
└─────────────────────────────────────────────────┘
```

### 마이크로서비스 간 통신

- **동기 통신**: REST API (RestTemplate/WebClient)
- **Service Discovery**: Eureka를 통한 서비스 탐색
- **API Gateway**: 단일 진입점, JWT 검증, 라우팅

---

## 프로젝트 구조

```
jupiter/
├── 📂 eureka-service/              # Service Discovery
│   └── src/main/
│       ├── java/
│       └── resources/
│           └── application.properties
│
├── 📂 gateway-service/             # API Gateway
│   └── src/main/
│       ├── java/
│       │   └── filter/             # JWT 필터 등
│       └── resources/
│           └── application.properties
│
├── 📂 auth-service/                # 인증/회원 서비스
│   └── src/main/
│       ├── java/
│       │   ├── controller/
│       │   ├── service/
│       │   ├── repository/
│       │   ├── domain/             # User Entity
│       │   └── security/           # JWT, Security Config
│       └── resources/
│           └── application.properties
│
├── 📂 product-service/             # 상품 관리 서비스
│   └── src/main/
│       ├── java/
│       │   ├── controller/
│       │   ├── service/
│       │   ├── repository/
│       │   └── domain/             # Product, Price, Review, Shop 등
│       └── resources/
│           └──application.properties
│
├── 📂 crawling-service/            # 크롤링 서비스
│   └── src/main/
│       ├── java/
│       │   ├── crawler/            # Selenium, Jsoup 크롤러
│       │   ├── scheduler/          # 스케줄링
│       │   └── domain/
│       └── resources/
│           └── application.properties
│
├── 📂 gpt-service/                 # AI 추천 서비스
│   └── src/main/
│       ├── java/
│       │   ├── controller/
│       │   ├── service/            # OpenAI API 연동
│       │   └── dto/
│       └── resources/
│           └── application.properties
│
├── 📂 community-service/           # 커뮤니티 서비스
│   └── src/main/
│       ├── java/
│       │   ├── controller/
│       │   ├── service/
│       │   ├── repository/
│       │   └── domain/             # Post, Comment
│       └── resources/
│           └── application.properties
│
├── 📂 notification-service/        # 알림 서비스
│   └── src/main/
│       ├── java/
│       │   ├── controller/
│       │   ├── service/            # Cool SMS 연동
│       │   └── domain/             # Notification
│       └── resources/
│           └── application.properties
│
├── 📂 frontend/                    # React 프론트엔드
│   ├── src/
│   │   ├── components/             # 재사용 컴포넌트
│   │   │   ├── layout/             # Header, Footer
│   │   │   ├── auth/               # 로그인 모달 등
│   │   │   └── sections/           # 페이지 섹션
│   │   ├── pages/                  # 페이지 컴포넌트
│   │   │   ├── Home.jsx
│   │   │   ├── Shop.jsx
│   │   │   ├── ProductDetail.jsx
│   │   │   ├── Community.jsx
│   │   │   ├── MyPage.jsx
│   │   │   └── ...
│   │   ├── services/               # API 호출 서비스
│   │   ├── utils/                  # 유틸리티 함수
│   │   ├── App.jsx                 # 메인 앱 (라우터)
│   │   └── index.jsx               # 진입점
│   ├── public/                     # 정적 파일
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── README.md
│
├── 📂 uploads/                     # 파일 업로드 디렉토리
├── 📄 settings.gradle              # Gradle 멀티 프로젝트 설정
├── 📄 build.gradle                 # Gradle 빌드 설정
└── 📄 README.md                    # 프로젝트 문서

```
---

## 마이크로서비스

### 1️⃣ Eureka Service (Port 8761)
**Service Discovery**
- 모든 마이크로서비스 등록 및 탐색
- 서비스 헬스 체크
- Eureka Dashboard: http://localhost:8761

### 2️⃣ Gateway Service (Port 8080)
**API Gateway**
- 모든 API 요청의 단일 진입점
- JWT 인증 필터
- 라우팅 및 로드 밸런싱
- CORS 설정

**라우팅 규칙:**
```
/api/auth/**         → Auth Service
/api/products/**     → Product Service
/api/crawling/**     → Crawling Service
/api/gpt/**          → GPT Service
/api/community/**    → Community Service
/api/notifications/**→ Notification Service
```

### 3️⃣ Auth Service
**인증 및 회원 관리**
- 회원가입/로그인/로그아웃
- JWT 토큰 발급 및 검증 (Access/Refresh Token)
- 비밀번호 암호화 (BCrypt)
- 프로필 관리

**주요 API:**
- `POST /api/auth/register` - 회원가입
- `POST /api/auth/login` - 로그인
- `POST /api/auth/refresh` - 토큰 갱신
- `GET /api/auth/me` - 내 정보 조회

### 4️⃣ Product Service
**상품 관리**
- 상품 CRUD
- 카테고리별 조회 및 검색
- 가격 비교 (여러 쇼핑몰)
- 리뷰 및 평점 관리
- 찜하기/좋아요 기능
- 사용자 활동 추적 (UserActivity)

**주요 API:**
- `GET /api/products` - 상품 목록
- `GET /api/products/{id}` - 상품 상세
- `GET /api/products/search?keyword=소주` - 검색
- `POST /api/products/{id}/review` - 리뷰 작성

### 5️⃣ Crawling Service
**웹 크롤링**
- 주요 쇼핑몰 가격 정보 수집
- Selenium (동적 페이지) + Jsoup (정적 페이지)
- 스케줄링을 통한 자동 갱신
- 가격 변동 이력 저장 (PriceLog)

**크롤링 대상:**
- 다나와 (Danawa)
- 11번가 (11st)
- 키햐 (Kihya)

### 6️⃣ GPT Service
**AI 추천 및 예측**
- OpenAI GPT API 연동
- 가격 예측 (과거 데이터 → 미래 4주)
- 개인화 상품 추천
- 구매 최적 시점 제안
- 트렌드 분석

**주요 API:**
- `POST /api/gpt/predict-price` - 가격 예측
- `POST /api/gpt/recommend` - 상품 추천
- `POST /api/gpt/explain` - 추천 이유 설명

### 7️⃣ Community Service
**커뮤니티**
- 게시글 CRUD (작성/조회/수정/삭제)
- 댓글 기능
- 좋아요 및 조회수
- 카테고리별 게시판 (자유, 후기, 꿀팁, Q&A)
- 검색 및 페이징

**주요 API:**
- `GET /api/community/posts` - 게시글 목록
- `POST /api/community/posts` - 게시글 작성
- `POST /api/community/posts/{id}/comments` - 댓글 작성

### 8️⃣ Notification Service
**알림 시스템**
- SMS 발송 (Cool SMS API)
- 가격 변동 알림
- 특가/이벤트 알림
- 커뮤니티 활동 알림
- 알림 설정 관리

**주요 API:**
- `POST /api/notifications/send` - 알림 발송
- `GET /api/notifications` - 내 알림 목록
- `PUT /api/notifications/settings` - 알림 설정

---

## API 문서

### Swagger UI

각 서비스별 Swagger UI를 통해 API 문서를 확인할 수 있습니다.

- **Auth Service:** `http://localhost:8081/swagger-ui.html`
- **GPT Service:** `http://localhost:8082/swagger-ui.html`
- **Community Service:** `http://localhost:8084/swagger-ui.html`

> **참고:** `product-service`, `crawling-service`, `notification-service`는 별도의 API 문서가 제공되지 않으며, 주로 내부 통신에 사용됩니다.
---

## 데이터베이스

### ERD (Entity Relationship Diagram)

> **참고:** 아래 ERD는 `product-service`를 기준으로 작성되었으며, `auth-service`, `community-service` 등 다른 서비스의 전체 엔티티를 포함하지 않을 수 있습니다.

```
Users (회원)
  ├─ 1:N → UserActivity (찜/좋아요)
  ├─ 1:N → Review (리뷰) - ProductShop을 통해 간접 연결
  ├─ 1:N → Post (게시글)
  ├─ 1:N → Comment (댓글)
  └─ 1:N → Notification (알림)

TopCategory (대분류)
  └─ 1:N → SubCategory (소분류)
              └─ 1:N → Product (상품)
                         ├─ 1:N → UserProductScore (추천 점수)
                         └─ N:M → Shop (쇼핑몰) via ProductShop
                                     ├─ 1:N → Price (현재 가격)
                                     │         └─ 1:N → PriceLog (가격 이력)
                                     └─ 1:N → Review (리뷰)
```

### 주요 테이블

- `users` - 회원 정보 (`auth-service`)
- `products` - 상품 정보 (`product-service`)
- `top_category`, `sub_category` - 카테고리 정보 (`product-service`)
- `shops` - 쇼핑몰 정보 (`product-service`)
- `product_shop` - 상품-쇼핑몰 연결 (`product-service`)
- `prices` - 현재 가격 (`product-service`)
- `price_logs` - 가격 이력 (AI 학습용) (`product-service`)
- `reviews` - 리뷰 (`product-service`)
- `user_activity` - 사용자 활동 (클릭, 찜하기) (`product-service`)
- `user_product_scores` - 개인화 추천 점수 (`product-service`)
- `posts` - 커뮤니티 게시글 (`community-service`)
- `comments` - 댓글 (`community-service`)
- `notifications` - 알림 (`notification-service`)

---

## 보안

- ✅ JWT 기반 인증 (Access/Refresh Token)
- ✅ BCrypt 비밀번호 암호화
- ✅ CORS 설정
- ✅ SQL Injection 방지 (JPA/PreparedStatement)
- ✅ XSS 방지 (입력 검증 및 이스케이핑)
- ⚠️ HTTPS 적용 권장 (프로덕션 환경)

---

## 트러블슈팅

### 크롤링 실패 시
- User-Agent 확인
- 크롤링 간격 조정 (Rate Limiting)
- Selenium WebDriver 버전 확인

### JWT 인증 오류 시
- 토큰 만료 확인
- JWT_SECRET 환경 변수 확인
- Gateway 필터 설정 확인

### Eureka 서비스 등록 실패 시
- Eureka Server 실행 확인
- `eureka.client.service-url.defaultZone` 설정 확인
- 네트워크 연결 확인

---

## 로드맵

### v1.0 (현재)
- ✅ MSA 기반 8개 서비스 구축
- ✅ AI 가격 예측 시스템
- ✅ 실시간 크롤링
- ✅ 커뮤니티
- ✅ SMS 알림

### v1.1 (단기)
- [ ] 모바일 앱 (React Native)
- [ ] OAuth 2.0 소셜 로그인
- [ ] Redis 캐싱
- [ ] 푸시 알림

### v2.0 (중기)
- [ ] 카테고리 확장 (안주, 주류 용품)
- [ ] AI 챗봇
- [ ] 그룹 구매 기능
- [ ] 프리미엄 멤버십

### v3.0 (장기)
- [ ] 글로벌 확장 (다국어)
- [ ] 블록체인 리뷰 검증
- [ ] AR 가상 시음
- [ ] 빅데이터 대시보드

---

## 팀 구성

| 이름  | 역할 | 담당 업무 | GitHub                                      |
|-----|------|-----------|---------------------------------------------|
| 박종서 | 팀장/백엔드 | Auth, Gateway Service | [@JongSeo](https://github.com/jongseo0703)  |
| 손소희 | 백엔드 | Product, Crawling Service | [@Sohee Son](https://github.com/sohee00314) |
| 인희진 | 백엔드 | GPT, Community Service | [@heeezni](https://github.com/heeezni) |
| 박종서 | 백엔드/인프라 | Notification, Eureka Service | [@JongSeo](https://github.com/jongseo0703)  |
| 인희진 | 프론트엔드 | React 애플리케이션 | [@heeezni](https://github.com/heeezni)  |


---

이 프로젝트는 다음 오픈소스 프로젝트들의 도움을 받았습니다:

- [Spring Boot](https://spring.io/projects/spring-boot)
- [React](https://reactjs.org/)
- [Chart.js](https://www.chartjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [OpenAI](https://openai.com/)
- [Selenium](https://www.selenium.dev/)
- [Jsoup](https://jsoup.org/)

---

<div align="center">

<b> 🪐 Jupiter - 스마트한 주류 구매의 시작 </b>

</div>
