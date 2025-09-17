import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/authService';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        agreeTerms: false,
        agreePrivacy: false,
        agreeMarketing: false
    });
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState('');
    const navigate = useNavigate();

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

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);
        setErrors({});

        try {
            await authService.register(formData);
            setSuccessMessage('회원가입이 완료되었습니다. 로그인해주세요.');

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
                            <div className="mt-1">
                                <input
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    autoComplete="tel"
                                    required
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    className={`appearance-none block w-full px-3 py-2 border rounded-md placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm ${
                                        errors.phone ? 'border-red-300' : 'border-gray-300'
                                    }`}
                                    placeholder="010-1234-5678"
                                />
                                {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                            </div>
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
