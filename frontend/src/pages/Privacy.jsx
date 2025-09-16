import { Link } from 'react-router-dom';

const Privacy = () => {
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
            <h1 className="text-3xl font-bold text-gray-900 mb-4">개인정보처리방침</h1>
            <p className="text-gray-600">최종 업데이트: 2024년 1월 1일</p>
          </div>

          {/* 목차 */}
          <div className="bg-gray-50 p-6 rounded-lg mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">목차</h2>
            <ul className="space-y-2 text-sm">
              <li><a href="#section1" className="text-primary hover:underline">1. 개인정보 처리목적</a></li>
              <li><a href="#section2" className="text-primary hover:underline">2. 개인정보 수집 및 이용내역</a></li>
              <li><a href="#section3" className="text-primary hover:underline">3. 개인정보 처리위탁</a></li>
              <li><a href="#section4" className="text-primary hover:underline">4. 개인정보 보유 및 이용기간</a></li>
              <li><a href="#section5" className="text-primary hover:underline">5. 개인정보의 제3자 제공</a></li>
              <li><a href="#section6" className="text-primary hover:underline">6. 정보주체의 권리·의무 및 행사방법</a></li>
              <li><a href="#section7" className="text-primary hover:underline">7. 개인정보의 파기</a></li>
              <li><a href="#section8" className="text-primary hover:underline">8. 개인정보의 안전성 확보조치</a></li>
              <li><a href="#section9" className="text-primary hover:underline">9. 개인정보 보호책임자</a></li>
              <li><a href="#section10" className="text-primary hover:underline">10. 개인정보처리방침 변경</a></li>
            </ul>
          </div>

          {/* 본문 */}
          <div className="prose max-w-none">
            <div className="bg-blue-50 p-6 rounded-lg mb-8">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">개인정보처리방침 개요</h3>
              <p className="text-blue-800">
                Ju(酒)piter는 개인정보보호법에 따라 이용자의 개인정보 보호 및 권익을 보호하고 개인정보와 관련한 이용자의 고충을 원활하게 처리할 수 있도록 다음과 같은 처리방침을 두고 있습니다.
              </p>
            </div>

            <section id="section1" className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">1. 개인정보 처리목적</h2>
              <div className="space-y-4 text-gray-700">
                <p>회사는 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는 개인정보보호법 제18조에 따라 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.</p>

                <div className="ml-4">
                  <h3 className="font-semibold mb-2">가. 서비스 제공</h3>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>회원 가입 및 관리</li>
                    <li>주류 가격 비교 서비스 제공</li>
                    <li>콘텐츠 제공</li>
                    <li>커뮤니티 서비스 제공</li>
                  </ul>

                  <h3 className="font-semibold mb-2 mt-4">나. 민원사무 처리</h3>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>민원인의 신원 확인</li>
                    <li>민원사항 확인</li>
                    <li>사실조사를 위한 연락·통지</li>
                    <li>처리결과 통보</li>
                  </ul>

                  <h3 className="font-semibold mb-2 mt-4">다. 마케팅 및 광고에의 활용</h3>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>신규 서비스(제품) 개발 및 맞춤 서비스 제공</li>
                    <li>이벤트 및 광고성 정보 제공 및 참여기회 제공</li>
                    <li>인구통계학적 특성에 따른 서비스 제공 및 광고 게재</li>
                    <li>서비스의 유효성 확인</li>
                  </ul>
                </div>
              </div>
            </section>

            <section id="section2" className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">2. 개인정보 수집 및 이용내역</h2>
              <div className="space-y-4 text-gray-700">
                <h3 className="font-semibold">가. 수집하는 개인정보의 항목</h3>

                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="border border-gray-300 px-4 py-2 text-left">수집목적</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">수집항목</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">수집방법</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2">회원가입</td>
                        <td className="border border-gray-300 px-4 py-2">이름, 이메일, 비밀번호, 휴대폰번호</td>
                        <td className="border border-gray-300 px-4 py-2">회원가입 시</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2">소셜로그인</td>
                        <td className="border border-gray-300 px-4 py-2">소셜계정 정보(이름, 이메일, 프로필)</td>
                        <td className="border border-gray-300 px-4 py-2">소셜로그인 시</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2">서비스 이용</td>
                        <td className="border border-gray-300 px-4 py-2">접속 로그, IP주소, 쿠키, 서비스 이용기록</td>
                        <td className="border border-gray-300 px-4 py-2">서비스 이용 시 자동수집</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <h3 className="font-semibold mt-6">나. 수집방법</h3>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>홈페이지를 통한 회원가입</li>
                  <li>소셜로그인(네이버, 구글, 카카오)</li>
                  <li>서비스 이용 과정에서 자동으로 생성되는 정보 수집</li>
                </ul>
              </div>
            </section>

            <section id="section3" className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">3. 개인정보 처리위탁</h2>
              <div className="space-y-4 text-gray-700">
                <p>회사는 원활한 개인정보 업무처리를 위하여 다음과 같이 개인정보 처리업무를 위탁하고 있습니다:</p>

                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="border border-gray-300 px-4 py-2 text-left">수탁업체</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">위탁업무 내용</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">보유이용기간</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2">AWS</td>
                        <td className="border border-gray-300 px-4 py-2">클라우드 서비스 제공</td>
                        <td className="border border-gray-300 px-4 py-2">위탁계약 종료시</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2">네이버, 구글, 카카오</td>
                        <td className="border border-gray-300 px-4 py-2">소셜로그인 서비스</td>
                        <td className="border border-gray-300 px-4 py-2">회원 탈퇴시</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            <section id="section4" className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">4. 개인정보 보유 및 이용기간</h2>
              <div className="space-y-4 text-gray-700">
                <p>회사는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보를 수집시에 동의받은 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.</p>

                <h3 className="font-semibold">각각의 개인정보 처리 및 보유 기간은 다음과 같습니다:</h3>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li><strong>회원정보:</strong> 회원 탈퇴시까지</li>
                  <li><strong>서비스 이용기록:</strong> 3개월</li>
                  <li><strong>부정이용기록:</strong> 1년</li>
                  <li><strong>광고성 정보 전송 기록:</strong> 6개월</li>
                </ul>

                <h3 className="font-semibold mt-4">관련 법령에 의한 정보보유 사유:</h3>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li>계약 또는 청약철회 등에 관한 기록 : 5년 (전자상거래법)</li>
                  <li>대금결제 및 재화 등의 공급에 관한 기록 : 5년 (전자상거래법)</li>
                  <li>소비자의 불만 또는 분쟁처리에 관한 기록 : 3년 (전자상거래법)</li>
                  <li>로그인에 관한 기록 보존 이유 : 통신비밀보호법</li>
                </ul>
              </div>
            </section>

            <section id="section5" className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">5. 개인정보의 제3자 제공</h2>
              <div className="space-y-4 text-gray-700">
                <p>회사는 정보주체의 개인정보를 수집·이용목적으로 명시한 범위 내에서만 처리하며, 정보주체의 동의, 법률의 특별한 규정 등 개인정보보호법 제17조 및 제18조에 해당하는 경우에만 개인정보를 제3자에게 제공합니다.</p>

                <p className="font-semibold">현재 회사는 다음과 같이 개인정보를 제3자에게 제공하고 있습니다:</p>
                <div className="bg-gray-50 p-4 rounded">
                  <p className="text-center text-gray-600">개인정보를 제3자에게 제공하지 않습니다.</p>
                </div>
              </div>
            </section>

            <section id="section6" className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">6. 정보주체의 권리·의무 및 행사방법</h2>
              <div className="space-y-4 text-gray-700">
                <p>정보주체는 회사에 대해 언제든지 다음 각 호의 개인정보 보호 관련 권리를 행사할 수 있습니다:</p>

                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li>개인정보 처리현황 통지요구</li>
                  <li>개인정보 처리정지 요구</li>
                  <li>개인정보의 정정·삭제 요구</li>
                  <li>손해배상 청구</li>
                </ul>

                <p className="mt-4">위의 권리 행사는 회사에 대해 개인정보보호법 시행령 제41조제1항에 따라 서면, 전자우편, 모사전송(FAX) 등을 통하여 하실 수 있으며 회사는 이에 대해 지체 없이 조치하겠습니다.</p>

                <div className="bg-yellow-50 p-4 rounded mt-4">
                  <p className="text-yellow-800"><strong>연락처:</strong> privacy@jupiter.com</p>
                </div>
              </div>
            </section>

            <section id="section7" className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">7. 개인정보의 파기</h2>
              <div className="space-y-4 text-gray-700">
                <p>회사는 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가 불필요하게 되었을 때에는 지체없이 해당 개인정보를 파기합니다.</p>

                <h3 className="font-semibold">파기절차 및 방법</h3>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li><strong>파기절차:</strong> 회사는 파기 사유가 발생한 개인정보를 선정하고, 회사의 개인정보 보호책임자의 승인을 받아 개인정보를 파기합니다.</li>
                  <li><strong>파기방법:</strong> 전자적 파일 형태의 정보는 기록을 재생할 수 없는 기술적 방법을 사용합니다.</li>
                </ul>
              </div>
            </section>

            <section id="section8" className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">8. 개인정보의 안전성 확보조치</h2>
              <div className="space-y-4 text-gray-700">
                <p>회사는 개인정보보호법 제29조에 따라 다음과 같이 안전성 확보에 필요한 기술적/관리적 및 물리적 조치를 하고 있습니다:</p>

                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li>개인정보 취급 직원의 최소화 및 교육</li>
                  <li>개인정보에 대한 접근 제한</li>
                  <li>개인정보를 저장하는 데이터베이스 시스템에 대한 접근권한의 부여·변경·말소를 통한 개인정보에 대한 접근통제</li>
                  <li>해킹이나 컴퓨터 바이러스 등에 의한 개인정보 유출 및 훼손을 막기 위한 보안프로그램 설치</li>
                  <li>개인정보의 암호화</li>
                  <li>접속기록의 보관 및 위변조 방지</li>
                </ul>
              </div>
            </section>

            <section id="section9" className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">9. 개인정보 보호책임자</h2>
              <div className="space-y-4 text-gray-700">
                <p>회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 정보주체의 불만처리 및 피해구제 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다:</p>

                <div className="bg-gray-50 p-6 rounded">
                  <h3 className="font-semibold mb-4">개인정보 보호책임자</h3>
                  <ul className="space-y-2">
                    <li><strong>성명:</strong> 개인정보보호책임자</li>
                    <li><strong>직책:</strong> 개발팀장</li>
                    <li><strong>연락처:</strong> privacy@jupiter.com, 02-1234-5678</li>
                  </ul>
                </div>

                <p className="mt-4">정보주체께서는 회사의 서비스를 이용하시면서 발생한 모든 개인정보 보호 관련 문의, 불만처리, 피해구제 등에 관한 사항을 개인정보 보호책임자 및 담당부서로 문의하실 수 있습니다.</p>
              </div>
            </section>

            <section id="section10" className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">10. 개인정보처리방침 변경</h2>
              <div className="space-y-4 text-gray-700">
                <p>이 개인정보처리방침은 시행일로부터 적용되며, 법령 및 방침에 따른 변경내용의 추가, 삭제 및 정정이 있는 경우에는 변경사항의 시행 7일 전부터 공지사항을 통하여 고지할 것입니다.</p>

                <div className="bg-blue-50 p-4 rounded">
                  <p className="text-blue-800">
                    <strong>현재 개인정보처리방침 버전:</strong> v1.0<br />
                    <strong>시행일자:</strong> 2024년 1월 1일
                  </p>
                </div>
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

export default Privacy;