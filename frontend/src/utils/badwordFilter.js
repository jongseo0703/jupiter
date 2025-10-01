// 욕설 및 부적절한 단어 필터링 유틸리티

// 필터링할 단어 목록
const badwordList = [
  // 욕설
  '시발', '씨발', 'ㅅㅂ', 'ㅆㅂ', '병신', 'ㅂㅅ', '개새', '새끼', 'ㅅㄲ',
  '좆', '지랄', '닥쳐', '꺼져', '죽어', '미친', 'ㅁㅊ',
  '엿먹', '썅', '개같', '개놈', '년', '존나', 'ㅈㄴ',

  // 비속어 변형
  'fuck', 'shit', 'bitch', 'ass', 'damn',

  // 혐오 표현
  '급식', '틀딱', '한남', '김치녀', '맘충', '맘충이'
];

/**
 * 텍스트에 욕설이나 부적절한 단어가 포함되어 있는지 확인
 * @param {string} text - 검사할 텍스트
 * @returns {boolean} - 부적절한 단어가 포함되어 있으면 true
 */
export const containsBadword = (text) => {
  if (!text) return false;

  const lowerText = text.toLowerCase();
  // 띄어쓰기, 특수문자, 숫자 제거한 버전도 검사
  const normalizedText = lowerText.replace(/[\s\-_.,!?@#$%^&*()~`'"\\|/<>{}[\];:+=0-9]/g, '');

  return badwordList.some(word => {
    const lowerWord = word.toLowerCase();
    // 원본 텍스트와 정규화된 텍스트 모두 검사
    return lowerText.includes(lowerWord) || normalizedText.includes(lowerWord);
  });
};

/**
 * 텍스트에서 발견된 부적절한 단어 목록 반환
 * @param {string} text - 검사할 텍스트
 * @returns {string[]} - 발견된 부적절한 단어 배열
 */
export const findBadword = (text) => {
  if (!text) return [];

  const lowerText = text.toLowerCase();
  // 띄어쓰기, 특수문자, 숫자 제거한 버전도 검사
  const normalizedText = lowerText.replace(/[\s\-_.,!?@#$%^&*()~`'"\\|/<>{}[\];:+=0-9]/g, '');
  const found = [];

  badwordList.forEach(word => {
    const lowerWord = word.toLowerCase();
    // 원본 텍스트와 정규화된 텍스트 모두 검사
    if (lowerText.includes(lowerWord) || normalizedText.includes(lowerWord)) {
      if (!found.includes(word)) {
        found.push(word);
      }
    }
  });

  return found;
};

/**
 * 태그가 유효한지 검사 (욕설 필터링 포함)
 * @param {string} tag - 검사할 태그
 * @returns {Object} - { isValid: boolean, message: string }
 */
export const validateTag = (tag) => {
  if (!tag || tag.trim().length === 0) {
    return { isValid: false, message: '태그를 입력해주세요.' };
  }

  if (tag.length > 20) {
    return { isValid: false, message: '태그는 20자 이하로 입력해주세요.' };
  }

  if (containsBadword(tag)) {
    return { isValid: false, message: '부적절한 단어가 포함되어 있습니다.' };
  }

  return { isValid: true, message: '' };
};