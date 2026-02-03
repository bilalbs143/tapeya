'use client';
import React from 'react';

import { useTranslations } from '@/hooks/useTranslations';

function TermsOfUsePage() {
  const termsContent = {
    en: {
      title: 'Terms and Conditions',
      introduction: 'Introduction',
      introContent1:
        'The Terms and Conditions defined in this document regulate the usage of the games (the "Games") provided through www.prgmainbet.com and the other URLs, mobile telephone applications or other products and services licensed to, belonging to or provided by Artchip (the "Website") (collectively, the "Service").',
      introContent2:
        'These Terms and Conditions, the rules applicable to every game on the Website (the "Game Rules") and any document expressly referred to in them, as well as any guidelines or rules posted on the Website constitute the agreement and understanding between the Parties and govern the contractual relationship between Artchip and the Service account holder (the "Account Holder") (and are collectively referred to in this document as the "Agreement"). Please read the Agreement (including these Terms and Conditions) carefully and make sure you understand them. Should you not agree with their contents, please refrain from using the Service any further.',
      general: 'General',
      generalContent1:
        'These Terms and Conditions apply equally irrespective of whether the Service is accessed via telephone, desktop browser, mobile browser, mobile, tablet device, or any other device.',
      generalContent2:
        'Unless otherwise expressly stated, these Terms and Conditions take precedence and prevail in the event of any inconsistencies between them and any other content or document referred to and/ or which forms part of the Agreement.',
      generalContent3:
        'Artchip reserves the right to modify the Terms and Conditions from time to time for a number of reasons, including to comply with applicable laws and regulations, as well as other regulatory requirements. Consequently, we may amend the Agreement at any time. Nevertheless, whenever a substantial amendment is made to the Terms and Conditions, we will notify you via a notice on the Website upon Account login and prior to the changes coming into effect. Upon being notified, you will then be required to re-confirm your acceptance of the contents therein. If you do not agree to the updated Terms and Conditions you will no longer be able to use the Service. The full Terms and Conditions are available on the front page of the Website at all times. It is always recommended that you check the Terms and Conditions prior to use of the Service to ensure that you agree with them. All versions are dated and time stamped.',
      generalContent4:
        'The amendments referred to in the preceding article will become effective immediately upon being posted on the Website. It is your sole responsibility to review the Terms and Conditions, including the specific Game Rules for each Game you choose to participate in to remain updated with all amendments each time you play. Moreover, it is always advisable to review these Terms and Conditions and the Game Rules of the Games you participate in, on a regular basis, so as to not forget their contents.',
      generalContent5:
        'You must read and understand the Terms and Conditions (and the Agreement as a whole) fully before registering an Account. Should you not agree with any part of the Agreement, you must not use or continue to use our Service.',
      generalContent6:
        "These Terms and Conditions become applicable when you register and confirm you're registration details in the registration process on the Website. By registering an Account, you agree that you have read and understood these Terms and Conditions. By using our Service, you confirm that you have accepted and agreed to the contents contained herein.",
      generalContent7:
        'You further acknowledge that by registering and using our Service, you are also bound by the Game Rules, and it is deemed that you have read, understood and accepted all such Game Rules.',
      generalContent8:
        'These Terms and Conditions may be published in a number of languages and shall reflect the same principles. This is for information purposes and to help the Account Holder. It is however only the English version that is the legal basis of the relationship between you and Artchip. In case of any discrepancy between the English version and the non-English version of these Terms and Conditions, the English version shall always prevail.',
      yourObligations: 'Your Obligations',
      obligationsContent1:
        'You may only open one Account at any time on the Website. Artchip retains the right to terminate any duplicate Account.',
      obligationsContent2:
        'If you open or attempt to open more than one Account, for whatever reason, Artchip may block or close any or all of your Accounts at its discretion.',
      obligationsContent3:
        'If you notice that you have more than one registered Account you must notify us immediately.',
      obligationsContent4:
        'Failure to do so may lead to your Account being blocked and/ or closed. In the event that we consider that multiple Accounts have been opened in genuine error, Artchip may, at its sole discretion, agree to credit the first Account which you would have opened with us with any balance remaining in your additional Account(s).',
      obligationsContent5:
        'Persons below the age of 18 are not allowed to participate in the Games. You declare that you are over 18 years of age or comply with a higher minimum legal age as stipulated in the jurisdiction in which you are resident in and under the laws applicable to you. It is your sole responsibility to know whether online gambling is legal in your country of residence. It may be a criminal offences to gamble whilst being under age.',
      obligationsContent6:
        'You are solely responsible for your Account details and the use of your Account via such details. This includes but shall not be limited to the username and password and/or any other means to access your Account via the respective Website. Where you have a suspicion that such information may have been compromised, you must inform Artchip and take proper actions to prohibit or prevent any unauthorises access to any part of your Account or funds.',
      obligationsContent7:
        'You shall use our Service on your own behalf and not on behalf of any other person or entity. An Account may only be held by a natural person. For the avoidance of doubt, company accounts are not permitted. Moreover, you shall not allow any other natural person to access and/or use your Account or accept any prize or access and participate in any of the Artchip services. You understand that you shall be fully liable for any losses incurred by a third party on your Account and you shall immediately inform us should you suspect that a third party has obtained access to your Account, take proper actions to prohibit or prevent any unauthorises access to any part of your Account or funds, and assist us fully in our investigations into the matter.',
      obligationsContent8:
        'You may participate in the Games strictly in your personal non-professional capacity, for recreational and entertainment reasons only and in accordance with all laws, rules and regulations, if and where applicable.',
      obligationsContent9:
        "You are aware that the right to access and use our Service, may be considered illegal in certain countries or that access to our Service from certain countries may mandate limitations due to such a country's status in any recognised index or ranking in the field of financial crime. You are responsible for determining whether your accessing and using our Service is compliant with the applicable laws in your country and you warrant to us that gambling is not illegal in the territory where you reside. Artchip also prohibits persons located in (including temporary visitors) or residents of certain jurisdictions. For the avoidance of doubt, access and registration from countries that do not feature on the dropdown options available at registration stage, is strictly prohibited. Your participation in the Games in a jurisdiction where such participation is prohibited by law or in a jurisdiction which, despite participation not being prohibited, may result in the imposition of limitations on your participation and/or access to the Games in any manner, shall not affect any stakes or payments made to and accrued for the benefit of Artchip.",
      obligationsContent10:
        'You are not allowed to transfer funds from your Account to other Account Holders or to receive funds from other Account Holders into your Account. Accounts are not transferable, and it is prohibited for Account Holders to sell, transfer or acquire Accounts from any other Account Holders.',
      obligationsContent11:
        'As an Account Holder, you are responsible for providing Artchip with correct personal details. To this effect you agree that all information that you give to us, such as but not limited to, an address and email address that is complete and true, and that you will immediately notify Artchip should there be changes to such information. You are hereby notified that we carry out verification procedures and, should Artchip become aware that you have failed to provide to us correct information, we retain the right to block the Account and refuse to process any refunds or winnings.',
      obligationsContent12:
        'You may participate in any Game only if you have enough funds in your Account for such participation.',
      obligationsContent13:
        'You may not use funds that are tainted or associated with any illegality and, in particular, funds that originate from any illegal activity or source. We moreover reserve the right to terminate an Account, ban an Account Holder and retain all funds where that Account Holder is reasonably suspected of engaging in or being directly linked to fraudulent activities which include, but are not limited to, the use of stolen or falsified credit cards or account numbers, chip dumping, software exploitation, forgery, collusion, and the submission of data or documents which are forged, stolen or otherwise misappropriated.',
      obligationsContent14:
        'You are solely responsible for abiding with any reporting processes related to the payment of taxes and/or other fees which might be charged on winnings that you receive from Artchip, if and where applicable.',
      obligationsContent15:
        'In relation to deposits and withdrawals of funds into and from your Account, you acknowledge that you shall only use such credit cards and other financial instruments that are valid and issued by lawful institutions and that legally belong to you. We retain the right to prohibit the use of company credit cards and company bank accounts.',
      obligationsContent16:
        'You understand and acknowledge that it is not permissible for you to play any Games offered by Artchip on credit.',
      obligationsContent17:
        'You understand and acknowledge that by playing the Games, you take the risk of losing money deposited into your Account. Should you not wish to accept this, kindly refrain from using our Service.',
      obligationsContent18:
        "You declare that you are not and shall not be involved in or directly linked to any fraudulent, collusive, fixing or other unlawful activity in relation to your or third parties' participation in any of the Games and shall not use any software-assisted methods or techniques or hardware devices for your participation in any of the Games. We hereby reserve the right to invalidate any betting and deal as we see fit with any funds, should we suspect such behaviour. Moreover, any Account Holder who has reasonable grounds to suspect that another Account Holder is taking an unfair advantage through cheating or collusion is to report the suspicion to Artchip Contact Support.",
      footer:
        'These Terms and Conditions constitute a legally binding agreement between you and Artchip. By using our Service, you acknowledge that you have read, understood, and agreed to be bound by these terms. For any questions or clarifications regarding these terms, please contact our support team.',
    },
    id: {
      title: 'Syarat dan Ketentuan',
      introduction: 'Pendahuluan',
      introContent1:
        'Syarat dan Ketentuan yang didefinisikan dalam dokumen ini mengatur penggunaan permainan (the "Games") yang disediakan melalui www.prgmainbet.com dan URL lainnya, aplikasi telepon seluler atau produk dan layanan lain yang dilisensikan kepada, milik atau disediakan oleh Artchip (the "Website") (secara kolektif, the "Service").',
      introContent2:
        'Syarat dan Ketentuan ini, aturan yang berlaku untuk setiap permainan di Website (the "Game Rules") dan dokumen apa pun yang secara tegas disebutkan di dalamnya, serta pedoman atau aturan apa pun yang diposting di Website membentuk perjanjian dan pemahaman antara Para Pihak dan mengatur hubungan kontrak antara Artchip dan pemegang akun Layanan (the "Account Holder") (dan secara kolektif disebut dalam dokumen ini sebagai the "Agreement"). Harap baca Perjanjian (termasuk Syarat dan Ketentuan ini) dengan cermat dan pastikan Anda memahaminya. Jika Anda tidak setuju dengan isinya, harap jangan menggunakan Layanan lebih lanjut.',
      general: 'Umum',
      generalContent1:
        'Syarat dan Ketentuan ini berlaku sama terlepas dari apakah Layanan diakses melalui telepon, browser desktop, browser seluler, seluler, perangkat tablet, atau perangkat lain.',
      generalContent2:
        'Kecuali dinyatakan lain secara tegas, Syarat dan Ketentuan ini memiliki prioritas dan berlaku dalam hal ketidakkonsistenan antara mereka dan konten atau dokumen lain yang disebutkan dan/atau yang merupakan bagian dari Perjanjian.',
      generalContent3:
        'Artchip berhak untuk memodifikasi Syarat dan Ketentuan dari waktu ke waktu karena sejumlah alasan, termasuk untuk mematuhi undang-undang dan peraturan yang berlaku, serta persyaratan peraturan lainnya. Akibatnya, kami dapat mengubah Perjanjian kapan saja. Namun, setiap kali perubahan substansial dibuat pada Syarat dan Ketentuan, kami akan memberi tahu Anda melalui pemberitahuan di Website saat login Akun dan sebelum perubahan mulai berlaku. Setelah diberi tahu, Anda kemudian akan diminta untuk mengkonfirmasi ulang penerimaan Anda atas isi di dalamnya. Jika Anda tidak setuju dengan Syarat dan Ketentuan yang diperbarui, Anda tidak akan dapat menggunakan Layanan lagi. Syarat dan Ketentuan lengkap tersedia di halaman depan Website setiap saat. Selalu disarankan untuk memeriksa Syarat dan Ketentuan sebelum menggunakan Layanan untuk memastikan bahwa Anda setuju dengan mereka. Semua versi diberi tanggal dan cap waktu.',
      generalContent4:
        'Amandemen yang disebutkan dalam pasal sebelumnya akan mulai berlaku segera setelah diposting di Website. Adalah tanggung jawab tunggal Anda untuk meninjau Syarat dan Ketentuan, termasuk Aturan Permainan khusus untuk setiap Permainan yang Anda pilih untuk berpartisipasi agar tetap diperbarui dengan semua amandemen setiap kali Anda bermain. Selain itu, selalu disarankan untuk meninjau Syarat dan Ketentuan ini dan Aturan Permainan dari Permainan yang Anda ikuti, secara teratur, agar tidak melupakan isinya.',
      generalContent5:
        'Anda harus membaca dan memahami Syarat dan Ketentuan (dan Perjanjian secara keseluruhan) sepenuhnya sebelum mendaftarkan Akun. Jika Anda tidak setuju dengan bagian mana pun dari Perjanjian, Anda tidak boleh menggunakan atau terus menggunakan Layanan kami.',
      generalContent6:
        'Syarat dan Ketentuan ini mulai berlaku ketika Anda mendaftar dan mengkonfirmasi detail pendaftaran Anda dalam proses pendaftaran di Website. Dengan mendaftarkan Akun, Anda setuju bahwa Anda telah membaca dan memahami Syarat dan Ketentuan ini. Dengan menggunakan Layanan kami, Anda mengkonfirmasi bahwa Anda telah menerima dan setuju dengan isi yang terkandung di sini.',
      generalContent7:
        'Anda lebih lanjut mengakui bahwa dengan mendaftar dan menggunakan Layanan kami, Anda juga terikat oleh Aturan Permainan, dan dianggap bahwa Anda telah membaca, memahami dan menerima semua Aturan Permainan tersebut.',
      generalContent8:
        'Syarat dan Ketentuan ini dapat diterbitkan dalam sejumlah bahasa dan harus mencerminkan prinsip yang sama. Ini untuk tujuan informasi dan untuk membantu Pemegang Akun. Namun, hanya versi bahasa Inggris yang menjadi dasar hukum dari hubungan antara Anda dan Artchip. Dalam hal ada perbedaan antara versi bahasa Inggris dan versi non-bahasa Inggris dari Syarat dan Ketentuan ini, versi bahasa Inggris akan selalu berlaku.',
      yourObligations: 'Kewajiban Anda',
      obligationsContent1:
        'Anda hanya dapat membuka satu Akun pada satu waktu di Website. Artchip mempertahankan hak untuk mengakhiri Akun duplikat apa pun.',
      obligationsContent2:
        'Jika Anda membuka atau mencoba membuka lebih dari satu Akun, untuk alasan apa pun, Artchip dapat memblokir atau menutup Akun Anda apa pun atau semua atas kebijaksanaan tunggalnya.',
      obligationsContent3:
        'Jika Anda melihat bahwa Anda memiliki lebih dari satu Akun terdaftar, Anda harus segera memberi tahu kami.',
      obligationsContent4:
        'Kegagalan untuk melakukannya dapat menyebabkan Akun Anda diblokir dan/atau ditutup. Jika kami menganggap bahwa beberapa Akun telah dibuka dalam kesalahan yang sebenarnya, Artchip dapat, atas kebijaksanaan tunggalnya, setuju untuk mengkreditkan Akun pertama yang akan Anda buka dengan kami dengan saldo yang tersisa di Akun tambahan Anda.',
      obligationsContent5:
        'Orang di bawah usia 18 tahun tidak diizinkan untuk berpartisipasi dalam Permainan. Anda menyatakan bahwa Anda berusia di atas 18 tahun atau mematuhi usia minimum hukum yang lebih tinggi seperti yang ditetapkan dalam yurisdiksi di mana Anda tinggal dan di bawah undang-undang yang berlaku untuk Anda. Adalah tanggung jawab tunggal Anda untuk mengetahui apakah perjudian online legal di negara tempat tinggal Anda. Mungkin merupakan pelanggaran pidana untuk berjudi sementara masih di bawah umur.',
      obligationsContent6:
        'Anda bertanggung jawab penuh atas detail Akun Anda dan penggunaan Akun Anda melalui detail tersebut. Ini termasuk tetapi tidak terbatas pada username dan password dan/atau cara lain untuk mengakses Akun Anda melalui Website masing-masing. Di mana Anda memiliki kecurigaan bahwa informasi tersebut mungkin telah dikompromikan, Anda harus memberi tahu Artchip dan mengambil tindakan yang tepat untuk melarang atau mencegah akses yang tidak sah ke bagian mana pun dari Akun atau dana Anda.',
      obligationsContent7:
        'Anda akan menggunakan Layanan kami atas nama Anda sendiri dan bukan atas nama orang atau entitas lain. Akun hanya dapat dipegang oleh orang alami. Untuk menghindari keraguan, akun perusahaan tidak diizinkan. Selain itu, Anda tidak akan mengizinkan orang alami lain untuk mengakses dan/atau menggunakan Akun Anda atau menerima hadiah apa pun atau mengakses dan berpartisipasi dalam layanan Artchip apa pun. Anda memahami bahwa Anda akan bertanggung jawab penuh atas kerugian apa pun yang ditimbulkan oleh pihak ketiga pada Akun Anda dan Anda akan segera memberi tahu kami jika Anda mencurigai bahwa pihak ketiga telah mendapatkan akses ke Akun Anda, mengambil tindakan yang tepat untuk melarang atau mencegah akses yang tidak sah ke bagian mana pun dari Akun atau dana Anda, dan membantu kami sepenuhnya dalam penyelidikan kami ke masalah tersebut.',
      obligationsContent8:
        'Anda dapat berpartisipasi dalam Permainan secara ketat dalam kapasitas pribadi non-profesional Anda, hanya untuk alasan rekreasi dan hiburan dan sesuai dengan semua undang-undang, aturan dan peraturan, jika dan di mana berlaku.',
      obligationsContent9:
        'Anda menyadari bahwa hak untuk mengakses dan menggunakan Layanan kami, mungkin dianggap ilegal di negara tertentu atau bahwa akses ke Layanan kami dari negara tertentu mungkin memerlukan pembatasan karena status negara tersebut dalam indeks atau peringkat yang diakui dalam bidang kejahatan keuangan. Anda bertanggung jawab untuk menentukan apakah mengakses dan menggunakan Layanan kami sesuai dengan undang-undang yang berlaku di negara Anda dan Anda menjamin kepada kami bahwa perjudian tidak ilegal di wilayah tempat Anda tinggal. Artchip juga melarang orang yang berada di (termasuk pengunjung sementara) atau penduduk yurisdiksi tertentu. Untuk menghindari keraguan, akses dan pendaftaran dari negara yang tidak muncul dalam opsi dropdown yang tersedia pada tahap pendaftaran, sangat dilarang. Partisipasi Anda dalam Permainan di yurisdiksi di mana partisipasi tersebut dilarang oleh hukum atau di yurisdiksi yang, meskipun partisipasi tidak dilarang, dapat mengakibatkan pembatasan pada partisipasi dan/atau akses Anda ke Permainan dengan cara apa pun, tidak akan mempengaruhi taruhan atau pembayaran apa pun yang dibuat untuk dan diperoleh untuk kepentingan Artchip.',
      obligationsContent10:
        'Anda tidak diizinkan untuk mentransfer dana dari Akun Anda ke Pemegang Akun lain atau menerima dana dari Pemegang Akun lain ke Akun Anda. Akun tidak dapat dialihkan, dan dilarang bagi Pemegang Akun untuk menjual, mentransfer atau memperoleh Akun dari Pemegang Akun lain.',
      obligationsContent11:
        'Sebagai Pemegang Akun, Anda bertanggung jawab untuk memberikan Artchip dengan detail pribadi yang benar. Untuk efek ini Anda setuju bahwa semua informasi yang Anda berikan kepada kami, seperti tetapi tidak terbatas pada, alamat dan alamat email yang lengkap dan benar, dan bahwa Anda akan segera memberi tahu Artchip jika ada perubahan pada informasi tersebut. Anda dengan ini diberi tahu bahwa kami melakukan prosedur verifikasi dan, jika Artchip menjadi sadar bahwa Anda telah gagal memberikan informasi yang benar kepada kami, kami mempertahankan hak untuk memblokir Akun dan menolak untuk memproses pengembalian dana atau kemenangan apa pun.',
      obligationsContent12:
        'Anda dapat berpartisipasi dalam Permainan apa pun hanya jika Anda memiliki cukup dana di Akun Anda untuk partisipasi tersebut.',
      obligationsContent13:
        'Anda tidak boleh menggunakan dana yang ternoda atau terkait dengan ilegalitas apa pun dan, khususnya, dana yang berasal dari aktivitas atau sumber ilegal apa pun. Kami lebih lanjut berhak untuk mengakhiri Akun, melarang Pemegang Akun dan mempertahankan semua dana di mana Pemegang Akun tersebut secara wajar dicurigai terlibat atau terkait langsung dengan aktivitas penipuan yang termasuk, tetapi tidak terbatas pada, penggunaan kartu kredit atau nomor akun yang dicuri atau dipalsukan, chip dumping, eksploitasi perangkat lunak, pemalsuan, kolusi, dan pengajuan data atau dokumen yang dipalsukan, dicuri atau salah digunakan.',
      obligationsContent14:
        'Anda bertanggung jawab penuh untuk mematuhi proses pelaporan apa pun yang terkait dengan pembayaran pajak dan/atau biaya lain yang mungkin dikenakan pada kemenangan yang Anda terima dari Artchip, jika dan di mana berlaku.',
      obligationsContent15:
        'Sehubungan dengan deposit dan penarikan dana ke dan dari Akun Anda, Anda mengakui bahwa Anda hanya akan menggunakan kartu kredit dan instrumen keuangan lain yang valid dan dikeluarkan oleh lembaga yang sah dan yang secara hukum milik Anda. Kami mempertahankan hak untuk melarang penggunaan kartu kredit perusahaan dan rekening bank perusahaan.',
      obligationsContent16:
        'Anda memahami dan mengakui bahwa tidak diizinkan bagi Anda untuk memainkan Permainan apa pun yang ditawarkan oleh Artchip secara kredit.',
      obligationsContent17:
        'Anda memahami dan mengakui bahwa dengan memainkan Permainan, Anda mengambil risiko kehilangan uang yang disetorkan ke Akun Anda. Jika Anda tidak ingin menerima ini, harap jangan menggunakan Layanan kami.',
      obligationsContent18:
        'Anda menyatakan bahwa Anda tidak dan tidak akan terlibat dalam atau terkait langsung dengan aktivitas penipuan, kolusif, fixing atau ilegal lainnya sehubungan dengan partisipasi Anda atau pihak ketiga dalam Permainan apa pun dan tidak akan menggunakan metode atau teknik yang dibantu perangkat lunak atau perangkat keras untuk partisipasi Anda dalam Permainan apa pun. Kami dengan ini berhak untuk membatalkan taruhan dan kesepakatan apa pun yang kami anggap sesuai dengan dana apa pun, jika kami mencurigai perilaku tersebut. Selain itu, Pemegang Akun mana pun yang memiliki alasan yang wajar untuk mencurigai bahwa Pemegang Akun lain mengambil keuntungan yang tidak adil melalui kecurangan atau kolusi harus melaporkan kecurigaan tersebut ke Artchip Contact Support.',
      footer:
        'Syarat dan Ketentuan ini membentuk perjanjian yang mengikat secara hukum antara Anda dan Artchip. Dengan menggunakan Layanan kami, Anda mengakui bahwa Anda telah membaca, memahami, dan setuju untuk terikat dengan ketentuan ini. Untuk pertanyaan atau klarifikasi mengenai ketentuan ini, silakan hubungi tim dukungan kami.',
    },
    ko: {
      title: '이용약관',
      introduction: '소개',
      introContent1:
        '이 문서에 정의된 이용약관은 www.prgmainbet.com 및 기타 URL, 모바일 전화 애플리케이션 또는 Artchip("웹사이트")에 라이선스되거나 소유하거나 제공하는 기타 제품 및 서비스를 통해 제공되는 게임("게임")의 사용을 규제합니다(통칭하여 "서비스").',
      introContent2:
        '이 이용약관, 웹사이트의 모든 게임에 적용되는 규칙("게임 규칙") 및 그 안에서 명시적으로 언급된 모든 문서, 그리고 웹사이트에 게시된 모든 가이드라인이나 규칙은 당사자 간의 계약과 이해를 구성하며 Artchip 과 서비스 계정 소유자("계정 소유자") 간의 계약 관계를 관리합니다(그리고 이 문서에서 통칭하여 "계약"이라고 합니다). 계약(이 이용약관 포함)을 주의 깊게 읽고 이해했는지 확인하세요. 내용에 동의하지 않는 경우 서비스를 더 이상 사용하지 마세요.',
      general: '일반',
      generalContent1:
        '이 이용약관은 서비스가 전화, 데스크톱 브라우저, 모바일 브라우저, 모바일, 태블릿 기기 또는 기타 기기를 통해 액세스되는지 여부에 관계없이 동일하게 적용됩니다.',
      generalContent2:
        '다르게 명시적으로 명시되지 않는 한, 이 이용약관은 우선순위를 가지며 그들과 언급된 다른 콘텐츠나 문서 또는 계약의 일부를 구성하는 것과의 불일치가 있는 경우 우선합니다.',
      generalContent3:
        'Artchip 은 적용 가능한 법률 및 규정을 준수하고 기타 규제 요구사항을 포함한 여러 가지 이유로 이용약관을 수시로 수정할 권리를 보유합니다. 결과적으로 언제든지 계약을 수정할 수 있습니다. 그러나 이용약관에 실질적인 수정이 이루어질 때마다 계정 로그인 시 웹사이트에 통지하고 변경사항이 발효되기 전에 알려드리겠습니다. 통지를 받으면 내용에 대한 수락을 재확인해야 합니다. 업데이트된 이용약관에 동의하지 않으면 더 이상 서비스를 사용할 수 없습니다. 전체 이용약관은 항상 웹사이트의 첫 페이지에서 확인할 수 있습니다. 서비스 사용 전에 이용약관을 확인하여 동의하는지 확인하는 것이 항상 권장됩니다. 모든 버전은 날짜와 시간이 표시됩니다.',
      generalContent4:
        '앞의 조항에서 언급된 수정사항은 웹사이트에 게시되면 즉시 발효됩니다. 매번 플레이할 때 모든 수정사항을 최신 상태로 유지하기 위해 참여하기로 선택한 각 게임의 특정 게임 규칙을 포함하여 이용약관을 검토하는 것은 전적으로 귀하의 책임입니다. 또한 정기적으로 이 이용약관과 참여하는 게임의 게임 규칙을 검토하는 것이 항상 권장되므로 내용을 잊지 않도록 합니다.',
      generalContent5:
        '계정을 등록하기 전에 이용약관(그리고 전체 계약)을 완전히 읽고 이해해야 합니다. 계약의 어느 부분에든 동의하지 않는 경우 서비스를 사용하거나 계속 사용해서는 안 됩니다.',
      generalContent6:
        '이 이용약관은 웹사이트의 등록 과정에서 등록하고 등록 세부사항을 확인할 때 적용됩니다. 계정을 등록함으로써 이 이용약관을 읽고 이해했다는 것에 동의합니다. 저희 서비스를 사용함으로써 여기에 포함된 내용을 수락하고 동의했다는 것을 확인합니다.',
      generalContent7:
        '저희 서비스에 등록하고 사용함으로써 게임 규칙에도 구속된다는 것을 추가로 인정하며, 모든 게임 규칙을 읽고, 이해하고, 수락했다고 간주됩니다.',
      generalContent8:
        '이 이용약관은 여러 언어로 게시될 수 있으며 동일한 원칙을 반영해야 합니다. 이는 정보 제공 목적이며 계정 소유자를 돕기 위함입니다. 그러나 영어 버전만이 귀하와 Artchip 간의 관계의 법적 기반입니다. 이 이용약관의 영어 버전과 비영어 버전 간에 불일치가 있는 경우 영어 버전이 항상 우선합니다.',
      yourObligations: '귀하의 의무',
      obligationsContent1:
        '웹사이트에서 언제든지 하나의 계정만 열 수 있습니다. Artchip 은 중복 계정을 종료할 권리를 보유합니다.',
      obligationsContent2:
        '어떤 이유로든 하나 이상의 계정을 열거나 열려고 시도하는 경우 Artchip은 재량에 따라 계정 중 하나 또는 모든 계정을 차단하거나 닫을 수 있습니다.',
      obligationsContent3:
        '등록된 계정이 하나 이상 있다는 것을 발견하면 즉시 저희에게 알려야 합니다.',
      obligationsContent4:
        '그렇게 하지 않으면 계정이 차단되거나/또는 닫힐 수 있습니다. 여러 계정이 진정한 오류로 열렸다고 판단하는 경우 Artchip은 단독 재량에 따라 추가 계정에 남아있는 잔액으로 저희와 함께 열었을 첫 번째 계정에 신용을 제공하는 것에 동의할 수 있습니다.',
      obligationsContent5:
        '18세 미만의 사람은 게임에 참여할 수 없습니다. 귀하는 18세 이상이거나 거주하는 관할권에서 규정된 더 높은 최소 법적 연령을 준수한다고 선언합니다. 온라인 도박이 거주 국가에서 합법인지 아는 것은 전적으로 귀하의 책임입니다. 미성년자 상태에서 도박하는 것은 범죄가 될 수 있습니다.',
      obligationsContent6:
        '계정 세부사항과 해당 세부사항을 통한 계정 사용에 대해 전적으로 책임집니다. 여기에는 사용자명과 비밀번호 및/또는 해당 웹사이트를 통해 계정에 액세스하는 기타 수단이 포함되지만 이에 국한되지 않습니다. 해당 정보가 손상되었을 수 있다고 의심하는 경우 Artchip에 알리고 계정이나 자금의 어느 부분에 대한 무단 액세스를 금지하거나 방지하기 위한 적절한 조치를 취해야 합니다.',
      obligationsContent7:
        '다른 사람이나 기관을 대신하여가 아닌 자신을 대신하여 서비스를 사용해야 합니다. 계정은 자연인만 보유할 수 있습니다. 명확히 하기 위해 회사 계정은 허용되지 않습니다. 또한 다른 자연인이 귀하의 계정에 액세스하고/또는 사용하거나 Artchip 서비스에 참여하거나 액세스할 수 있도록 허용해서는 안 됩니다. 제3자가 귀하의 계정에서 발생한 손실에 대해 전적으로 책임진다는 것을 이해하며, 제3자가 귀하의 계정에 액세스했다고 의심하는 경우 즉시 저희에게 알리고, 계정이나 자금의 어느 부분에 대한 무단 액세스를 금지하거나 방지하기 위한 적절한 조치를 취하고, 문제에 대한 저희의 조사를 완전히 지원해야 합니다.',
      obligationsContent8:
        '엄격히 개인적이고 비전문적인 능력으로, 오직 오락과 엔터테인먼트 목적으로, 그리고 적용되는 경우 모든 법률, 규칙 및 규정에 따라 게임에 참여할 수 있습니다.',
      obligationsContent9:
        '저희 서비스에 액세스하고 사용할 권리가 특정 국가에서 불법으로 간주될 수 있거나 특정 국가에서의 서비스 액세스가 금융 범죄 분야의 인정된 지수나 순위에서 해당 국가의 지위로 인해 제한을 요구할 수 있다는 것을 인식하고 있습니다. 서비스 액세스 및 사용이 거주 국가의 적용 가능한 법률을 준수하는지 결정하는 것은 귀하의 책임이며 도박이 거주하는 영역에서 불법이 아니라는 것을 저희에게 보장합니다. Artchip은 또한 특정 관할권에 위치한(임시 방문자 포함) 또는 거주하는 사람을 금지합니다. 명확히 하기 위해 등록 단계에서 사용 가능한 드롭다운 옵션에 나타나지 않는 국가에서의 액세스 및 등록은 엄격히 금지됩니다. 법에 의해 금지된 관할권에서의 게임 참여 또는 금지되지 않았지만 참여 및/또는 게임에 대한 액세스에 제한을 부과할 수 있는 관할권에서의 참여는 Artchip의 이익을 위해 이루어지고 누적된 모든 베팅이나 지불에 영향을 미치지 않습니다.',
      obligationsContent10:
        '계정에서 다른 계정 소유자에게 자금을 이체하거나 다른 계정 소유자로부터 계정으로 자금을 받는 것은 허용되지 않습니다. 계정은 양도할 수 없으며 계정 소유자가 다른 계정 소유자로부터 계정을 판매, 이체 또는 획득하는 것은 금지됩니다.',
      obligationsContent11:
        '계정 소유자로서 Artchip에 정확한 개인 세부사항을 제공할 책임이 있습니다. 이를 위해 주소와 이메일 주소가 완전하고 진실한 것과 같은 저희에게 제공하는 모든 정보가 완전하고 진실하다는 것에 동의하며, 해당 정보에 변경사항이 있는 경우 즉시 Artchip에 알릴 것에 동의합니다. 저희가 검증 절차를 수행한다는 것을 이에 통지하며, Artchip이 정확한 정보를 제공하지 못했다는 것을 알게 된 경우 계정을 차단하고 환불이나 상금 처리를 거부할 권리를 보유합니다.',
      obligationsContent12:
        '해당 참여를 위한 충분한 자금이 계정에 있는 경우에만 게임에 참여할 수 있습니다.',
      obligationsContent13:
        '오염되었거나 불법과 관련된 자금, 특히 불법 활동이나 출처에서 비롯된 자금을 사용할 수 없습니다. 또한 해당 계정 소유자가 도난당했거나 위조된 신용카드나 계좌번호 사용, 칩 덤핑, 소프트웨어 악용, 위조, 공모, 위조되거나 도난당했거나 기타 잘못 사용된 데이터나 문서 제출을 포함하지만 이에 국한되지 않는 사기 활동에 관여하거나 직접 연결되어 있다고 합리적으로 의심되는 경우 계정을 종료하고, 계정 소유자를 금지하고, 모든 자금을 보유할 권리를 보유합니다.',
      obligationsContent14:
        'Artchip으로부터 받는 상금에 부과될 수 있는 세금 및/또는 기타 수수료의 지불과 관련된 모든 보고 과정을 준수하는 것은 전적으로 귀하의 책임입니다(해당되는 경우).',
      obligationsContent15:
        '계정으로의 자금 입출금과 관련하여 유효하고 합법적인 기관에서 발행하며 법적으로 귀하에게 속하는 신용카드와 기타 금융 상품만 사용한다는 것을 인정합니다. 회사 신용카드와 회사 은행 계좌 사용을 금지할 권리를 보유합니다.',
      obligationsContent16:
        'Artchip이 제공하는 게임을 신용으로 플레이하는 것은 허용되지 않는다는 것을 이해하고 인정합니다.',
      obligationsContent17:
        '게임을 플레이함으로써 계정에 입금된 돈을 잃을 위험을 감수한다는 것을 이해하고 인정합니다. 이를 받아들이고 싶지 않다면 서비스 사용을 자제해 주세요.',
      obligationsContent18:
        '귀하나 제3자의 게임 참여와 관련된 사기, 공모, 조작 또는 기타 불법 활동에 관여하지 않거나 직접 연결되지 않으며 게임 참여를 위해 소프트웨어 지원 방법이나 기술이나 하드웨어 장치를 사용하지 않을 것이라고 선언합니다. 저희는 여기서 그러한 행동을 의심하는 경우 모든 베팅을 무효화하고 자금에 대해 적절하다고 생각하는 대로 처리할 권리를 보유합니다. 또한 다른 계정 소유자가 사기나 공모를 통해 불공정한 이점을 취하고 있다고 의심할 합리적인 근거가 있는 계정 소유자는 의심을 Artchip 연락처 지원팀에 보고해야 합니다.',
      footer:
        '이 이용약관은 귀하와 Artchip 간의 법적으로 구속력 있는 계약을 구성합니다. 저희 서비스를 사용함으로써 이 약관을 읽고, 이해하고, 이 약관에 구속되는 것에 동의했다는 것을 인정합니다. 이 약관에 대한 질문이나 명확화가 있으시면 지원팀에 문의하세요.',
    },
  };

  const { currentLocale } = useTranslations();
  const currentContent = termsContent[currentLocale] || termsContent.en;

  return (
    <div className="text-white">
      <div className="container mx-auto px-3 py-7">
        {/* Main Content with Border */}
        <div className="">
          {/* Border Container */}
          <div
            className="overflow-hidden rounded-[6px] border-1"
            style={{ borderColor: '#2DFA1A4D' }}
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
                <section>
                  <h2 className="mobile-section-heading mb-4 bg-[#FFFFFF] bg-clip-text font-bold text-white">
                    {currentContent.introduction}
                  </h2>
                  <p className="mobile-content text-[10px] text-[#CCCCCC] md:text-[16px]">
                    {currentContent.introContent1}
                  </p>
                  <p className="mobile-content mt-4 text-[10px] text-[#CCCCCC] md:text-[16px]">
                    {currentContent.introContent2}
                  </p>
                </section>

                <section>
                  <h2 className="mobile-section-heading mb-4 bg-[#FFFFFF] bg-clip-text font-bold text-white">
                    {currentContent.general}
                  </h2>
                  <p className="mobile-content text-[10px] text-[#CCCCCC] md:text-[16px]">
                    {currentContent.generalContent1}
                  </p>
                  <p className="mobile-content mt-4 text-[10px] text-[#CCCCCC] md:text-[16px]">
                    {currentContent.generalContent2}
                  </p>
                  <p className="mobile-content mt-4 text-[10px] text-[#CCCCCC] md:text-[16px]">
                    {currentContent.generalContent3}
                  </p>
                  <p className="mobile-content mt-4 text-[10px] text-[#CCCCCC] md:text-[16px]">
                    {currentContent.generalContent4}
                  </p>
                  <p className="mobile-content mt-4 text-[10px] text-[#CCCCCC] md:text-[16px]">
                    {currentContent.generalContent5}
                  </p>
                  <p className="mobile-content mt-4 text-[10px] text-[#CCCCCC] md:text-[16px]">
                    {currentContent.generalContent6}
                  </p>
                  <p className="mobile-content mt-4 text-[10px] text-[#CCCCCC] md:text-[16px]">
                    {currentContent.generalContent7}
                  </p>
                  <p className="mobile-content mt-4 text-[10px] text-[#CCCCCC] md:text-[16px]">
                    {currentContent.generalContent8}
                  </p>
                </section>

                <section>
                  <h2 className="mobile-section-heading mb-4 bg-[#FFFFFF] bg-clip-text font-bold text-white">
                    {currentContent.yourObligations}
                  </h2>
                  <p className="mobile-content text-[10px] text-[#CCCCCC] md:text-[16px]">
                    {currentContent.obligationsContent1}
                  </p>
                  <p className="mobile-content mt-4 text-[10px] text-[#CCCCCC] md:text-[16px]">
                    {currentContent.obligationsContent2}
                  </p>
                  <p className="mobile-content mt-4 text-[10px] text-[#CCCCCC] md:text-[16px]">
                    {currentContent.obligationsContent3}
                  </p>
                  <p className="mobile-content mt-4 text-[10px] text-[#CCCCCC] md:text-[16px]">
                    {currentContent.obligationsContent4}
                  </p>
                  <p className="mobile-content mt-4 text-[10px] text-[#CCCCCC] md:text-[16px]">
                    {currentContent.obligationsContent5}
                  </p>
                  <p className="mobile-content mt-4 text-[10px] text-[#CCCCCC] md:text-[16px]">
                    {currentContent.obligationsContent6}
                  </p>
                  <p className="mobile-content mt-4 text-[10px] text-[#CCCCCC] md:text-[16px]">
                    {currentContent.obligationsContent7}
                  </p>
                  <p className="mobile-content mt-4 text-[10px] text-[#CCCCCC] md:text-[16px]">
                    {currentContent.obligationsContent8}
                  </p>
                  <p className="mobile-content mt-4 text-[10px] text-[#CCCCCC] md:text-[16px]">
                    {currentContent.obligationsContent9}
                  </p>
                  <p className="mobile-content mt-4 text-[10px] text-[#CCCCCC] md:text-[16px]">
                    {currentContent.obligationsContent10}
                  </p>
                  <p className="mobile-content mt-4 text-[10px] text-[#CCCCCC] md:text-[16px]">
                    {currentContent.obligationsContent11}
                  </p>
                  <p className="mobile-content mt-4 text-[10px] text-[#CCCCCC] md:text-[16px]">
                    {currentContent.obligationsContent12}
                  </p>
                  <p className="mobile-content mt-4 text-[10px] text-[#CCCCCC] md:text-[16px]">
                    {currentContent.obligationsContent13}
                  </p>
                  <p className="mobile-content mt-4 text-[10px] text-[#CCCCCC] md:text-[16px]">
                    {currentContent.obligationsContent14}
                  </p>
                  <p className="mobile-content mt-4 text-[10px] text-[#CCCCCC] md:text-[16px]">
                    {currentContent.obligationsContent15}
                  </p>
                  <p className="mobile-content mt-4 text-[10px] text-[#CCCCCC] md:text-[16px]">
                    {currentContent.obligationsContent16}
                  </p>
                  <p className="mobile-content mt-4 text-[10px] text-[#CCCCCC] md:text-[16px]">
                    {currentContent.obligationsContent17}
                  </p>
                  <p className="mobile-content mt-4 text-[10px] text-[#CCCCCC] md:text-[16px]">
                    {currentContent.obligationsContent18}
                  </p>
                </section>

                <div
                  className="mt-8 rounded-[3px] border p-6 shadow-[inset_4px_5px_16px_0_rgba(0,0,0,0.25)]"
                  style={{
                    borderColor: '#2DFA1A4D',
                    background: '#0A1414',
                  }}
                >
                  <p className="mobile-content text-center text-[10px] text-[#CCCCCC] md:text-[16px]">
                    {currentContent.footer}
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

export default TermsOfUsePage;
