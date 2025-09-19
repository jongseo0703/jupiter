/**
 * 카테고리 변환 유틸리티 함수들
 */

// 카테고리 매핑 상수
const CATEGORY_MAP = {
  // 영문 -> 한글
  'FREE_BOARD': '자유게시판',
  'PRICE_INFO': '가격정보',
  'LIQUOR_REVIEW': '술리뷰',
  'QNA': '질문답변',
  'EVENT': '이벤트',

  // 한글 -> 영문
  '자유게시판': 'FREE_BOARD',
  '가격정보': 'PRICE_INFO',
  '술리뷰': 'LIQUOR_REVIEW',
  '질문답변': 'QNA',
  '이벤트': 'EVENT'
};

/**
 * 영문 카테고리를 한글로 변환
 * @param {string} englishCategory - 영문 카테고리 (예: 'FREE_BOARD')
 * @returns {string} 한글 카테고리 (예: '자유게시판') 또는 원본값
 */
export const getKoreanCategory = (englishCategory) => {
  return CATEGORY_MAP[englishCategory] || englishCategory;
};

/**
 * 한글 카테고리를 영문으로 변환
 * @param {string} koreanCategory - 한글 카테고리 (예: '자유게시판')
 * @returns {string} 영문 카테고리 (예: 'FREE_BOARD') 또는 원본값
 */
export const getEnglishCategory = (koreanCategory) => {
  return CATEGORY_MAP[koreanCategory] || koreanCategory;
};

/**
 * 모든 카테고리 목록 (한글)
 */
export const KOREAN_CATEGORIES = [
  '자유게시판',
  '가격정보',
  '술리뷰',
  '질문답변',
  '이벤트'
];

/**
 * 모든 카테고리 목록 (영문)
 */
export const ENGLISH_CATEGORIES = [
  'FREE_BOARD',
  'PRICE_INFO',
  'LIQUOR_REVIEW',
  'QNA',
  'EVENT'
];