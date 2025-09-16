
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="lg:col-span-1">
              <div className="flex items-center mb-6">
                <h3 className="text-2xl font-bold">
                  <i className="fas fa-wine-bottle mr-2 text-secondary"></i>
                  Ju(酒)piter
                </h3>
              </div>
              <p className="text-gray-300 mb-6 leading-relaxed">
                국내 주요 쇼핑몰의 주류 가격을 한 번에 비교하여 최저가를 찾아드립니다. 스마트한 쇼핑의 시작, Ju(酒)piter와 함께하세요.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="w-10 h-10 bg-primary rounded-full flex items-center justify-center hover:bg-secondary transition-colors">
                  <i className="fab fa-facebook-f"></i>
                </a>
                <a href="#" className="w-10 h-10 bg-primary rounded-full flex items-center justify-center hover:bg-secondary transition-colors">
                  <i className="fab fa-twitter"></i>
                </a>
                <a href="#" className="w-10 h-10 bg-primary rounded-full flex items-center justify-center hover:bg-secondary transition-colors">
                  <i className="fab fa-instagram"></i>
                </a>
                <a href="#" className="w-10 h-10 bg-primary rounded-full flex items-center justify-center hover:bg-secondary transition-colors">
                  <i className="fab fa-linkedin-in"></i>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold mb-6">빠른 링크</h4>
              <ul className="space-y-3">
                <li>
                  <Link to="/about" className="text-gray-300 hover:text-primary transition-colors flex items-center">
                    <i className="fas fa-chevron-right mr-2 text-xs"></i>
                    회사소개
                  </Link>
                </li>
                <li>
                  <Link to="/shop" className="text-gray-300 hover:text-primary transition-colors flex items-center">
                    <i className="fas fa-chevron-right mr-2 text-xs"></i>
                    가격비교
                  </Link>
                </li>
                <li>
                  <Link to="/board" className="text-gray-300 hover:text-primary transition-colors flex items-center">
                    <i className="fas fa-chevron-right mr-2 text-xs"></i>
                    커뮤니티
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="text-gray-300 hover:text-primary transition-colors flex items-center">
                    <i className="fas fa-chevron-right mr-2 text-xs"></i>
                    이용약관
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="text-gray-300 hover:text-primary transition-colors flex items-center">
                    <i className="fas fa-chevron-right mr-2 text-xs"></i>
                    개인정보처리방침
                  </Link>
                </li>
              </ul>
            </div>

            {/* Account */}
            <div>
              <h4 className="text-lg font-semibold mb-6">계정</h4>
              <ul className="space-y-3">
                <li>
                  <Link to="/login" className="text-gray-300 hover:text-primary transition-colors flex items-center">
                    <i className="fas fa-chevron-right mr-2 text-xs"></i>
                    로그인
                  </Link>
                </li>
                <li>
                  <Link to="/register" className="text-gray-300 hover:text-primary transition-colors flex items-center">
                    <i className="fas fa-chevron-right mr-2 text-xs"></i>
                    회원가입
                  </Link>
                </li>
                <li>
                  <Link to="/favorites" className="text-gray-300 hover:text-primary transition-colors flex items-center">
                    <i className="fas fa-chevron-right mr-2 text-xs"></i>
                    즐겨찾기
                  </Link>
                </li>
                <li>
                  <Link to="/forgot-password" className="text-gray-300 hover:text-primary transition-colors flex items-center">
                    <i className="fas fa-chevron-right mr-2 text-xs"></i>
                    비밀번호 찾기
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-lg font-semibold mb-6">연락처</h4>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <i className="fas fa-map-marker-alt text-primary mt-1"></i>
                  <div>
                    <p className="text-gray-300">
                      서울특별시 강남구 테헤란로 123
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <i className="fas fa-envelope text-primary"></i>
                  <a href="mailto:support@jupiter.com" className="text-gray-300 hover:text-primary transition-colors">
                    support@jupiter.com
                  </a>
                </div>
                <div className="flex items-center space-x-3">
                  <i className="fas fa-phone text-primary"></i>
                  <a href="tel:+821234567890" className="text-gray-300 hover:text-primary transition-colors">
                    02-1234-5678
                  </a>
                </div>
                <div className="flex items-center space-x-3">
                  <i className="fas fa-clock text-primary"></i>
                  <span className="text-gray-300">
                    평일 09:00 - 18:00
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Newsletter */}
      <div className="bg-primary py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center justify-between">
            <div className="mb-4 lg:mb-0">
              <h4 className="text-white text-lg font-semibold mb-2">
                최저가 알림 구독
              </h4>
              <p className="text-green-100">
                새로운 할인 정보와 최저가 알림을 받아보세요
              </p>
            </div>
            <div className="flex w-full lg:w-auto">
              <input
                type="email"
                placeholder="이메일 주소를 입력하세요"
                className="flex-1 lg:w-80 px-4 py-3 rounded-l-full focus:outline-none"
              />
              <button className="bg-secondary text-white px-6 py-3 rounded-r-full hover:bg-yellow-500 transition-colors">
                구독하기
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="bg-gray-800 py-4">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center justify-between">
            <p className="text-gray-400 text-sm mb-2 lg:mb-0">
              © <span className="text-secondary">Ju(酒)piter</span>, All rights reserved.
            </p>
            <div className="flex items-center space-x-6 text-sm">
              <Link to="/privacy" className="text-gray-400 hover:text-primary transition-colors">
                개인정보처리방침
              </Link>
              <Link to="/terms" className="text-gray-400 hover:text-primary transition-colors">
                이용약관
              </Link>
              <a href="mailto:support@jupiter.com" className="text-gray-400 hover:text-primary transition-colors">
                고객센터
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;