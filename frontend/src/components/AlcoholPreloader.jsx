import { useState, useEffect } from 'react';

function AlcoholPreloader({ isLoading, handleLoadingComplete }) {
  const [currentIconIndex, setCurrentIconIndex] = useState(0);

  const alcoholIcons = [
    '🍷', // 와인잔
    '🍺', // 맥주잔
    '🍾', // 샴페인병
    '🍶', // 소주병
    '🥃', // 위스키잔
    '🍻', // 맥주 건배
    '🥂', // 샴페인 건배
    '🍸'  // 칵테일
  ];

  useEffect(() => {
    if (!isLoading) return;

    const interval = setInterval(() => {
      setCurrentIconIndex((prev) => (prev + 1) % alcoholIcons.length);
    }, 200);

    return () => clearInterval(interval);
  }, [isLoading, alcoholIcons.length]);

  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => {
        // 전달받은 함수 호출
        handleLoadingComplete?.(); // 없으면 그냥 무시, 있으면 호출 (옵셔널 체이닝)
      }, 800);

      return () => clearTimeout(timer);
    }
  }, [isLoading, handleLoadingComplete]);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl p-8 shadow-2xl text-center max-w-sm mx-4">
        <div className="relative mb-8">
          <div className="relative w-32 h-32 mx-auto">
            <div className="absolute inset-0 border-4 border-gray-200 border-t-yellow-400 rounded-full animate-spin"></div>

            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-6xl">
                {alcoholIcons[currentIconIndex]}
              </span>
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          주류 정보를 불러오는 중...
        </h2>

        <div className="flex justify-center space-x-2">
          <div className="w-3 h-3 bg-yellow-400 rounded-full animate-bounce" style={{ animationTimingFunction: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)' }}></div>
          <div className="w-3 h-3 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s', animationTimingFunction: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)' }}></div>
          <div className="w-3 h-3 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s', animationTimingFunction: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)' }}></div>
        </div>
      </div>
    </div>
  );
}

export default AlcoholPreloader;