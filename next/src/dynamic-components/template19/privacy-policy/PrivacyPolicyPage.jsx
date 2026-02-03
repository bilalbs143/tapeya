'use client';

import React from 'react';

import { useTranslations } from '@/hooks/useTranslations';

function PrivacyPolicyPage() {
  const privacyContent = {
    en: {
      title: 'Privacy Policy',
      intro1:
        'Artchip ("Artchip", the "Company", "we", "our") is committed to maintaining the highest standards of data privacy, confidentiality and information security. Protecting the confidentiality and integrity of information and of personal data is taken seriously at all times.',
      intro2:
        "This policy is created in accordance with General Data Protection Regulation. Please take some time to read through this policy, and keep an eye out for updates. Whenever we make important changes to the policy, we'll let you know through notifications or other contact methods such as email.",
      privacyPrinciples: 'PRIVACY PRINCIPLES',
      principlesIntro:
        'As Artchip is based in Malta, we follow the rules of the GDPR. This means that whenever we handle your personal data, we always follow the GDPR principles:',
      lawfulness: 'Lawfulness, fairness and transparency:',
      lawfulnessContent:
        'We identify valid grounds for collecting and using personal data. We use personal data in a way that is fair. We do not mislead the data subject and always be clear, open and honest with individuals from the start on how the personal data shall be used.',
      purposeLimitation: 'Purpose limitation:',
      purposeLimitationContent:
        'Artchip is clear about what the purposes for processing information are from the start of the relationship.',
      dataMinimisation: 'Data minimisation:',
      dataMinimisationContent:
        'Ensuring that the personal data we are processing is sufficient to properly fulfil our purpose as well as has a rational link to that purpose. We do not hold data that we do not need for that purpose.',
      accuracy: 'Accuracy:',
      accuracyContent:
        'All reasonable steps are taken to ensure that personal data we hold is not incorrect or misleading. In the event that we discover that personal data is incorrect or misleading, we take the appropriate steps to correct and / or erase it as soon as possible.',
      storageLimitation: 'Storage limitation:',
      storageLimitationContent:
        'Artchip has established retention periods in a separate Data Retention Policy, which outlines the duration of data retention ensuring that no data is kept long than required.',
      integrityConfidentiality: 'Integrity and confidentiality:',
      integrityConfidentialityContent:
        'We ensure that we have the appropriate security measures in place to protect the personal data we hold on individuals.',
      accountability: 'Accountability:',
      accountabilityContent:
        'Artchip has the appropriate measures and records in place to be able to demonstrate our compliance.',
      dataCollection: 'Data Collection at Registration',
      dataCollectionIntro1:
        'When you register for an account with Artchip you enter into a contract with us, as we explain in our Terms and Conditions. For us to be able to perform this contract and provide you with access to our services, we need to collect and process some personal information about you.',
      dataCollectionIntro2:
        'We will only ever ask you for the smallest amount of information that we need and we only ever use it for lawful purposes. We never sell your information to anyone else.',
      dataCollectionIntro3:
        'To register on our website, we require the following data:',
      requiredData: [
        'Username',
        'Password',
        'Date of birth',
        'Phone Number',
        'Bank',
        'Account Holder Name',
        'Account Number',
      ],
      whyCollect: 'Why we collect this information?',
      collectionReasons: [
        'To provide services we think might interest you',
        'To maintain data accuracy',
        'To enhance our services',
      ],
      marketingInfo:
        "We use your personal information to give you personally tailored content and customise the user experience. It's always a way for us to make sure you get the bonuses and services you want. We use the information you give us to send you marketing communication through email, text messages, push notifications, or other mediums. We do this to inform you about offers, services, and other things we think you might find interesting. We'll keep sending you these kinds of messages until you no longer have an account with us, or actively choose to stop receiving messages from us.",
      yourSafety: 'Your safety first',
      safetyIntro:
        'We can ensure the safety of your personal data and player funds as follows:',
      safetyContent:
        'All data that you pass on to us is encrypted by means of Secure Socket Layer (SSL) technology so that it is kept private. SSL is an industry standard used by all trustworthy entities to secure their online transactions with their customers. You can tell that a website is authentic and secure if you see the padlock symbol and HTTPS before the URL as against HTTP, which is not encrypted.',
    },
    id: {
      title: 'Kebijakan Privasi',
      intro1:
        'Artchip ("Artchip", "Perusahaan", "kami", "kami") berkomitmen untuk mempertahankan standar tertinggi privasi data, kerahasiaan dan keamanan informasi. Melindungi kerahasiaan dan integritas informasi serta data pribadi diambil serius setiap saat.',
      intro2:
        'Kebijakan ini dibuat sesuai dengan Peraturan Perlindungan Data Umum. Harap luangkan waktu untuk membaca kebijakan ini, dan perhatikan pembaruan. Setiap kali kami membuat perubahan penting pada kebijakan, kami akan memberi tahu Anda melalui notifikasi atau metode kontak lain seperti email.',
      privacyPrinciples: 'PRINSIP PRIVASI',
      principlesIntro:
        'Karena Artchip berbasis di Malta, kami mengikuti aturan GDPR. Ini berarti bahwa setiap kali kami menangani data pribadi Anda, kami selalu mengikuti prinsip GDPR:',
      lawfulness: 'Kesahan, keadilan dan transparansi:',
      lawfulnessContent:
        'Kami mengidentifikasi alasan yang valid untuk mengumpulkan dan menggunakan data pribadi. Kami menggunakan data pribadi dengan cara yang adil. Kami tidak menyesatkan subjek data dan selalu jelas, terbuka dan jujur dengan individu dari awal tentang bagaimana data pribadi akan digunakan.',
      purposeLimitation: 'Pembatasan tujuan:',
      purposeLimitationContent:
        'Artchip jelas tentang apa tujuan pemrosesan informasi dari awal hubungan.',
      dataMinimisation: 'Minimalisasi data:',
      dataMinimisationContent:
        'Memastikan bahwa data pribadi yang kami proses cukup untuk memenuhi tujuan kami dengan baik serta memiliki hubungan yang rasional dengan tujuan tersebut. Kami tidak menyimpan data yang tidak kami butuhkan untuk tujuan tersebut.',
      accuracy: 'Akurasi:',
      accuracyContent:
        'Semua langkah yang wajar diambil untuk memastikan bahwa data pribadi yang kami pegang tidak salah atau menyesatkan. Jika kami menemukan bahwa data pribadi salah atau menyesatkan, kami mengambil langkah yang tepat untuk memperbaiki dan/atau menghapusnya sesegera mungkin.',
      storageLimitation: 'Pembatasan penyimpanan:',
      storageLimitationContent:
        'Artchip telah menetapkan periode retensi dalam Kebijakan Retensi Data terpisah, yang menguraikan durasi retensi data memastikan bahwa tidak ada data yang disimpan lebih lama dari yang diperlukan.',
      integrityConfidentiality: 'Integritas dan kerahasiaan:',
      integrityConfidentialityContent:
        'Kami memastikan bahwa kami memiliki langkah-langkah keamanan yang tepat untuk melindungi data pribadi yang kami pegang tentang individu.',
      accountability: 'Akuntabilitas:',
      accountabilityContent:
        'Artchip memiliki langkah-langkah dan catatan yang tepat untuk dapat menunjukkan kepatuhan kami.',
      dataCollection: 'Pengumpulan Data saat Pendaftaran',
      dataCollectionIntro1:
        'Ketika Anda mendaftar untuk akun dengan Artchip, Anda memasuki kontrak dengan kami, seperti yang kami jelaskan dalam Syarat dan Ketentuan kami. Agar kami dapat melaksanakan kontrak ini dan memberikan Anda akses ke layanan kami, kami perlu mengumpulkan dan memproses beberapa informasi pribadi tentang Anda.',
      dataCollectionIntro2:
        'Kami hanya akan meminta Anda untuk jumlah informasi terkecil yang kami butuhkan dan kami hanya menggunakannya untuk tujuan yang sah. Kami tidak pernah menjual informasi Anda kepada orang lain.',
      dataCollectionIntro3:
        'Untuk mendaftar di website kami, kami memerlukan data berikut:',
      requiredData: [
        'Username',
        'Password',
        'Tanggal lahir',
        'Nomor Telepon',
        'Bank',
        'Nama Pemegang Akun',
        'Nomor Akun',
      ],
      whyCollect: 'Mengapa kami mengumpulkan informasi ini?',
      collectionReasons: [
        'Untuk menyediakan layanan yang kami pikir mungkin menarik bagi Anda',
        'Untuk mempertahankan akurasi data',
        'Untuk meningkatkan layanan kami',
      ],
      marketingInfo:
        'Kami menggunakan informasi pribadi Anda untuk memberikan konten yang dipersonalisasi dan menyesuaikan pengalaman pengguna. Ini selalu menjadi cara bagi kami untuk memastikan Anda mendapatkan bonus dan layanan yang Anda inginkan. Kami menggunakan informasi yang Anda berikan kepada kami untuk mengirim komunikasi pemasaran melalui email, pesan teks, notifikasi push, atau media lain. Kami melakukan ini untuk memberi tahu Anda tentang penawaran, layanan, dan hal-hal lain yang kami pikir mungkin menarik bagi Anda. Kami akan terus mengirim pesan jenis ini kepada Anda sampai Anda tidak lagi memiliki akun dengan kami, atau secara aktif memilih untuk berhenti menerima pesan dari kami.',
      yourSafety: 'Keselamatan Anda yang utama',
      safetyIntro:
        'Kami dapat memastikan keamanan data pribadi Anda dan dana pemain sebagai berikut:',
      safetyContent:
        'Semua data yang Anda berikan kepada kami dienkripsi menggunakan teknologi Secure Socket Layer (SSL) sehingga tetap pribadi. SSL adalah standar industri yang digunakan oleh semua entitas terpercaya untuk mengamankan transaksi online mereka dengan pelanggan mereka. Anda dapat mengetahui bahwa website otentik dan aman jika Anda melihat simbol gembok dan HTTPS sebelum URL dibandingkan dengan HTTP, yang tidak dienkripsi.',
    },
    ko: {
      title: '개인정보 보호정책',
      intro1:
        'Artchip("Artchip", "회사", "우리", "저희")은 데이터 개인정보 보호, 기밀성 및 정보 보안의 최고 기준을 유지하는 데 전념하고 있습니다. 정보와 개인 데이터의 기밀성과 무결성을 보호하는 것은 항상 진지하게 다뤄집니다.',
      intro2:
        '이 정책은 일반 데이터 보호 규정에 따라 작성되었습니다. 이 정책을 읽어보시고 업데이트를 주의 깊게 살펴보세요. 정책에 중요한 변경사항이 있을 때마다 알림이나 이메일과 같은 다른 연락 방법을 통해 알려드리겠습니다.',
      privacyPrinciples: '개인정보 보호 원칙',
      principlesIntro:
        'Artchip 은 몰타에 기반을 두고 있기 때문에 GDPR 규칙을 따릅니다. 이는 개인 데이터를 처리할 때마다 항상 GDPR 원칙을 따른다는 것을 의미합니다:',
      lawfulness: '합법성, 공정성 및 투명성:',
      lawfulnessContent:
        '개인 데이터 수집 및 사용을 위한 유효한 근거를 식별합니다. 우리는 공정한 방식으로 개인 데이터를 사용합니다. 데이터 주체를 오도하지 않으며 개인 데이터가 어떻게 사용될 것인지에 대해 처음부터 항상 명확하고, 개방적이며, 정직합니다.',
      purposeLimitation: '목적 제한:',
      purposeLimitationContent:
        'Artchip 은 관계 시작부터 정보 처리 목적이 무엇인지 명확합니다.',
      dataMinimisation: '데이터 최소화:',
      dataMinimisationContent:
        '처리하는 개인 데이터가 목적을 적절히 달성하기에 충분하고 해당 목적과 합리적인 연결을 가지고 있는지 확인합니다. 해당 목적에 필요하지 않은 데이터는 보유하지 않습니다.',
      accuracy: '정확성:',
      accuracyContent:
        '보유한 개인 데이터가 부정확하거나 오해의 소지가 없도록 모든 합리적인 조치를 취합니다. 개인 데이터가 부정확하거나 오해의 소지가 있다는 것을 발견한 경우, 가능한 한 빨리 수정 및/또는 삭제하기 위한 적절한 조치를 취합니다.',
      storageLimitation: '저장 제한:',
      storageLimitationContent:
        'Artchip 은 별도의 데이터 보존 정책에 보존 기간을 설정했으며, 이는 데이터가 필요한 것보다 오래 보관되지 않도록 데이터 보존 기간을 설명합니다.',
      integrityConfidentiality: '무결성 및 기밀성:',
      integrityConfidentialityContent:
        '개인에 대한 개인 데이터를 보호하기 위한 적절한 보안 조치가 갖춰져 있는지 확인합니다.',
      accountability: '책임성:',
      accountabilityContent:
        'Artchip 은 준수 상황을 입증할 수 있도록 적절한 조치와 기록을 갖추고 있습니다.',
      dataCollection: '등록 시 데이터 수집',
      dataCollectionIntro1:
        'Artchip 에서 계정을 등록할 때 이용약관에서 설명하는 대로 저희와 계약을 체결합니다. 이 계약을 수행하고 서비스에 대한 액세스를 제공하기 위해 귀하에 대한 일부 개인 정보를 수집하고 처리해야 합니다.',
      dataCollectionIntro2:
        '저희는 필요한 최소한의 정보만 요청하며 합법적인 목적으로만 사용합니다. 귀하의 정보를 다른 사람에게 판매하지 않습니다.',
      dataCollectionIntro3: '웹사이트에 등록하려면 다음 데이터가 필요합니다:',
      requiredData: [
        '사용자명',
        '비밀번호',
        '생년월일',
        '전화번호',
        '은행',
        '계좌 소유자명',
        '계좌번호',
      ],
      whyCollect: '이 정보를 수집하는 이유는 무엇인가요?',
      collectionReasons: [
        '귀하가 관심을 가질 수 있는 서비스를 제공하기 위해',
        '데이터 정확성을 유지하기 위해',
        '서비스를 향상시키기 위해',
      ],
      marketingInfo:
        '개인 정보를 사용하여 개인 맞춤형 콘텐츠를 제공하고 사용자 경험을 맞춤화합니다. 이는 항상 귀하가 원하는 보너스와 서비스를 받을 수 있도록 하는 방법입니다. 제공해주신 정보를 사용하여 이메일, 문자 메시지, 푸시 알림 또는 기타 매체를 통해 마케팅 커뮤니케이션을 보냅니다. 이는 귀하가 흥미로워할 수 있는 제안, 서비스 및 기타 사항에 대해 알리기 위함입니다. 귀하가 저희와 계정을 더 이상 가지고 있지 않거나 저희로부터 메시지 수신을 중단하기로 적극적으로 선택할 때까지 이러한 종류의 메시지를 계속 보내드리겠습니다.',
      yourSafety: '귀하의 안전이 최우선',
      safetyIntro:
        '개인 데이터와 플레이어 자금의 안전을 다음과 같이 보장할 수 있습니다:',
      safetyContent:
        '저희에게 전달하는 모든 데이터는 Secure Socket Layer(SSL) 기술을 통해 암호화되어 개인적으로 유지됩니다. SSL은 모든 신뢰할 수 있는 기업이 고객과의 온라인 거래를 보호하기 위해 사용하는 업계 표준입니다. URL 앞에 자물쇠 기호와 HTTPS가 있는 경우 웹사이트가 진정하고 안전하다는 것을 알 수 있으며, 이는 암호화되지 않은 HTTP와 대조됩니다.',
    },
  };

  const { currentLocale } = useTranslations();
  const currentContent = privacyContent[currentLocale] || privacyContent.en;

  return (
    <div className="text-white">
      <div className="container mx-auto px-3 py-7">
        {/* Main Content with Border */}
        <div className="">
          {/* Border Container */}
          <div
            className="overflow-hidden rounded-[3px] border-1 md:ml-3"
            style={{ borderColor: '#06D6A04D' }}
          >
            <div className="bg-transparent p-6 md:p-12">
              {/* Header */}
              <div className="mb-8">
                <h1 className="mobile-title mb-4 bg-[#FFFFFF] bg-clip-text text-[20px] font-semibold text-white md:text-[30px]">
                  {currentContent.title}
                </h1>
              </div>

              {/* Content */}
              <div className="space-y-6">
                <p className="mobile-content text-[10px] text-[#CCCCCC] md:text-[16px]">
                  {currentContent.intro1}
                </p>

                <p className="mobile-content text-[10px] text-[#CCCCCC] md:text-[16px]">
                  {currentContent.intro2}
                </p>

                <h2 className="mobile-section-heading mt-8 mb-4 bg-[#FFFFFF] bg-clip-text font-bold text-white">
                  {currentContent.privacyPrinciples}
                </h2>

                <p className="mobile-content text-[10px] text-[#CCCCCC] md:text-[16px]">
                  {currentContent.principlesIntro}
                </p>

                <div className="space-y-4">
                  <div>
                    <h3 className="mobile-subsection-heading mb-2 bg-[#FFFFFF] bg-clip-text font-bold text-white">
                      {currentContent.lawfulness}
                    </h3>
                    <p className="mobile-content text-[10px] text-[#CCCCCC] md:text-[16px]">
                      {currentContent.lawfulnessContent}
                    </p>
                  </div>

                  <div>
                    <h3 className="mobile-subsection-heading mb-2 bg-[#FFFFFF] bg-clip-text font-bold text-white">
                      {currentContent.purposeLimitation}
                    </h3>
                    <p className="mobile-content text-[10px] text-[#CCCCCC] md:text-[16px]">
                      {currentContent.purposeLimitationContent}
                    </p>
                  </div>

                  <div>
                    <h3 className="mobile-subsection-heading mb-2 bg-[#FFFFFF] bg-clip-text font-bold text-white">
                      {currentContent.dataMinimisation}
                    </h3>
                    <p className="mobile-content text-[10px] text-[#CCCCCC] md:text-[16px]">
                      {currentContent.dataMinimisationContent}
                    </p>
                  </div>

                  <div>
                    <h3 className="mobile-subsection-heading mb-2 bg-[#FFFFFF] bg-clip-text font-bold text-white">
                      {currentContent.accuracy}
                    </h3>
                    <p className="mobile-content text-[10px] text-[#CCCCCC] md:text-[16px]">
                      {currentContent.accuracyContent}
                    </p>
                  </div>

                  <div>
                    <h3 className="mobile-subsection-heading mb-2 bg-[#FFFFFF] bg-clip-text font-bold text-white">
                      {currentContent.storageLimitation}
                    </h3>
                    <p className="mobile-content text-[10px] text-[#CCCCCC] md:text-[16px]">
                      {currentContent.storageLimitationContent}
                    </p>
                  </div>

                  <div>
                    <h3 className="mobile-subsection-heading mb-2 bg-[#FFFFFF] bg-clip-text font-bold text-white">
                      {currentContent.integrityConfidentiality}
                    </h3>
                    <p className="mobile-content text-[10px] text-[#CCCCCC] md:text-[16px]">
                      {currentContent.integrityConfidentialityContent}
                    </p>
                  </div>

                  <div>
                    <h3 className="mobile-subsection-heading mb-2 bg-[#FFFFFF] bg-clip-text font-bold text-white">
                      {currentContent.accountability}
                    </h3>
                    <p className="mobile-content text-[10px] text-[#CCCCCC] md:text-[16px]">
                      {currentContent.accountabilityContent}
                    </p>
                  </div>
                </div>

                <h2 className="mobile-section-heading mt-8 mb-4 bg-[#FFFFFF] bg-clip-text font-bold text-white">
                  {currentContent.dataCollection}
                </h2>

                <p className="mobile-content text-[10px] text-[#CCCCCC] md:text-[16px]">
                  {currentContent.dataCollectionIntro1}
                </p>

                <p className="mobile-content text-[10px] text-[#CCCCCC] md:text-[16px]">
                  {currentContent.dataCollectionIntro2}
                </p>

                <p className="mobile-content text-[10px] text-[#CCCCCC] md:text-[16px]">
                  {currentContent.dataCollectionIntro3}
                </p>

                <ul className="ml-4 list-inside list-disc space-y-2">
                  {currentContent.requiredData.map((item, index) => (
                    <li
                      key={index}
                      className="mobile-list-item text-[10px] text-[#CCCCCC] md:text-[16px]"
                    >
                      {item}
                    </li>
                  ))}
                </ul>

                <h3 className="mobile-subsection-heading mt-6 mb-2 bg-[#FFFFFF] bg-clip-text font-bold text-white">
                  {currentContent.whyCollect}
                </h3>
                <ul className="ml-4 list-inside list-disc space-y-2">
                  {currentContent.collectionReasons.map((reason, index) => (
                    <li
                      key={index}
                      className="mobile-list-item text-[10px] text-[#CCCCCC] md:text-[16px]"
                    >
                      {reason}
                    </li>
                  ))}
                </ul>

                <p className="mobile-content text-[10px] text-[#CCCCCC] md:text-[16px]">
                  {currentContent.marketingInfo}
                </p>

                <h2 className="mobile-section-heading mt-8 mb-4 bg-[#FFFFFF] bg-clip-text font-bold text-white">
                  {currentContent.yourSafety}
                </h2>

                <p className="mobile-content text-[10px] text-[#CCCCCC] md:text-[16px]">
                  {currentContent.safetyIntro}
                </p>

                <p className="mobile-content text-[10px] text-[#CCCCCC] md:text-[16px]">
                  {currentContent.safetyContent}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PrivacyPolicyPage;
