'use client';
import React from 'react';

import { useLanguage } from '@/providers/LanguageProvider';

function ResponsibleGamblingPage() {
  const responsibleGamblingContent = {
    en: {
      title: 'Responsible Gambling',
      mainHeading: 'Keep your gambling under control, keep it fun.',
      mainContent:
        "We're proud and happy that you are enjoying our games but because you are our guests, we feel responsible for your welfare and genuinely care about you. Online gaming should be fun and exciting and we want it to stay that way for our players. So, if you don't see the pleasure in gaming anymore and you tend to spend more than planned, we will help you bring your gaming under control. Our staff are trained to watch out for members who might be showing signs of problematic gambling and if a player indicates that gambling is becoming a problem for themselves, we will give them the best help possible.",
      underageHeading: 'Underage gambling',
      underageContent:
        "It's strictly forbidden for persons under the age of 18 to open an account at Artchip.",
      reminder:
        "Remember, gambling should always be fun and entertaining. If it stops being fun, it's time to stop. Our support team is here to help you maintain control and enjoy gambling responsibly.",
    },
    id: {
      title: 'Perjudian Bertanggung Jawab',
      mainHeading:
        'Jaga perjudian Anda tetap terkendali, jaga tetap menyenangkan.',
      mainContent:
        'Kami bangga dan senang bahwa Anda menikmati permainan kami tetapi karena Anda adalah tamu kami, kami merasa bertanggung jawab atas kesejahteraan Anda dan benar-benar peduli dengan Anda. Game online seharusnya menyenangkan dan mengasyikkan dan kami ingin tetap seperti itu untuk pemain kami. Jadi, jika Anda tidak lagi melihat kesenangan dalam bermain game dan cenderung menghabiskan lebih dari yang direncanakan, kami akan membantu Anda mengendalikan permainan Anda. Staf kami dilatih untuk memperhatikan anggota yang mungkin menunjukkan tanda-tanda perjudian bermasalah dan jika pemain menunjukkan bahwa perjudian menjadi masalah bagi diri mereka sendiri, kami akan memberikan bantuan terbaik yang mungkin.',
      underageHeading: 'Perjudian di bawah umur',
      underageContent:
        'Sangat dilarang bagi orang di bawah usia 18 tahun untuk membuka akun di Artchip.',
      reminder:
        'Ingat, perjudian harus selalu menyenangkan dan menghibur. Jika tidak lagi menyenangkan, saatnya berhenti. Tim dukungan kami ada di sini untuk membantu Anda mempertahankan kendali dan menikmati perjudian secara bertanggung jawab.',
    },
    ko: {
      title: '책임감 있는 도박',
      mainHeading: '도박을 통제하고, 재미있게 유지하세요.',
      mainContent:
        '저희 게임을 즐기고 계신다는 것이 자랑스럽고 기쁘지만, 여러분이 저희 손님이기 때문에 저희는 여러분의 복지에 책임을 느끼고 진심으로 걱정합니다. 온라인 게임은 재미있고 흥미로워야 하며, 저희는 플레이어들이 그렇게 유지되기를 원합니다. 따라서 게임에서 더 이상 즐거움을 느끼지 못하고 계획보다 더 많이 지출하는 경향이 있다면, 저희는 게임을 통제할 수 있도록 도와드리겠습니다. 저희 직원들은 문제가 있는 도박의 징후를 보일 수 있는 회원들을 주의 깊게 살펴보도록 훈련받았으며, 플레이어가 도박이 자신에게 문제가 되고 있다고 표시하면 최선의 도움을 제공하겠습니다.',
      underageHeading: '미성년자 도박',
      underageContent:
        '18세 미만의 사람이 Artchip 에서 계정을 여는 것은 엄격히 금지됩니다.',
      reminder:
        '기억하세요, 도박은 항상 재미있고 즐거워야 합니다. 더 이상 재미가 없다면 그만둘 때입니다. 저희 지원팀은 통제를 유지하고 책임감 있게 도박을 즐길 수 있도록 도와드리기 위해 여기에 있습니다.',
    },
  };

  const { currentLocale } = useLanguage();
  const currentContent =
    responsibleGamblingContent[currentLocale] || responsibleGamblingContent.en;

  return (
    <div className="text-white">
      <div className="container mx-auto py-8">
        {/* Main Content with Border */}
        <div className="">
          {/* Border Container */}
          <div
            className="overflow-hidden rounded-[6px] border-1"
            style={{ borderColor: '#03c72c4d' }}
          >
            <div className="p-6 md:p-12">
              {/* Header */}
              <div className="mb-8">
                <h1 className="mobile-title mb-4 bg-[#55BC55] bg-clip-text text-[20px] font-semibold text-transparent md:text-[30px]">
                  {currentContent.title}
                </h1>
              </div>

              {/* Content */}
              <div className="space-y-6">
                <section>
                  <h2 className="mobile-section-heading mb-4 bg-gradient-to-r from-[#55BC55] via-[#55BC55] to-[#55BC55] bg-clip-text font-bold text-transparent">
                    {currentContent.mainHeading}
                  </h2>
                  <p className="mobile-content text-gray-300">
                    {currentContent.mainContent}
                  </p>
                </section>

                <section>
                  <h2 className="mobile-section-heading mb-4 bg-gradient-to-r from-[#55BC55] via-[#55BC55] to-[#55BC55] bg-clip-text font-bold text-transparent">
                    {currentContent.underageHeading}
                  </h2>
                  <p className="mobile-content text-gray-300">
                    {currentContent.underageContent}
                  </p>
                </section>

                <div
                  className="mt-8 rounded-lg border p-6"
                  style={{
                    borderColor: '#03c72c4d',
                    background: 'transparent',
                  }}
                >
                  <p className="mobile-content text-center text-gray-300">
                    {currentContent.reminder}
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

export default ResponsibleGamblingPage;
