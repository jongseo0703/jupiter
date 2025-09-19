
function AboutUs() {
  const teamMembers = [
    {
      name: '박종서',
      position: 'CEO',
      image: '/images/team-1.png',
      description: '20년간 IT 및 유통업계에서 쌓은 경험으로 주류 시장의 혁신을 이끌어갑니다.'
    },
    {
      name: '인희진',
      position: '데이터분석 팀장',
      image: '/images/team-2.png',
      description: '빅데이터 전문가로 정확한 실시간 가격 정보를 제공합니다.'
    },
    {
      name: '손소희',
      position: '파트너십 팀장',
      image: '/images/team-3.png',
      description: '국내외 주류 판매처와의 제휴를 통해 최저가 서비스를 실현합니다.'
    }
  ];

  const values = [
    {
      icon: 'fas fa-search-dollar',
      title: '최저가 보장',
      description: '소주, 맥주, 와인 등 모든 주류의 실시간 최저가를 찾아드립니다.'
    },
    {
      icon: 'fas fa-certificate',
      title: '정품 인증',
      description: '모든 제휴 판매처는 정품 보증을 통해 안전한 구매를 보장합니다.'
    },
    {
      icon: 'fas fa-sync-alt',
      title: '실시간 업데이트',
      description: '매 시간 가격 정보를 업데이트하여 항상 최신 정보를 제공합니다.'
    },
    {
      icon: 'fas fa-users',
      title: '고객 만족',
      description: '합리적인 가격으로 원하는 주류를 찾을 수 있도록 최선을 다합니다.'
    }
  ];

  const stats = [
    { number: '50,000+', label: '만족한 고객' },
    { number: '1,000+', label: '제품 종류' },
    { number: '99.9%', label: '신선도 보장' },
    { number: '24시간', label: '배송 시간' }
  ];

  return (
    <div className="py-16 bg-gray-50">
      {/* 페이지 헤더 */}
      <div
        className="relative py-24 mb-12 bg-cover bg-center"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80')" }}
      >
        <div className="absolute inset-0 bg-black opacity-50 backdrop-blur-md"></div>
        <div className="relative container mx-auto px-4 text-center text-white">
          <h1 className="text-4xl font-bold mb-4">회사 소개</h1>
          <p className="text-lg">스마트한 주류 쇼핑의 시작, Ju(酒)piter입니다</p>
        </div>
      </div>

      {/* 회사 소개 섹션 */}
      <div className="container mx-auto px-4 mb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">
              주류 최저가를 찾아주는 <span className="text-primary">Ju(酒)piter</span>
            </h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              2025년 설립된 Ju(酒)piter는 주류 애호가들을 위한 가격 비교 서비스를 제공합니다.
              국내외 수십 개의 온라인 쇼핑몰과 제휴하여 위스키, 코냑, 보드카 등 다양한
              프리미엄 주류의 실시간 가격 정보를 제공합니다.
            </p>
            <p className="text-gray-600 leading-relaxed mb-6">
              정품 보증은 물론 최저가 보장 서비스로 고객이 합리적인 가격으로
              원하는 주류를 구매할 수 있도록 돕습니다. 복잡한 가격 비교는 우리가,
              현명한 구매 결정은 고객이 할 수 있도록 지원하는 것이 우리의 목표입니다.
            </p>
            <div className="flex items-center space-x-4">
              <button className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors duration-300">
                더 알아보기
              </button>
              <button className="border border-primary text-primary px-6 py-3 rounded-lg hover:bg-primary hover:text-white transition-colors duration-300">
                연락하기
              </button>
            </div>
          </div>
          
          <div className="relative">
            <img
              src="/images/about-us.png"
              alt="About Jupiter"
              className="w-full h-96 object-cover rounded-lg shadow-lg"
            />
            <div className="absolute -bottom-6 -left-6 bg-secondary text-white p-6 rounded-lg shadow-lg">
              <div className="text-center">
                <div className="text-3xl font-bold">14년</div>
                <div className="text-sm">신뢰의 경험</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 핵심 가치 섹션 */}
      <div className="bg-white py-16 mb-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">우리의 핵심 가치</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Jupiter가 고객에게 약속하는 네 가지 핵심 가치입니다.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="text-center group">
                <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <i className={`${value.icon} text-xl`}></i>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">{value.title}</h3>
                <p className="text-gray-600 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 통계 섹션 */}
      <div className="bg-primary text-white py-16 mb-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold mb-2">{stat.number}</div>
                <div className="text-lg opacity-90">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 팀 소개 섹션 */}
      <div className="container mx-auto px-4 mb-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">우리 팀을 소개합니다</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            각 분야의 전문가들이 모여 최고의 서비스를 제공합니다.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {teamMembers.map((member, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300">
              <img
                src={member.image}
                alt={member.name}
                className="w-full h-64 object-cover"
              />
              <div className="p-6 text-center">
                <h3 className="text-xl font-bold text-gray-800 mb-1">{member.name}</h3>
                <p className="text-primary font-semibold mb-3">{member.position}</p>
                <p className="text-gray-600 text-sm leading-relaxed">{member.description}</p>
                
                {/* 소셜 미디어 링크 */}
                <div className="flex justify-center space-x-3 mt-4">
                  <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                    <i className="fab fa-linkedin"></i>
                  </a>
                  <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                    <i className="fab fa-twitter"></i>
                  </a>
                  <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                    <i className="fab fa-instagram"></i>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 인증 및 수상 섹션 */}
      <div className="bg-white py-16 mb-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">인증 및 수상</h2>
            <p className="text-gray-600">우리의 품질과 서비스를 인정받은 다양한 인증서와 상입니다.</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { name: '개인정보보호', icon: 'fas fa-shield-alt' },
              { name: '실시간 데이터', icon: 'fas fa-sync-alt' },
              { name: '정품 인증', icon: 'fas fa-certificate' },
              { name: '24시간 모니터링', icon: 'fas fa-clock' }
            ].map((cert, index) => (
              <div key={index} className="text-center group">
                <div className="w-16 h-16 bg-gray-100 text-primary rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                  <i className={`${cert.icon} text-2xl`}></i>
                </div>
                <h4 className="font-semibold text-gray-800">{cert.name}</h4>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA 섹션 */}
      <div className="bg-primary text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">지금 바로 시작하세요!</h2>
          <p className="text-lg mb-8 opacity-90">
            합리적인 가격으로 원하는 주류를 찾아보세요.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <button className="bg-white text-primary px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors duration-300 font-semibold">
              가격 비교하기
            </button>
            <button className="border-2 border-white text-white px-8 py-3 rounded-lg hover:bg-white hover:text-primary transition-colors duration-300 font-semibold">
              서비스 이용방법
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AboutUs;