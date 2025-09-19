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

/**
 * 카테고리별 색상 및 스타일 설정
 */
export const CATEGORY_STYLES = {
  '자유게시판': {
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800',
    borderColor: 'border-blue-200',
    icon: 'fas fa-comments',
    iconColor: 'text-blue-600'
  },
  '가격정보': {
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    borderColor: 'border-green-200',
    icon: 'fas fa-won-sign',
    iconColor: 'text-green-600'
  },
  '술리뷰': {
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-800',
    borderColor: 'border-purple-200',
    icon: 'fas fa-wine-glass-alt',
    iconColor: 'text-purple-600'
  },
  '질문답변': {
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-800',
    borderColor: 'border-yellow-200',
    icon: 'fas fa-question-circle',
    iconColor: 'text-yellow-600'
  },
  '이벤트': {
    bgColor: 'bg-red-100',
    textColor: 'text-red-800',
    borderColor: 'border-red-200',
    icon: 'fas fa-gift',
    iconColor: 'text-red-600'
  }
};

/**
 * 카테고리의 스타일을 가져오는 함수
 * @param {string} category - 카테고리명 (한글)
 * @returns {object} 카테고리 스타일 객체
 */
export const getCategoryStyle = (category) => {
  return CATEGORY_STYLES[category] || {
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-800',
    borderColor: 'border-gray-200',
    icon: 'fas fa-folder',
    iconColor: 'text-gray-600'
  };
};