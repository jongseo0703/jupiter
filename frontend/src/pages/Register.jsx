import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import apiService from '../services/api';

const Register = () => {
    // sessionStorage에서 저장된 폼 데이터 복원
    const getInitialFormData = () => {
        const savedData = sessionStorage.getItem('registerFormData');
        if (savedData) {
            try {
                return JSON.parse(savedData);
            } catch (error) {
                console.error('Failed to parse saved form data:', error);
            }
        }
        return {
            name: '',
            email: '',
            password: '',
            confirmPassword: '',
            phone: '',
            agreeTerms: false,
            agreePrivacy: false,
            agreeMarketing: false
        };
    };

    const [formData, setFormData] = useState(getInitialFormData);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState('');
    const [showRestoredMessage, setShowRestoredMessage] = useState(false);
    const [phoneVerification, setPhoneVerification] = useState({
        isVerified: false,
        isSending: false,
        isVerifying: false,
        verificationCode: '',
        countdown: 0
    });
    const navigate = useNavigate();

    // 폼 데이터가 변경될 때마다 sessionStorage에 저장
    useEffect(() => {
        sessionStorage.setItem('registerFormData', JSON.stringify(formData));
    }, [formData]);

    // 컴포넌트 마운트 시 저장된 데이터가 있으면 알림 표시
    useEffect(() => {
        const savedData = sessionStorage.getItem('registerFormData');
        if (savedData) {
            try {
                const parsedData = JSON.parse(savedData);
                // 폼에 실제 입력된 데이터가 있는지 확인
                const hasData = parsedData.name || parsedData.email || parsedData.password || parsedData.phone;
                if (hasData) {
                    setShowRestoredMessage(true);
                    setTimeout(() => setShowRestoredMessage(false), 5000);
                }
            } catch (error) {
                console.error('Failed to parse saved form data:', error);
            }
        }
    }, []);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        // 실시간 유효성 검사
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = '이름을 입력해주세요.';
        }

        if (!formData.email.trim()) {
            newErrors.email = '이메일을 입력해주세요.';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = '올바른 이메일 형식이 아닙니다.';
        }

        if (!formData.password) {
            newErrors.password = '비밀번호를 입력해주세요.';
        } else if (formData.password.length < 8) {
            newErrors.password = '비밀번호는 8자 이상이어야 합니다.';
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = '비밀번호 확인을 입력해주세요.';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = '비밀번호가 일치하지 않습니다.';
        }

        if (!formData.phone.trim()) {
            newErrors.phone = '휴대폰 번호를 입력해주세요.';
        } else if (!/^01[0-9]-?[0-9]{4}-?[0-9]{4}$/.test(formData.phone)) {
            newErrors.phone = '올바른 휴대폰 번호 형식이 아닙니다.';
        }

        if (!formData.agreeTerms) {
            newErrors.agreeTerms = '이용약관에 동의해주세요.';
        }

        if (!formData.agreePrivacy) {
            newErrors.agreePrivacy = '개인정보처리방침에 동의해주세요.';
        }

        if (!phoneVerification.isVerified) {
            newErrors.phoneVerification = '휴대폰 인증을 완료해주세요.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // 휴대폰 인증번호 발송
    const handleSendVerification = async () => {
        if (!formData.phone.trim()) {
            setErrors({ phone: '휴대폰 번호를 입력해주세요.' });
            return;
        }

        if (!/^01[0-9]-?[0-9]{4}-?[0-9]{4}$/.test(formData.phone)) {
            setErrors({ phone: '올바른 휴대폰 번호 형식이 아닙니다.' });
            return;
        }

        setPhoneVerification(prev => ({ ...prev, isSending: true }));

        try {
            const response = await apiService.post('/auth/api/v1/auth/send-verification', {
                phoneNumber: formData.phone
            });

            // apiService는 성공 시 JSON을 반환하므로 별도 체크 불필요

            setPhoneVerification(prev => ({ ...prev, countdown: 300 })); // 5분 카운트다운
            startCountdown();

            setSuccessMessage('인증번호가 발송되었습니다. (5분간 유효)');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error) {
            setErrors({ phone: error.message });
        } finally {
            setPhoneVerification(prev => ({ ...prev, isSending: false }));
        }
    };

    // 카운트다운 시작
    const startCountdown = () => {
        const timer = setInterval(() => {
            setPhoneVerification(prev => {
                if (prev.countdown <= 1) {
                    clearInterval(timer);
                    return { ...prev, countdown: 0 };
                }
                return { ...prev, countdown: prev.countdown - 1 };
            });
        }, 1000);
    };

    // 휴대폰 인증번호 확인
    const handleVerifyCode = async () => {
        if (!phoneVerification.verificationCode.trim()) {
            setErrors({ verificationCode: '인증번호를 입력해주세요.' });
            return;
        }

        setPhoneVerification(prev => ({ ...prev, isVerifying: true }));

        try {
            const response = await apiService.post('/auth/api/v1/auth/verify-phone', {
                phoneNumber: formData.phone,
                verificationCode: phoneVerification.verificationCode
            });

            // apiService는 성공 시 JSON을 반환하므로 별도 체크 불필요

            setPhoneVerification(prev => ({
                ...prev,
                isVerified: true,
                countdown: 0
            }));

            setSuccessMessage('휴대폰 인증이 완료되었습니다.');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error) {
            setErrors({ verificationCode: error.message });
        } finally {
            setPhoneVerification(prev => ({ ...prev, isVerifying: false }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);
        setErrors({});

        try {
            // formData의 name을 username으로 매핑하여 전송
            const registerData = {
                name: formData.name, // authService에서 username으로 변환됨
                email: formData.email,
                password: formData.password,
                phone: formData.phone
            };

            await authService.register(registerData);
            setSuccessMessage('회원가입이 완료되었습니다. 로그인해주세요.');

            // 회원가입 성공 시 저장된 폼 데이터 삭제
            sessionStorage.removeItem('registerFormData');

            // 3초 후 로그인 페이지로 리다이렉트
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (error) {
            setErrors({ general: error.message || '회원가입에 실패했습니다.' });
        } finally {
            setIsLoading(false);
        }
    };

    // 폼 초기화 함수
    const handleClearForm = () => {
        const initialData = {
            name: '',
            email: '',
            password: '',
            confirmPassword: '',
            phone: '',
            agreeTerms: false,
            agreePrivacy: false,
            agreeMarketing: false
        };
        setFormData(initialData);
        setErrors({});
        sessionStorage.removeItem('registerFormData');
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <Link to="/" className="flex justify-center">
                    <div className="text-3xl font-bold text-primary">
                        <i className="fas fa-wine-bottle mr-2 text-secondary"></i>
                        Ju(酒)piter
                    </div>
                </Link>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    회원가입
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    이미 계정이 있으신가요?{' '}
                    <Link to="/login" className="font-medium text-primary hover:text-blue-800">
                        로그인
                    </Link>
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    {/* 복원 메시지 */}
                    {showRestoredMessage && (
                        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <i className="fas fa-info-circle text-blue-600 mr-2"></i>
                                    <p className="text-sm text-blue-600">이전에 입력하신 정보가 복원되었습니다.</p>
                                </div>
                                <button
                                    onClick={handleClearForm}
                                    className="text-sm text-blue-600 hover:text-blue-800 underline"
                                >
                                    새로 시작
                                </button>
                            </div>
                        </div>
                    )}

                    {/* 성공 메시지 */}
                    {successMessage && (
                        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
                            <p className="text-sm text-green-600">{successMessage}</p>
                        </div>
                    )}

                    {/* 에러 메시지 */}
                    {errors.general && (
                        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                            <p className="text-sm text-red-600">{errors.general}</p>
                        </div>
                    )}


                    {/* 회원가입 폼 */}
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                이름 *
                            </label>
                            <div className="mt-1">
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    autoComplete="name"
                                    required
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className={`appearance-none block w-full px-3 py-2 border rounded-md placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm ${
                                        errors.name ? 'border-red-300' : 'border-gray-300'
                                    }`}
                                    placeholder="이름을 입력하세요"
                                />
                                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                            </div>
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                이메일 *
                            </label>
                            <div className="mt-1">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className={`appearance-none block w-full px-3 py-2 border rounded-md placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm ${
                                        errors.email ? 'border-red-300' : 'border-gray-300'
                                    }`}
                                    placeholder="이메일을 입력하세요"
                                />
                                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                비밀번호 *
                            </label>
                            <div className="mt-1">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="new-password"
                                    required
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className={`appearance-none block w-full px-3 py-2 border rounded-md placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm ${
                                        errors.password ? 'border-red-300' : 'border-gray-300'
                                    }`}
                                    placeholder="8자 이상의 비밀번호를 입력하세요"
                                />
                                {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                            </div>
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                                비밀번호 확인 *
                            </label>
                            <div className="mt-1">
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    autoComplete="new-password"
                                    required
                                    value={formData.confirmPassword}
                                    onChange={handleInputChange}
                                    className={`appearance-none block w-full px-3 py-2 border rounded-md placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm ${
                                        errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                                    }`}
                                    placeholder="비밀번호를 다시 입력하세요"
                                />
                                {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
                            </div>
                        </div>

                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                                휴대폰 번호 *
                            </label>
                            <div className="mt-1 flex space-x-2">
                                <input
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    autoComplete="tel"
                                    required
                                    value={formData.phone}
                                    onChange={(e) => {
                                        handleInputChange(e);
                                        // 휴대폰 번호 변경 시 인증 상태 초기화
                                        if (phoneVerification.isVerified) {
                                            setPhoneVerification(prev => ({ ...prev, isVerified: false }));
                                        }
                                    }}
                                    disabled={phoneVerification.isVerified}
                                    className={`flex-1 appearance-none block px-3 py-2 border rounded-md placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm ${
                                        errors.phone ? 'border-red-300' :
                                        phoneVerification.isVerified ? 'border-green-300 bg-green-50' :
                                        'border-gray-300'
                                    }`}
                                    placeholder="010-1234-5678"
                                />
                                <button
                                    type="button"
                                    onClick={handleSendVerification}
                                    disabled={phoneVerification.isSending || phoneVerification.countdown > 0 || phoneVerification.isVerified}
                                    className="px-4 py-2 text-sm font-medium rounded-md border border-transparent bg-primary text-white hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {phoneVerification.isSending ? '발송중...' :
                                     phoneVerification.countdown > 0 ? `${Math.floor(phoneVerification.countdown / 60)}:${String(phoneVerification.countdown % 60).padStart(2, '0')}` :
                                     phoneVerification.isVerified ? '인증완료' : '인증번호'}
                                </button>
                            </div>
                            {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}

                            {/* 인증번호 입력 필드 */}
                            {phoneVerification.countdown > 0 && !phoneVerification.isVerified && (
                                <div className="mt-2">
                                    <div className="flex space-x-2">
                                        <input
                                            type="text"
                                            placeholder="인증번호 6자리"
                                            maxLength="6"
                                            value={phoneVerification.verificationCode}
                                            onChange={(e) => setPhoneVerification(prev => ({ ...prev, verificationCode: e.target.value }))}
                                            className="flex-1 appearance-none block px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleVerifyCode}
                                            disabled={phoneVerification.isVerifying || !phoneVerification.verificationCode.trim()}
                                            className="px-4 py-2 text-sm font-medium rounded-md border border-transparent bg-green-600 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {phoneVerification.isVerifying ? '확인중...' : '확인'}
                                        </button>
                                    </div>
                                    {errors.verificationCode && <p className="mt-1 text-sm text-red-600">{errors.verificationCode}</p>}
                                </div>
                            )}

                            {/* 인증 완료 표시 */}
                            {phoneVerification.isVerified && (
                                <div className="mt-2 flex items-center text-green-600">
                                    <i className="fas fa-check-circle mr-2"></i>
                                    <span className="text-sm">휴대폰 인증이 완료되었습니다.</span>
                                </div>
                            )}

                            {errors.phoneVerification && <p className="mt-1 text-sm text-red-600">{errors.phoneVerification}</p>}
                        </div>

                        {/* 약관 동의 */}
                        <div className="space-y-3">
                            <div className="flex items-center">
                                <input
                                    id="agreeTerms"
                                    name="agreeTerms"
                                    type="checkbox"
                                    checked={formData.agreeTerms}
                                    onChange={handleInputChange}
                                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                                />
                                <label htmlFor="agreeTerms" className="ml-2 block text-sm text-gray-900">
                                    <span className="text-red-500">*</span> <Link to="/terms" className="text-primary hover:underline">이용약관</Link>에 동의합니다
                                </label>
                            </div>
                            {errors.agreeTerms && <p className="text-sm text-red-600">{errors.agreeTerms}</p>}

                            <div className="flex items-center">
                                <input
                                    id="agreePrivacy"
                                    name="agreePrivacy"
                                    type="checkbox"
                                    checked={formData.agreePrivacy}
                                    onChange={handleInputChange}
                                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                                />
                                <label htmlFor="agreePrivacy" className="ml-2 block text-sm text-gray-900">
                                    <span className="text-red-500">*</span> <Link to="/privacy" className="text-primary hover:underline">개인정보처리방침</Link>에 동의합니다
                                </label>
                            </div>
                            {errors.agreePrivacy && <p className="text-sm text-red-600">{errors.agreePrivacy}</p>}

                            <div className="flex items-center">
                                <input
                                    id="agreeMarketing"
                                    name="agreeMarketing"
                                    type="checkbox"
                                    checked={formData.agreeMarketing}
                                    onChange={handleInputChange}
                                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                                />
                                <label htmlFor="agreeMarketing" className="ml-2 block text-sm text-gray-900">
                                    마케팅 정보 수신에 동의합니다 (선택)
                                </label>
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
                            >
                                {isLoading ? (
                                    <div className="flex items-center">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        회원가입 중...
                                    </div>
                                ) : (
                                    '회원가입'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Register;
