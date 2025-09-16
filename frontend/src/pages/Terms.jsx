import { Link } from 'react-router-dom';

const Terms = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg p-8">
          {/* 헤더 */}
          <div className="mb-8">
            <Link to="/" className="inline-flex items-center text-primary hover:text-blue-800 mb-4">
              <i className="fas fa-arrow-left mr-2"></i>
              홈으로 돌아가기
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">이용약관</h1>
            <p className="text-gray-600">최종 업데이트: 2024년 1월 1일</p>
          </div>

          {/* 목차 */}
          <div className="bg-gray-50 p-6 rounded-lg mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">목차</h2>
            <ul className="space-y-2 text-sm">
              <li><a href="#section1" className="text-primary hover:underline">1. 총칙</a></li>
              <li><a href="#section2" className="text-primary hover:underline">2. 서비스 이용</a></li>
              <li><a href="#section3" className="text-primary hover:underline">3. 회원가입 및 계정</a></li>
              <li><a href="#section4" className="text-primary hover:underline">4. 서비스 이용료</a></li>
              <li><a href="#section5" className="text-primary hover:underline">5. 회원의 의무</a></li>
              <li><a href="#section6" className="text-primary hover:underline">6. 회사의 의무</a></li>
              <li><a href="#section7" className="text-primary hover:underline">7. 서비스 이용 제한</a></li>
              <li><a href="#section8" className="text-primary hover:underline">8. 계약 해지 및 탈퇴</a></li>
              <li><a href="#section9" className="text-primary hover:underline">9. 면책조항</a></li>
              <li><a href="#section10" className="text-primary hover:underline">10. 기타</a></li>
            </ul>
          </div>

          {/* 본문 */}
          <div className="prose max-w-none">
            <section id="section1" className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">1. 총칙</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  <strong>1.1 목적</strong><br />
                  본 약관은 Ju(酒)piter(이하 "회사")가 제공하는 주류 가격 비교 서비스(이하 "서비스")의 이용과 관련하여 회사와 이용자 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
                </p>
                <p>
                  <strong>1.2 정의</strong><br />
                  - "서비스"란 회사가 제공하는 주류 가격 비교 및 관련 정보 제공 서비스를 의미합니다.<br />
                  - "회원"이란 본 약관에 따라 회사와 이용계약을 체결한 개인 또는 법인을 의미합니다.<br />
                  - "이용자"란 회원과 비회원을 포함하여 서비스를 이용하는 자를 의미합니다.
                </p>
                <p>
                  <strong>1.3 약관의 효력 및 변경</strong><br />
                  본 약관은 서비스 화면에 게시하거나 기타의 방법으로 회원에게 공지함으로써 효력이 발생합니다. 회사는 약관의규제에관한법률, 정보통신망이용촉진및정보보호등에관한법률 등 관련법을 위배하지 않는 범위에서 본 약관을 개정할 수 있습니다.
                </p>
              </div>
            </section>

            <section id="section2" className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">2. 서비스 이용</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  <strong>2.1 서비스 내용</strong><br />
                  회사는 다음과 같은 서비스를 제공합니다:
                </p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li>주류 가격 비교 정보 제공</li>
                  <li>주류 관련 정보 및 리뷰 제공</li>
                  <li>회원간 소통을 위한 커뮤니티 서비스</li>
                  <li>기타 회사가 정하는 서비스</li>
                </ul>
                <p>
                  <strong>2.2 서비스 이용시간</strong><br />
                  서비스 이용은 연중무휴, 1일 24시간 가능함을 원칙으로 합니다. 단, 회사의 업무상이나 기술상의 이유로 서비스가 일시 중단될 수 있습니다.
                </p>
              </div>
            </section>

            <section id="section3" className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">3. 회원가입 및 계정</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  <strong>3.1 회원가입</strong><br />
                  회원가입은 이용자가 약관의 내용에 대하여 동의를 하고 회원가입신청을 한 후 회사가 이러한 신청에 대하여 승낙함으로써 체결됩니다.
                </p>
                <p>
                  <strong>3.2 회원정보의 변경</strong><br />
                  회원은 개인정보관리화면을 통하여 언제든지 본인의 개인정보를 열람하고 수정할 수 있습니다. 회원은 회원가입 시 기재한 사항이 변경되었을 경우 온라인으로 수정을 하거나 전자우편 기타 방법으로 회사에 그 변경사항을 알려야 합니다.
                </p>
              </div>
            </section>

            <section id="section4" className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">4. 서비스 이용료</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  <strong>4.1 기본 서비스</strong><br />
                  회사가 제공하는 기본적인 서비스는 무료로 이용할 수 있습니다.
                </p>
                <p>
                  <strong>4.2 유료 서비스</strong><br />
                  회사는 일부 서비스에 대해 유료로 제공할 수 있으며, 이 경우 사전에 명확히 고지하고 회원의 동의를 받습니다.
                </p>
              </div>
            </section>

            <section id="section5" className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">5. 회원의 의무</h2>
              <div className="space-y-4 text-gray-700">
                <p>회원은 다음 행위를 하여서는 안 됩니다:</p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li>신청 또는 변경시 허위내용의 등록</li>
                  <li>타인의 정보도용</li>
                  <li>회사가 게시한 정보의 변경</li>
                  <li>회사가 정한 정보 이외의 정보(컴퓨터 프로그램 등) 등의 송신 또는 게시</li>
                  <li>회사 기타 제3자의 저작권 등 지적재산권에 대한 침해</li>
                  <li>회사 기타 제3자의 명예를 손상시키거나 업무를 방해하는 행위</li>
                  <li>외설 또는 폭력적인 메시지, 화상, 음성, 기타 공서양속에 반하는 정보를 회사에 공개 또는 게시하는 행위</li>
                </ul>
              </div>
            </section>

            <section id="section6" className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">6. 회사의 의무</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  <strong>6.1 서비스 제공</strong><br />
                  회사는 계속적이고 안정적인 서비스의 제공을 위하여 최선을 다하여 노력합니다.
                </p>
                <p>
                  <strong>6.2 개인정보 보호</strong><br />
                  회사는 관련법령이 정하는 바에 따라 회원의 개인정보를 보호하기 위해 노력합니다. 개인정보의 보호 및 사용에 대해서는 관련법령 및 회사의 개인정보처리방침이 적용됩니다.
                </p>
              </div>
            </section>

            <section id="section7" className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">7. 서비스 이용 제한</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  회사는 회원이 본 약관의 의무를 위반하거나 서비스의 정상적인 운영을 방해한 경우, 경고, 일시정지, 영구이용정지 등으로 서비스 이용을 단계적으로 제한할 수 있습니다.
                </p>
              </div>
            </section>

            <section id="section8" className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">8. 계약 해지 및 탈퇴</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  <strong>8.1 회원의 해지</strong><br />
                  회원은 언제든지 서비스 이용을 중단하고 회원 탈퇴를 요청할 수 있으며, 회사는 즉시 회원탈퇴를 처리합니다.
                </p>
                <p>
                  <strong>8.2 회사의 해지</strong><br />
                  회사는 회원이 본 약관을 위반한 경우, 즉시 계약을 해지할 수 있습니다.
                </p>
              </div>
            </section>

            <section id="section9" className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">9. 면책조항</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  <strong>9.1 회사의 면책</strong><br />
                  회사는 천재지변 또는 이에 준하는 불가항력으로 인하여 서비스를 제공할 수 없는 경우에는 서비스 제공에 관한 책임이 면제됩니다.
                </p>
                <p>
                  <strong>9.2 정보의 정확성</strong><br />
                  회사는 서비스에서 제공되는 정보의 정확성, 완전성, 신뢰성에 대해 보장하지 않으며, 이용자는 본인의 판단과 책임 하에 서비스를 이용해야 합니다.
                </p>
              </div>
            </section>

            <section id="section10" className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">10. 기타</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  <strong>10.1 준거법 및 관할법원</strong><br />
                  본 약관의 해석 및 회사와 회원 간의 분쟁에 대하여는 대한민국의 법을 적용하며, 서울중앙지방법원을 관할법원으로 합니다.
                </p>
                <p>
                  <strong>10.2 분리가능성</strong><br />
                  본 약관 중 어느 조항이 무효이거나 집행 불가능한 경우라도 나머지 조항들은 계속 유효하게 존속됩니다.
                </p>
              </div>
            </section>
          </div>

          {/* 하단 버튼 */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/login"
                className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-blue-800 transition-colors text-center"
              >
                로그인 페이지로 돌아가기
              </Link>
              <Link
                to="/register"
                className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors text-center"
              >
                회원가입 페이지로 돌아가기
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;