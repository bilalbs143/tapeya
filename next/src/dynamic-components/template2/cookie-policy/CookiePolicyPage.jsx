'use client';
import React from 'react';

import { useLanguage } from '@/providers/LanguageProvider';

function CookiePolicyPage() {
  const cookieContent = {
    en: {
      title: 'Cookie Policy',
      intro:
        'This policy explains how we use cookies and similar technologies on our website to enhance your browsing experience and provide personalized services.',
      whatAreCookies: '1. What Are Cookies?',
      whatAreCookiesContent:
        'Cookies are small text files stored on your device to help websites function and collect information about your usage. They enable us to remember your preferences and provide a more personalized experience.',
      howWeUse: '2. How We Use Cookies',
      howWeUseContent:
        'We use cookies to improve your experience, analyze site traffic, and personalize content. This helps us understand how visitors interact with our site and allows us to optimize performance and functionality.',
      typesOfCookies: '3. Types of Cookies We Use',
      typesIntro:
        'We utilize several types of cookies to provide the best possible experience:',
      essentialCookies:
        'Essential Cookies: Required for basic site functionality and security',
      performanceCookies:
        'Performance Cookies: Help us understand how visitors use our site',
      functionalCookies:
        'Functional Cookies: Remember your preferences and settings',
      advertisingCookies:
        'Advertising Cookies: Deliver relevant content and advertisements',
      managingCookies: '4. Managing Cookies',
      managingCookiesContent:
        'You can control cookies through your browser settings. Most browsers allow you to block or delete cookies, though disabling certain cookies may affect your experience on our site. We recommend keeping essential cookies enabled for optimal functionality.',
      thirdPartyCookies: '5. Third-Party Cookies',
      thirdPartyCookiesContent:
        'Some cookies on our site are set by third-party services that help us provide additional functionality, such as analytics and social media integration. These services have their own privacy policies regarding cookie usage.',
      contactInfo:
        "For more information about our use of cookies or to update your preferences, please contact our support team. We're committed to transparency and will be happy to address any questions you may have.",
    },
    id: {
      title: 'Kebijakan Cookie',
      intro:
        'Kebijakan ini menjelaskan bagaimana kami menggunakan cookie dan teknologi serupa di website kami untuk meningkatkan pengalaman browsing Anda dan memberikan layanan yang dipersonalisasi.',
      whatAreCookies: '1. Apa Itu Cookie?',
      whatAreCookiesContent:
        'Cookie adalah file teks kecil yang disimpan di perangkat Anda untuk membantu website berfungsi dan mengumpulkan informasi tentang penggunaan Anda. Cookie memungkinkan kami mengingat preferensi Anda dan memberikan pengalaman yang lebih dipersonalisasi.',
      howWeUse: '2. Bagaimana Kami Menggunakan Cookie',
      howWeUseContent:
        'Kami menggunakan cookie untuk meningkatkan pengalaman Anda, menganalisis lalu lintas situs, dan mempersonalisasi konten. Ini membantu kami memahami bagaimana pengunjung berinteraksi dengan situs kami dan memungkinkan kami mengoptimalkan kinerja dan fungsionalitas.',
      typesOfCookies: '3. Jenis Cookie yang Kami Gunakan',
      typesIntro:
        'Kami menggunakan beberapa jenis cookie untuk memberikan pengalaman terbaik:',
      essentialCookies:
        'Cookie Esensial: Diperlukan untuk fungsionalitas dan keamanan situs dasar',
      performanceCookies:
        'Cookie Kinerja: Membantu kami memahami bagaimana pengunjung menggunakan situs kami',
      functionalCookies:
        'Cookie Fungsional: Mengingat preferensi dan pengaturan Anda',
      advertisingCookies:
        'Cookie Iklan: Menyampaikan konten dan iklan yang relevan',
      managingCookies: '4. Mengelola Cookie',
      managingCookiesContent:
        'Anda dapat mengontrol cookie melalui pengaturan browser Anda. Sebagian besar browser memungkinkan Anda memblokir atau menghapus cookie, meskipun menonaktifkan cookie tertentu dapat mempengaruhi pengalaman Anda di situs kami. Kami merekomendasikan untuk tetap mengaktifkan cookie esensial untuk fungsionalitas optimal.',
      thirdPartyCookies: '5. Cookie Pihak Ketiga',
      thirdPartyCookiesContent:
        'Beberapa cookie di situs kami diatur oleh layanan pihak ketiga yang membantu kami memberikan fungsionalitas tambahan, seperti analitik dan integrasi media sosial. Layanan ini memiliki kebijakan privasi sendiri terkait penggunaan cookie.',
      contactInfo:
        'Untuk informasi lebih lanjut tentang penggunaan cookie kami atau untuk memperbarui preferensi Anda, silakan hubungi tim dukungan kami. Kami berkomitmen untuk transparansi dan akan dengan senang hati menjawab pertanyaan yang mungkin Anda miliki.',
    },
    ko: {
      title: '쿠키 정책',
      intro:
        '이 정책은 웹사이트에서 쿠키와 유사한 기술을 사용하여 브라우징 경험을 향상시키고 개인화된 서비스를 제공하는 방법을 설명합니다.',
      whatAreCookies: '1. 쿠키란 무엇인가요?',
      whatAreCookiesContent:
        '쿠키는 웹사이트가 기능하고 사용에 대한 정보를 수집하는 데 도움이 되는 기기에 저장된 작은 텍스트 파일입니다. 쿠키는 귀하의 선호도를 기억하고 더 개인화된 경험을 제공할 수 있게 해줍니다.',
      howWeUse: '2. 쿠키 사용 방법',
      howWeUseContent:
        '우리는 귀하의 경험을 향상시키고, 사이트 트래픽을 분석하며, 콘텐츠를 개인화하기 위해 쿠키를 사용합니다. 이는 방문자가 우리 사이트와 어떻게 상호작용하는지 이해하고 성능과 기능을 최적화할 수 있게 도와줍니다.',
      typesOfCookies: '3. 사용하는 쿠키 유형',
      typesIntro: '최고의 경험을 제공하기 위해 여러 유형의 쿠키를 활용합니다:',
      essentialCookies: '필수 쿠키: 기본 사이트 기능과 보안에 필요',
      performanceCookies:
        '성능 쿠키: 방문자가 사이트를 어떻게 사용하는지 이해하는 데 도움',
      functionalCookies: '기능 쿠키: 귀하의 선호도와 설정을 기억',
      advertisingCookies: '광고 쿠키: 관련 콘텐츠와 광고 전달',
      managingCookies: '4. 쿠키 관리',
      managingCookiesContent:
        '브라우저 설정을 통해 쿠키를 제어할 수 있습니다. 대부분의 브라우저는 쿠키를 차단하거나 삭제할 수 있지만, 특정 쿠키를 비활성화하면 사이트에서의 경험에 영향을 줄 수 있습니다. 최적의 기능을 위해 필수 쿠키를 활성화 상태로 유지하는 것을 권장합니다.',
      thirdPartyCookies: '5. 제3자 쿠키',
      thirdPartyCookiesContent:
        '사이트의 일부 쿠키는 분석 및 소셜 미디어 통합과 같은 추가 기능을 제공하는 데 도움이 되는 제3자 서비스에 의해 설정됩니다. 이러한 서비스는 쿠키 사용에 관한 자체 개인정보 보호정책을 가지고 있습니다.',
      contactInfo:
        '쿠키 사용에 대한 자세한 정보나 선호도 업데이트를 원하시면 지원팀에 문의하세요. 우리는 투명성에 전념하며 귀하가 가질 수 있는 모든 질문에 기꺼이 답변드리겠습니다.',
    },
  };

  const { currentLocale } = useLanguage();
  const currentContent = cookieContent[currentLocale] || cookieContent.en;

  return (
    <div className="text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Main Content with Border */}
        <div className="">
          {/* Border Container */}
          <div className="overflow-hidden rounded-[6px] border-1 border-[#ffffff80]">
            <div className="p-8 md:p-12">
              {/* Header */}
              <div className="mb-8">
                <h1 className="mobile-title mb-4 text-[25px] font-bold text-white">
                  {currentContent.title}
                </h1>
              </div>

              {/* Content */}
              <div className="space-y-6">
                <p className="mobile-content text-gray-300">
                  {currentContent.intro}
                </p>

                <section>
                  <h2 className="mobile-section-heading mb-4 font-bold text-white">
                    {currentContent.whatAreCookies}
                  </h2>
                  <p className="mobile-content text-gray-300">
                    {currentContent.whatAreCookiesContent}
                  </p>
                </section>

                <section>
                  <h2 className="mobile-section-heading mb-4 font-bold text-white">
                    {currentContent.howWeUse}
                  </h2>
                  <p className="mobile-content text-gray-300">
                    {currentContent.howWeUseContent}
                  </p>
                </section>

                <section>
                  <h2 className="mobile-section-heading mb-4 font-bold text-white">
                    {currentContent.typesOfCookies}
                  </h2>
                  <div className="text-gray-300">
                    <p className="mobile-content mb-3">
                      {currentContent.typesIntro}
                    </p>
                    <ul className="ml-6 space-y-2">
                      <li className="flex items-start">
                        <span className="mr-2 text-[#51A2FF]">•</span>
                        <span className="mobile-content">
                          <strong>{currentContent.essentialCookies}</strong>
                        </span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2 text-[#51A2FF]">•</span>
                        <span className="mobile-content">
                          <strong>{currentContent.performanceCookies}</strong>
                        </span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2 text-[#51A2FF]">•</span>
                        <span className="mobile-content">
                          <strong>{currentContent.functionalCookies}</strong>
                        </span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2 text-[#51A2FF]">•</span>
                        <span className="mobile-content">
                          <strong>{currentContent.advertisingCookies}</strong>
                        </span>
                      </li>
                    </ul>
                  </div>
                </section>

                <section>
                  <h2 className="mobile-section-heading mb-4 font-bold text-white">
                    {currentContent.managingCookies}
                  </h2>
                  <p className="mobile-content text-gray-300">
                    {currentContent.managingCookiesContent}
                  </p>
                </section>

                <section>
                  <h2 className="mobile-section-heading mb-4 font-bold text-white">
                    {currentContent.thirdPartyCookies}
                  </h2>
                  <p className="mobile-content text-gray-300">
                    {currentContent.thirdPartyCookiesContent}
                  </p>
                </section>

                <div className="mt-8 rounded-lg border border-[#6456BD]/30 bg-[#1C1D40]/50 p-6">
                  <p className="mobile-content text-center text-gray-300">
                    {currentContent.contactInfo}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CookiePolicyPage;
