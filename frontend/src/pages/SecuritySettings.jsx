import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import apiService from '../services/api';

const SecuritySettings = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [settings, setSettings] = useState({
    twoFactorEnabled: false,
    suspiciousActivityAlerts: true,
    passwordChangePeriodDays: 90,
    isPasswordChangeRequired: false,
    daysUntilPasswordChange: 0
  });

  useEffect(() => {
    loadSecuritySettings();
  }, []);

  const loadSecuritySettings = async () => {
    try {
      if (!authService.isLoggedIn()) {
        navigate('/login');
        return;
      }

      // 현재 사용자 정보 가져오기
      const userResult = await authService.getCurrentUser();
      setCurrentUser(userResult);

      const result = await apiService.get('/auth/api/v1/user/security');
      if (result.result === 'SUCCESS') {
        setSettings(result.data);
      } else {
        console.error('보안 설정 조회 실패:', result.message);
      }

      setLoading(false);
    } catch (error) {
      console.error('보안 설정 로드 실패:', error);
      setLoading(false);
    }
  };

  const handleTwoFactorToggle = async () => {
    try {
      if (settings.twoFactorEnabled) {
        if (window.confirm('2단계 인증을 비활성화하시겠습니까?\n\n보안이 약해질 수 있습니다.')) {
          const result = await apiService.post('/auth/api/v1/user/security/2fa/disable');
          if (result.result === 'SUCCESS') {
            setSettings(prev => ({ ...prev, twoFactorEnabled: false }));
            alert('2단계 인증이 비활성화되었습니다.');
          } else {
            alert('설정 변경에 실패했습니다: ' + result.message);
          }
        }
      } else {
        if (window.confirm('2단계 인증을 활성화하시겠습니까?\n\n추가 보안 단계가 적용됩니다.')) {
          const result = await apiService.post('/auth/api/v1/user/security/2fa/enable');
          if (result.result === 'SUCCESS') {
            setSettings(prev => ({ ...prev, twoFactorEnabled: true }));

            // 2FA 설정 안내 모달 표시
            const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=otpauth://totp/Jupiter:${encodeURIComponent('사용자')}?secret=${result.data}&issuer=Jupiter`;

            const modalContent = `
              <div style="text-align: center; padding: 20px;">
                <h3 style="margin-bottom: 15px;">2단계 인증 설정</h3>
                <p style="margin-bottom: 15px;">Google Authenticator 또는 다른 TOTP 앱에서 아래 QR 코드를 스캔하세요:</p>
                <img src="${qrCodeUrl}" alt="QR Code" style="margin: 15px 0; border: 1px solid #ddd; padding: 10px;">
                <p style="margin: 15px 0; font-size: 12px; color: #666;">
                  QR 코드를 스캔할 수 없는 경우, 다음 시크릿 키를 수동으로 입력하세요:
                </p>
                <div style="background: #f5f5f5; padding: 10px; border-radius: 4px; font-family: monospace; word-break: break-all;">
                  ${result.data}
                </div>
                <p style="margin-top: 15px; font-size: 14px; color: #333;">
                  앱에서 6자리 코드가 생성되면 로그인 시 해당 코드를 입력하세요.
                </p>
              </div>
            `;

            // 임시로 confirm 사용 (나중에 모달 컴포넌트로 교체 가능)
            const newWindow = window.open('', '2FA_Setup', 'width=400,height=500');
            newWindow.document.write(`
              <html>
                <head><title>2단계 인증 설정</title></head>
                <body>
                  ${modalContent}
                  <div style="text-align: center; margin-top: 20px;">
                    <button onclick="window.close()" style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 4px;">완료</button>
                  </div>
                </body>
              </html>
            `);
          } else {
            alert('설정 변경에 실패했습니다: ' + result.message);
          }
        }
      }
    } catch (error) {
      console.error('2FA 설정 변경 실패:', error);
      alert('설정 변경에 실패했습니다.');
    }
  };

  const handleSuspiciousActivityToggle = async () => {
    try {
      const newValue = !settings.suspiciousActivityAlerts;

      const result = await apiService.put('/auth/api/v1/user/security', {
        suspiciousActivityAlerts: newValue
      });

      if (result.result === 'SUCCESS') {
        setSettings(prev => ({ ...prev, suspiciousActivityAlerts: newValue }));

        if (newValue) {
          alert('의심스러운 활동 알림이 활성화되었습니다.');
        } else {
          alert('의심스러운 활동 알림이 비활성화되었습니다.');
        }
      } else {
        alert('설정 변경에 실패했습니다: ' + result.message);
      }
    } catch (error) {
      console.error('의심스러운 활동 알림 설정 변경 실패:', error);
      alert('설정 변경에 실패했습니다.');
    }
  };

  const handlePasswordPeriodChange = async (days) => {
    try {
      if (window.confirm(`비밀번호 변경 주기를 ${days}일로 설정하시겠습니까?`)) {
        const result = await apiService.put('/auth/api/v1/user/security', {
          passwordChangePeriodDays: days
        });

        if (result.result === 'SUCCESS') {
          setSettings(result.data);
          alert(`비밀번호 변경 주기가 ${days}일로 설정되었습니다.`);
        } else {
          alert('설정 변경에 실패했습니다: ' + result.message);
        }
      }
    } catch (error) {
      console.error('비밀번호 변경 주기 설정 실패:', error);
      alert('설정 변경에 실패했습니다.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-primary mb-4"></i>
          <p className="text-gray-600">보안 설정을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 헤더 */}
        <div className="mb-8">
          <Link to="/mypage" className="inline-flex items-center text-primary hover:text-blue-800 mb-4">
            <i className="fas fa-arrow-left mr-2"></i>
            마이페이지로 돌아가기
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            <i className="fas fa-shield-alt mr-3 text-primary"></i>
            개인정보 보호 및 보안
          </h1>
          <p className="text-gray-600">
            계정의 보안을 강화하고 개인정보를 안전하게 관리하세요.
          </p>
        </div>

        <div className="space-y-6">
          {/* 2단계 인증 - OAuth 사용자 제외 */}
          {!currentUser?.isOAuthUser && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    <i className="fas fa-mobile-alt mr-2 text-blue-500"></i>
                    2단계 인증 (2FA)
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    로그인 시 휴대폰 앱으로 추가 인증을 통해 계정을 더욱 안전하게 보호합니다.
                  </p>
                  {settings.twoFactorEnabled ? (
                    <div className="bg-green-50 p-3 rounded-lg">
                      <p className="text-sm text-green-700">
                        <i className="fas fa-check-circle mr-1"></i>
                        2단계 인증이 활성화되어 있습니다.
                      </p>
                    </div>
                  ) : (
                    <div className="bg-yellow-50 p-3 rounded-lg">
                      <p className="text-sm text-yellow-700">
                        <i className="fas fa-exclamation-triangle mr-1"></i>
                        보안 강화를 위해 2단계 인증을 활성화하는 것을 권장합니다.
                      </p>
                    </div>
                  )}
                </div>
                <div className="ml-6">
                  <button
                    onClick={handleTwoFactorToggle}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                      settings.twoFactorEnabled ? 'bg-primary' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* OAuth 사용자를 위한 안내 메시지 */}
          {currentUser?.isOAuthUser && (
            <div className="bg-blue-50 rounded-lg p-6">
              <div className="flex items-center">
                <i className="fas fa-info-circle text-blue-500 mr-3"></i>
                <div>
                  <h3 className="text-lg font-medium text-blue-900 mb-2">소셜 로그인 계정</h3>
                  <p className="text-sm text-blue-800">
                    소셜 로그인 사용자는 이미 외부 제공업체(구글, 네이버 등)의 보안 시스템을 통해 안전하게 보호되고 있어
                    별도의 2단계 인증 설정이 불필요합니다.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 의심스러운 활동 알림 */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  <i className="fas fa-exclamation-triangle mr-2 text-yellow-500"></i>
                  의심스러운 활동 알림
                </h3>
                <p className="text-sm text-gray-600">
                  비정상적인 로그인 시도나 계정 활동이 감지되면 이메일로 알림을 받습니다.
                </p>
              </div>
              <div className="ml-6">
                <button
                  onClick={handleSuspiciousActivityToggle}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                    settings.suspiciousActivityAlerts ? 'bg-primary' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.suspiciousActivityAlerts ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* 비밀번호 변경 주기 - OAuth 사용자 제외 */}
          {!currentUser?.isOAuthUser && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  <i className="fas fa-key mr-2 text-purple-500"></i>
                  비밀번호 변경 주기
                </h3>
                <p className="text-sm text-gray-600">
                  정기적인 비밀번호 변경으로 계정 보안을 유지하세요.
                </p>
              </div>

            {/* 현재 상태 */}
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">현재 설정</span>
                <span className="font-medium text-gray-900">{settings.passwordChangePeriodDays}일마다</span>
              </div>
              {settings.isPasswordChangeRequired ? (
                <div className="mt-2 text-sm text-red-600">
                  <i className="fas fa-exclamation-circle mr-1"></i>
                  비밀번호 변경이 필요합니다!
                </div>
              ) : (
                <div className="mt-2 text-sm text-green-600">
                  <i className="fas fa-info-circle mr-1"></i>
                  다음 변경까지 {settings.daysUntilPasswordChange}일 남음
                </div>
              )}
            </div>

            {/* 주기 선택 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[30, 60, 90, 180].map((days) => (
                <button
                  key={days}
                  onClick={() => handlePasswordPeriodChange(days)}
                  className={`p-3 rounded-lg border-2 text-center transition-colors ${
                    settings.passwordChangePeriodDays === days
                      ? 'border-primary bg-blue-50 text-primary'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  <div className="font-medium">{days}일</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {days === 30 ? '매월' : days === 60 ? '2개월' : days === 90 ? '3개월' : '6개월'}
                  </div>
                </button>
              ))}
            </div>
            </div>
          )}

          {/* 추가 보안 정보 */}
          <div className="bg-blue-50 rounded-lg p-6">
            <h4 className="text-lg font-medium text-blue-900 mb-3">
              <i className="fas fa-info-circle mr-2"></i>
              보안 권장사항
            </h4>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start">
                <i className="fas fa-check mr-2 mt-0.5 text-blue-600"></i>
                <span>강력한 비밀번호를 사용하고 정기적으로 변경하세요.</span>
              </li>
              <li className="flex items-start">
                <i className="fas fa-check mr-2 mt-0.5 text-blue-600"></i>
                <span>2단계 인증을 활성화하여 계정 보안을 강화하세요.</span>
              </li>
              <li className="flex items-start">
                <i className="fas fa-check mr-2 mt-0.5 text-blue-600"></i>
                <span>의심스러운 활동 알림을 켜두어 빠르게 대응하세요.</span>
              </li>
              <li className="flex items-start">
                <i className="fas fa-check mr-2 mt-0.5 text-blue-600"></i>
                <span>개인정보를 타인과 공유하지 마세요.</span>
              </li>
            </ul>
          </div>

          {/* 계정 보안 바로가기 */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h4 className="text-lg font-medium text-gray-900 mb-4">
              <i className="fas fa-tools mr-2 text-gray-600"></i>
              빠른 설정
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* OAuth 사용자가 아닌 경우에만 비밀번호 변경 버튼 표시 */}
              {!currentUser?.isOAuthUser && (
                <button
                  onClick={() => navigate('/mypage', { state: { openPasswordChange: true } })}
                  className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <i className="fas fa-key text-orange-500 mr-3"></i>
                  <div className="text-left">
                    <div className="font-medium">비밀번호 변경</div>
                    <div className="text-sm text-gray-600">지금 바로 비밀번호 변경</div>
                  </div>
                </button>
              )}

              {/* OAuth 사용자인 경우 안내 메시지 표시 */}
              {currentUser?.isOAuthUser && (
                <div className="flex items-center p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <i className="fas fa-info-circle text-blue-500 mr-3"></i>
                  <div className="text-left">
                    <div className="font-medium text-gray-700">소셜 로그인 계정</div>
                    <div className="text-sm text-gray-600">소셜 로그인 사용자는 비밀번호 변경이 불필요합니다</div>
                  </div>
                </div>
              )}

              <button
                onClick={() => navigate('/settings')}
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <i className="fas fa-cog text-gray-500 mr-3"></i>
                <div className="text-left">
                  <div className="font-medium">전체 설정</div>
                  <div className="text-sm text-gray-600">모든 계정 설정 관리</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecuritySettings;