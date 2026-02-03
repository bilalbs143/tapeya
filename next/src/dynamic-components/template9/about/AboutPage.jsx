'use client';

import React from 'react';

import { useLanguage } from '@/providers/LanguageProvider';

function AboutPage() {
  const aboutContent = {
    en: {
      title: 'About Us',
      content: `Artchip is a premier online entertainment brand that has established itself as a leading force in the Asia-Pacific gaming market. With our headquarters strategically located and a strong presence across multiple Asian markets, we have become synonymous with excellence, innovation, and unparalleled gaming experiences.

Our journey began with a simple yet powerful vision: to create an online gaming platform that transcends traditional boundaries and delivers entertainment that is both accessible and extraordinary. Today, Artchip stands as a testament to that vision, offering a comprehensive suite of gaming options that cater to every type of player.

What sets Artchip apart is our unwavering commitment to quality and user experience. We understand that our players deserve nothing but the best, which is why we have partnered with the world's leading game providers to offer an extensive library of games. From classic table games to cutting-edge slots, from live casino experiences to sports betting, our platform provides endless entertainment possibilities.

Our commitment to security and fair play is paramount. We employ state-of-the-art encryption technology and rigorous security protocols to ensure that every transaction and gaming session is protected. Our games are regularly audited by independent third-party organizations to guarantee fairness and transparency.

At Artchip, we believe in building lasting relationships with our players. Our customer support team is available 24/7 to assist with any questions or concerns, ensuring that help is always just a click away. We also offer a comprehensive loyalty program that rewards our most dedicated players with exclusive bonuses and promotions.

As we continue to grow and evolve, our mission remains clear: to provide the most engaging, secure, and rewarding online gaming experience in the Asia-Pacific region. We invite you to join the Artchip family and discover why we are the preferred choice for millions of players across Asia.`,
    },
    id: {
      title: 'Tentang Kami',
      content: `Artchip adalah merek hiburan online terkemuka yang telah membangun dirinya sebagai kekuatan terdepan di pasar game Asia-Pasifik. Dengan kantor pusat yang strategis dan kehadiran yang kuat di berbagai pasar Asia, kami telah menjadi sinonim dengan keunggulan, inovasi, dan pengalaman bermain yang tak tertandingi.

Perjalanan kami dimulai dengan visi yang sederhana namun kuat: menciptakan platform game online yang melampaui batas tradisional dan memberikan hiburan yang dapat diakses dan luar biasa. Hari ini, Artchip berdiri sebagai bukti visi tersebut, menawarkan rangkaian lengkap opsi permainan yang memenuhi setiap jenis pemain.

Yang membedakan Artchip adalah komitmen kami yang teguh terhadap kualitas dan pengalaman pengguna. Kami memahami bahwa pemain kami pantas mendapatkan yang terbaik, itulah mengapa kami telah bermitra dengan penyedia game terkemuka dunia untuk menawarkan perpustakaan game yang luas. Dari permainan meja klasik hingga slot canggih, dari pengalaman live casino hingga taruhan olahraga, platform kami menyediakan kemungkinan hiburan yang tak terbatas.

Komitmen kami terhadap keamanan dan permainan yang adil adalah yang utama. Kami menggunakan teknologi enkripsi canggih dan protokol keamanan yang ketat untuk memastikan bahwa setiap transaksi dan sesi permainan terlindungi. Game kami secara rutin diaudit oleh organisasi pihak ketiga independen untuk menjamin keadilan dan transparansi.

Di Artchip, kami percaya dalam membangun hubungan yang langgeng dengan pemain kami. Tim dukungan pelanggan kami tersedia 24/7 untuk membantu dengan pertanyaan atau masalah apa pun, memastikan bahwa bantuan selalu hanya dengan satu klik. Kami juga menawarkan program loyalitas komprehensif yang memberi penghargaan kepada pemain kami yang paling setia dengan bonus dan promosi eksklusif.

Saat kami terus tumbuh dan berkembang, misi kami tetap jelas: memberikan pengalaman game online yang paling menarik, aman, dan bermanfaat di wilayah Asia-Pasifik. Kami mengundang Anda untuk bergabung dengan keluarga Artchip dan menemukan mengapa kami adalah pilihan yang disukai untuk jutaan pemain di seluruh Asia.`,
    },
    ko: {
      title: '회사 소개',
      content: `Artchip 은 아시아-태평양 게임 시장에서 선도적인 힘으로 자리 잡은 프리미엄 온라인 엔터테인먼트 브랜드입니다. 전략적으로 위치한 본사와 여러 아시아 시장에서의 강력한 입지를 바탕으로, 우리는 우수성, 혁신, 그리고 비교할 수 없는 게임 경험의 동의어가 되었습니다.

우리의 여정은 간단하지만 강력한 비전으로 시작되었습니다: 전통적인 경계를 초월하고 접근 가능하면서도 특별한 엔터테인먼트를 제공하는 온라인 게임 플랫폼을 만드는 것입니다. 오늘날 Artchip 은 그 비전의 증거로 서 있으며, 모든 유형의 플레이어를 위한 포괄적인 게임 옵션을 제공합니다.

Artchip 을 차별화하는 것은 품질과 사용자 경험에 대한 우리의 흔들림 없는 헌신입니다. 우리는 플레이어들이 최고의 것만을 받을 자격이 있다고 믿기 때문에, 세계 최고의 게임 제공업체들과 파트너십을 맺어 광범위한 게임 라이브러리를 제공합니다. 클래식 테이블 게임부터 최첨단 슬롯까지, 라이브 카지노 경험부터 스포츠 베팅까지, 우리의 플랫폼은 끝없는 엔터테인먼트 가능성을 제공합니다.

보안과 공정한 플레이에 대한 우리의 헌신은 최우선입니다. 우리는 모든 거래와 게임 세션이 보호되도록 최첨단 암호화 기술과 엄격한 보안 프로토콜을 사용합니다. 우리의 게임은 공정성과 투명성을 보장하기 위해 독립적인 제3자 조직에 의해 정기적으로 감사를 받습니다.

Artchip 에서 우리는 플레이어들과 지속적인 관계를 구축하는 것을 믿습니다. 우리의 고객 지원 팀은 24/7로 이용 가능하여 모든 질문이나 우려사항을 도와주며, 도움이 항상 클릭 한 번으로 가능하도록 보장합니다. 우리는 또한 가장 헌신적인 플레이어들에게 독점 보너스와 프로모션으로 보상하는 포괄적인 로열티 프로그램을 제공합니다.

우리가 계속 성장하고 발전함에 따라, 우리의 미션은 명확합니다: 아시아-태평양 지역에서 가장 매력적이고, 안전하며, 보람 있는 온라인 게임 경험을 제공하는 것입니다. 우리는 여러분을 Artchip 가족에 초대하며, 왜 우리가 아시아 전역의 수백만 명의 플레이어들이 선호하는 선택인지 발견하시기 바랍니다.`,
    },
  };

  const { currentLocale } = useLanguage();
  const currentContent = aboutContent[currentLocale] || aboutContent.en;

  return (
    <div className="text-white">
      <div className="container mx-auto px-4 py-7 md:px-4">
        <div className="mb-6 flex sm:hidden">
          <button
            onClick={() => handleTabChange('Home')}
            className="flex h-[37px] w-[138px] items-center justify-center gap-2 rounded-[3px] bg-[#9D4EDD] text-[10px] font-bold text-white transition-all duration-300 hover:border-[#9D4EDD] hover:bg-[#9D4EDD]"
            style={{
              padding: '0 10px',
              letterSpacing: '0.3px',
            }}
          >
            <svg
              width="13"
              height="8"
              viewBox="0 0 13 8"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="relative -ml-[3px]"
              style={{
                transform: 'translateY(1px)',
              }}
            >
              <path
                d="M0.146446 3.32809C-0.0488157 3.52335 -0.0488157 3.83993 0.146446 4.03519L3.32843 7.21717C3.52369 7.41244 3.84027 7.41244 4.03553 7.21717C4.2308 7.02191 4.2308 6.70533 4.03553 6.51007L1.20711 3.68164L4.03553 0.853213C4.2308 0.657951 4.2308 0.341368 4.03553 0.146106C3.84027 -0.0491562 3.52369 -0.0491563 3.32843 0.146106L0.146446 3.32809ZM12.5 3.68164L12.5 3.18164L0.5 3.18164L0.5 3.68164L0.5 4.18164L12.5 4.18164L12.5 3.68164Z"
                fill="#ffffff"
              />
            </svg>
            <span style={{ fontSize: '12px', fontWeight: 700 }}>
              Back to Home
            </span>
          </button>
        </div>

        {/* Main Content with Border */}
        <div className="">
          {/* Border Container */}
          <div
            className="overflow-hidden rounded-[3px] border-1 md:rounded-[5px]"
            style={{ borderColor: '#DBB42C4D' }}
          >
            <div className="bg-transparent p-6 md:p-10">
              {/* Header */}
              <div className="mb-2">
                <h1 className="mobile-title mb-4 bg-[#FFFFFF] bg-clip-text text-[20px] font-bold text-white md:text-[30px]">
                  {currentContent.title}
                </h1>
              </div>

              {/* Content */}
              <div className="space-y-6">
                <p className="mobile-content text-[10px] text-[#FFFFFFCC] md:text-[16px]">
                  {currentContent.content}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AboutPage;
