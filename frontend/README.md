# 🛒 Jupiter - 스마트 가격비교 플랫폼

AI 기반 가격 예측 기능을 갖춘 현대적인 쇼핑몰 가격비교 웹 애플리케이션입니다.

## 🚀 기술 스택

### Frontend
- **React 19** - 사용자 인터페이스 라이브러리
- **Vite** - 빠른 빌드 도구 및 개발 서버
- **Tailwind CSS v3** - 유틸리티 기반 CSS 프레임워크
- **Chart.js** - AI 가격 예측 차트 시각화
- **React Chart.js 2** - React용 Chart.js 래퍼
- **React Router Dom** - 클라이언트 사이드 라우팅
- **Vitest** - 빠른 테스트 프레임워크
- **Font Awesome** - 아이콘 라이브러리

### Backend (연동)
- **Spring Boot** - RESTful API 서버
- **OpenAI GPT API** - AI 가격 예측 엔진
- **Java 17** - 백엔드 개발 언어

## ✨ 주요 기능

### 🎯 핵심 기능
- ✅ **AI 가격 예측** - OpenAI GPT 기반 미래 가격 예측 차트
- ✅ **실시간 가격 비교** - 여러 쇼핑몰 가격 한눈에 비교
- ✅ **가격 히스토리 추적** - 시계열 가격 변화 데이터
- ✅ **스마트 상품 검색** - 카테고리별 필터링
- ✅ **상품 상세 정보** - 평점, 리뷰, 스펙 정보

### 🎨 UI/UX
- ✅ **완전 반응형 디자인** - 모바일, 태블릿, 데스크톱 지원
- ✅ **현대적인 인터페이스** - Tailwind CSS 기반 디자인
- ✅ **인터랙티브 차트** - Chart.js 기반 시각화
- ✅ **컴포넌트 기반 아키텍처** - 재사용 가능한 React 컴포넌트
- ✅ **부드러운 애니메이션** - 호버 효과 및 트랜지션

## 🛠️ 시작하기

### 1. 저장소 복제

```bash
git clone https://github.com/heeezni/jupiter-react.git
cd jupiter-react
```

### 2. 의존성 설치

프로젝트에 필요한 패키지를 설치합니다.

```bash
npm install
```

### 3. 백엔드 서버 실행 (AI 가격 예측용)

AI 가격 예측 기능을 사용하려면 OpenAI API 서버를 실행해야 합니다.

```bash
# 별도 터미널에서 OpenAI API 프로젝트로 이동
cd ../OpenAIApi

# OpenAI API 키 환경변수 설정
export OPENAI_API_KEY="your-openai-api-key-here"

# Spring Boot 서버 실행 (포트 7777)
./gradlew bootRun
```

**주의:** OpenAI API 키가 필요합니다. [OpenAI 플랫폼](https://platform.openai.com/api-keys)에서 발급받으세요.

### 4. 프론트엔드 개발 서버 실행

```bash
# jupiter-react 디렉토리에서
npm run dev
```

브라우저에서 [http://localhost:5174](http://localhost:5174)를 열어 확인할 수 있습니다.

## ⚙️ 사용 가능한 스크립트

프로젝트 디렉토리에서 다음 명령어를 실행할 수 있습니다:

### `npm run dev`

Vite 개발 서버를 시작합니다.
브라우저에서 [http://localhost:5173](http://localhost:5173)을 열어 확인할 수 있습니다.

코드를 수정하면 페이지가 즉시 새로고침됩니다 (HMR - Hot Module Replacement).
Create React App보다 훨씬 빠른 개발 서버 시작 속도를 제공합니다.

### `npm run build`

프로덕션용 앱을 `build` 폴더에 빌드합니다.
TypeScript 타입 체크 후 Vite로 최적화된 빌드를 생성합니다.

빌드가 압축되고 파일명에 해시가 포함됩니다.
앱을 배포할 준비가 완료됩니다!

### `npm run preview`

빌드된 앱을 로컬에서 미리보기할 수 있습니다.
프로덕션 빌드가 올바르게 작동하는지 확인할 때 유용합니다.

### `npm test`

Vitest로 테스트를 실행합니다.
빠르고 현대적인 테스트 러너로 Jest보다 빠른 성능을 제공합니다.

## 📁 프로젝트 구조

```
jupiter-react/
├── public/                    # 정적 에셋 (이미지, 폰트 등)
├── src/
│   ├── assets/                # CSS, 이미지 등 리소스
│   ├── components/            # 재사용 가능한 UI 컴포넌트
│   │   ├── auth/              # 인증 관련 컴포넌트 (로그인 모달 등)
│   │   ├── layout/            # 페이지 레이아웃 (헤더, 푸터)
│   │   ├── sections/          # 페이지의 각 섹션
│   │   └── PricePredictionChart.jsx  # AI 가격 예측 차트 컴포넌트
│   ├── pages/                 # 라우팅될 페이지 컴포넌트
│   │   ├── ProductDetail.jsx  # 상품 상세 페이지 (가격 예측 포함)
│   │   └── ...
│   ├── services/              # API 서비스 계층 (TODO: 구현 예정)
│   ├── App.jsx                # 메인 앱 컴포넌트 (라우터 설정)
│   ├── index.css              # 전역 CSS 스타일
│   └── index.jsx              # 애플리케이션 진입점
├── INTEGRATION_GUIDE.md       # 백엔드 API 연동 가이드
├── .gitignore                 # Git이 무시할 파일/폴더 목록
├── index.html                 # Vite 앱의 HTML 템플릿
├── package.json               # 프로젝트 의존성 및 스크립트
├── tailwind.config.js         # Tailwind CSS 설정
└── vite.config.ts             # Vite 설정
```

## 🤖 AI 가격 예측 시스템

### 주요 기능
- **실시간 예측**: OpenAI GPT 모델을 활용한 가격 예측
- **시각화**: Chart.js 기반의 인터랙티브 차트
- **히스토리 분석**: 과거 가격 데이터 기반 미래 예측
- **설명 제공**: AI가 예측 근거 설명 제공

### 데이터 흐름
```
상품 가격 히스토리 → OpenAI API → AI 예측 결과 → Chart.js 시각화
```

### 차트 구성
- **파란색 실선**: 실제 가격 추이 (과거 데이터)
- **빨간색 점선**: AI 예측 가격 (미래 4주)
- **툴팁**: 가격 정보 및 예측 근거 표시

## 🎨 커스텀 컬러 테마

- **Primary**: #81C408 (그린)
- **Secondary**: #FFB524 (오렌지)
- **폰트**: Open Sans

## 🔧 개발 현황

### ✅ 완료된 기능
- AI 가격 예측 시스템
- 반응형 웹 디자인
- 상품 상세 페이지
- 가격 비교 인터페이스
- Chart.js 기반 시각화

### 🚧 개발 중 (TODO)
- 실제 백엔드 API 연동 (현재 하드코딩)
- 크롤링 시스템 연동
- 실시간 가격 업데이트
- 사용자 인증 시스템
- 즐겨찾기 기능

> 📖 **상세 개발 가이드**: [`INTEGRATION_GUIDE.md`](./INTEGRATION_GUIDE.md) 참조

## 🚀 배포

`npm run build` 명령어를 실행하여 생성된 `dist` 폴더의 내용을 웹 서버에 배포할 수 있습니다.
Netlify, Vercel, GitHub Pages와 같은 정적 호스팅 서비스를 사용하면 쉽게 배포할 수 있습니다.

## 🚀 배포 및 운영

### 개발 환경 실행
```bash
# 1. OpenAI API 서버 실행 (포트 7777)
cd ../OpenAIApi && ./gradlew bootRun

# 2. React 개발 서버 실행 (포트 5174)
cd jupiter-react && npm run dev
```

### 프로덕션 빌드
```bash
npm run build
```

### 환경변수 설정
```bash
# .env.local 파일 생성
REACT_APP_API_BASE_URL=http://localhost:8080
REACT_APP_AI_API_BASE_URL=http://localhost:7777
OPENAI_API_KEY=your-openai-api-key
```
