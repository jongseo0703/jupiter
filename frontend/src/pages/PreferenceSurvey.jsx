import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const PreferenceSurvey = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    preferredCategories: [],
    priceRange: '',
    alcoholStrength: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const categories = [
    { value: '위스키', label: '위스키', icon: '🥃', subcategoryId: 1 }, // 스카치 위스키
    { value: '와인', label: '와인', icon: '🍷', subcategoryId: 3 }, // 레드 와인
    { value: '맥주', label: '맥주', icon: '🍺', subcategoryId: 5 }, // 라거
    { value: '막걸리', label: '막걸리', icon: '🍶', subcategoryId: 7 }, // 막걸리
    { value: '전통주', label: '전통주', icon: '🍶', subcategoryId: 8 }, // 청주
    { value: 'IPA', label: 'IPA', icon: '🍺', subcategoryId: 6 }, // IPA
    { value: '버번', label: '버번', icon: '🥃', subcategoryId: 2 }, // 버번 위스키
    { value: '화이트와인', label: '화이트와인', icon: '🍷', subcategoryId: 4 } // 화이트 와인
  ];

  const priceRanges = [
    { value: 'LOW', label: '~20,000원', description: '부담 없는 가격대' },
    { value: 'MEDIUM', label: '20,000~50,000원', description: '적당한 가격대' },
    { value: 'HIGH', label: '50,000원 이상', description: '프리미엄 가격대' }
  ];

  const alcoholStrengths = [
    { value: 'LOW', label: '낮은 도수 (~15%)', description: '부드럽고 가벼운' },
    { value: 'MEDIUM', label: '중간 도수 (15~30%)', description: '적당한 알코올' },
    { value: 'HIGH', label: '높은 도수 (30% 이상)', description: '강한 알코올' }
  ];

  const handleCategoryToggle = (category) => {
    setFormData(prev => ({
      ...prev,
      preferredCategories: prev.preferredCategories.includes(category)
        ? prev.preferredCategories.filter(c => c !== category)
        : [...prev.preferredCategories, category]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.preferredCategories.length === 0) {
      setError('최소 1개 이상의 카테고리를 선택해주세요');
      return;
    }

    if (!formData.priceRange) {
      setError('가격대를 선택해주세요');
      return;
    }

    if (!formData.alcoholStrength) {
      setError('선호 도수를 선택해주세요');
      return;
    }

    try {
      setLoading(true);
      await api.post('/auth/api/v1/preferences', formData);

      // 선택한 모든 카테고리의 subcategoryId를 배열로 localStorage에 저장
      const selectedSubcategoryIds = formData.preferredCategories
        .map(categoryValue => {
          const categoryData = categories.find(cat => cat.value === categoryValue);
          return categoryData ? categoryData.subcategoryId : null;
        })
        .filter(id => id !== null);

      if (selectedSubcategoryIds.length > 0) {
        localStorage.setItem('preferredSubcategoryIds', JSON.stringify(selectedSubcategoryIds));
        console.log('설문 기반 추천용 subcategoryIds 저장:', selectedSubcategoryIds);
      }

      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || '설문 저장에 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    try {
      setLoading(true);
      await api.post('/auth/api/v1/preferences/skip');
      navigate('/');
    } catch (err) {
      setError('설문 건너뛰기에 실패했습니다');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* 헤더 */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              🍾 주류 선호도 설문
            </h1>
            <p className="text-gray-600">
              회원님의 취향에 맞는 주류를 추천해드리기 위한 간단한 설문입니다
            </p>
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* 선호 카테고리 */}
            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-4">
                1. 선호하는 주류 종류를 선택해주세요 (복수 선택 가능)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {categories.map((category) => (
                  <button
                    key={category.value}
                    type="button"
                    onClick={() => handleCategoryToggle(category.value)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      formData.preferredCategories.includes(category.value)
                        ? 'border-primary bg-blue-50 shadow-md'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-3xl mb-2">{category.icon}</div>
                    <div className="text-sm font-medium text-gray-900">
                      {category.label}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 가격대 */}
            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-4">
                2. 선호하는 가격대를 선택해주세요
              </label>
              <div className="space-y-3">
                {priceRanges.map((range) => (
                  <button
                    key={range.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, priceRange: range.value }))}
                    className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                      formData.priceRange === range.value
                        ? 'border-primary bg-blue-50 shadow-md'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-semibold text-gray-900">{range.label}</div>
                    <div className="text-sm text-gray-600">{range.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 선호 도수 */}
            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-4">
                3. 선호하는 알코올 도수를 선택해주세요
              </label>
              <div className="space-y-3">
                {alcoholStrengths.map((strength) => (
                  <button
                    key={strength.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, alcoholStrength: strength.value }))}
                    className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                      formData.alcoholStrength === strength.value
                        ? 'border-primary bg-blue-50 shadow-md'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-semibold text-gray-900">{strength.label}</div>
                    <div className="text-sm text-gray-600">{strength.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 버튼 */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={handleSkip}
                disabled={loading}
                className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                건너뛰기
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 px-4 bg-primary text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '저장 중...' : '완료'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PreferenceSurvey;