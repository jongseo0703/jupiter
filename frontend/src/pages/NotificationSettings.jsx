import { useState } from 'react';
import { Link } from 'react-router-dom';

const NotificationSettings = () => {
  const [settings, setSettings] = useState({
    email: 'user@example.com',
    phone: '010-1234-5678',
    emailNotifications: true,
    pushNotifications: true,
    timeStart: '09:00',
    timeEnd: '21:00',
    weekendNotifications: true,
    minDiscountPercent: 5,
    maxDailyNotifications: 10
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = () => {
    // 실제로는 API 호출하여 설정 저장
    console.log('알림 설정 저장:', settings);
    alert('설정이 저장되었습니다.');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 헤더 */}
        <div className="mb-8">
          <Link to="/favorites" className="inline-flex items-center text-primary hover:text-blue-800 mb-4">
            <i className="fas fa-arrow-left mr-2"></i>
            즐겨찾기로 돌아가기
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            <i className="fas fa-bell mr-3 text-primary"></i>
            알림 설정 관리
          </h1>
          <p className="text-gray-600">
            가격 하락 알림을 받을 연락처와 알림 조건을 설정하세요.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 메인 설정 */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6 space-y-8">

              {/* 연락처 정보 */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  <i className="fas fa-address-book mr-2 text-primary"></i>
                  연락처 정보
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      이메일 주소
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={settings.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                      placeholder="이메일을 입력하세요"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      휴대폰 번호
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={settings.phone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                      placeholder="010-0000-0000"
                    />
                  </div>
                </div>
              </div>

              {/* 알림 방법 */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  <i className="fas fa-mobile-alt mr-2 text-primary"></i>
                  알림 방법
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <i className="fas fa-envelope text-blue-500"></i>
                      <div>
                        <h3 className="font-medium text-gray-900">이메일 알림</h3>
                        <p className="text-sm text-gray-600">가격 변동 시 이메일로 알림을 받습니다</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="emailNotifications"
                        checked={settings.emailNotifications}
                        onChange={handleInputChange}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <i className="fas fa-mobile-alt text-green-500"></i>
                      <div>
                        <h3 className="font-medium text-gray-900">모바일 푸시 알림</h3>
                        <p className="text-sm text-gray-600">앱 또는 브라우저로 즉시 알림을 받습니다</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="pushNotifications"
                        checked={settings.pushNotifications}
                        onChange={handleInputChange}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                </div>
              </div>

              {/* 알림 시간 */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  <i className="fas fa-clock mr-2 text-primary"></i>
                  알림 시간 설정
                </h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="timeStart" className="block text-sm font-medium text-gray-700 mb-2">
                        알림 시작 시간
                      </label>
                      <input
                        type="time"
                        id="timeStart"
                        name="timeStart"
                        value={settings.timeStart}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                      />
                    </div>
                    <div>
                      <label htmlFor="timeEnd" className="block text-sm font-medium text-gray-700 mb-2">
                        알림 종료 시간
                      </label>
                      <input
                        type="time"
                        id="timeEnd"
                        name="timeEnd"
                        value={settings.timeEnd}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900">주말 알림</h3>
                      <p className="text-sm text-gray-600">토요일, 일요일에도 알림을 받습니다</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="weekendNotifications"
                        checked={settings.weekendNotifications}
                        onChange={handleInputChange}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                </div>
              </div>

              {/* 알림 조건 */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  <i className="fas fa-percentage mr-2 text-primary"></i>
                  알림 조건
                </h2>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="minDiscountPercent" className="block text-sm font-medium text-gray-700 mb-2">
                      최소 할인율 ({settings.minDiscountPercent}% 이상)
                    </label>
                    <input
                      type="range"
                      id="minDiscountPercent"
                      name="minDiscountPercent"
                      min="1"
                      max="50"
                      value={settings.minDiscountPercent}
                      onChange={handleInputChange}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>1%</span>
                      <span>50%</span>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="maxDailyNotifications" className="block text-sm font-medium text-gray-700 mb-2">
                      일일 최대 알림 개수 ({settings.maxDailyNotifications}개)
                    </label>
                    <input
                      type="range"
                      id="maxDailyNotifications"
                      name="maxDailyNotifications"
                      min="1"
                      max="50"
                      value={settings.maxDailyNotifications}
                      onChange={handleInputChange}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>1개</span>
                      <span>50개</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 저장 버튼 */}
              <div className="pt-6 border-t border-gray-200">
                <button
                  onClick={handleSave}
                  className="w-full bg-primary text-white py-3 px-6 rounded-lg hover:bg-blue-800 transition-colors font-semibold flex items-center justify-center"
                >
                  <i className="fas fa-save mr-2"></i>
                  설정 저장
                </button>
              </div>
            </div>
          </div>

          {/* 사이드바 정보 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                <i className="fas fa-info-circle mr-2 text-blue-500"></i>
                알림 설정 가이드
              </h3>

              <div className="space-y-4 text-sm">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-1">이메일 알림</h4>
                  <p className="text-blue-700">가격 변동 상세 정보와 함께 알림을 받습니다.</p>
                </div>

                <div className="p-3 bg-green-50 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-1">푸시 알림</h4>
                  <p className="text-green-700">즉시 알림으로 빠르게 확인할 수 있습니다.</p>
                </div>

                <div className="p-3 bg-yellow-50 rounded-lg">
                  <h4 className="font-semibold text-yellow-900 mb-1">알림 시간</h4>
                  <p className="text-yellow-700">설정한 시간대에만 알림을 받습니다.</p>
                </div>

                <div className="p-3 bg-purple-50 rounded-lg">
                  <h4 className="font-semibold text-purple-900 mb-1">할인율 조건</h4>
                  <p className="text-purple-700">설정한 할인율 이상일 때만 알림을 받습니다.</p>
                </div>
              </div>

              <div className="mt-6 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600">
                  <i className="fas fa-shield-alt text-green-500 mr-1"></i>
                  개인정보는 안전하게 암호화되어 저장됩니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;