<?php

namespace Database\Seeders;

use App\Models\Bank;
use Illuminate\Database\Seeder;

class BanksSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $banks = [
            [
                'names' => [
                    'en' => 'Bank Central Asia',
                    'id' => 'Bank Central Asia',
                    'ko' => '센트럴 아시아 은행',
                ],
                'name' => 'Bank Central Asia',
                'code' => 'CENAIDJA',
            ],
            [
                'names' => [
                    'en' => 'Bank Rakyat Indonesia',
                    'id' => 'Bank Rakyat Indonesia',
                    'ko' => '인도네시아 국민은행',
                ],
                'name' => 'Bank Rakyat Indonesia',
                'code' => 'BRINIDJA',
            ],
            [
                'names' => [
                    'en' => 'Bank Negara Indonesia',
                    'id' => 'Bank Negara Indonesia',
                    'ko' => '인도네시아 국가은행',
                ],
                'name' => 'Bank Negara Indonesia',
                'code' => 'BNINIDJA',
            ],
            [
                'names' => [
                    'en' => 'Bank Mandiri',
                    'id' => 'Bank Mandiri',
                    'ko' => '만디리 은행',
                ],
                'name' => 'Bank Mandiri',
                'code' => 'BMRIIDJA',
            ],
            [
                'names' => [
                    'en' => 'DANA',
                    'id' => 'DANA',
                    'ko' => '다나',
                ],
                'name' => 'DANA',
                'code' => 'DANA',
            ],
            [
                'names' => [
                    'en' => 'OVO',
                    'id' => 'OVO',
                    'ko' => '오보',
                ],
                'name' => 'OVO',
                'code' => 'OVO',
            ],
            [
                'names' => [
                    'en' => 'GoPay',
                    'id' => 'GoPay',
                    'ko' => '고페이',
                ],
                'name' => 'GoPay',
                'code' => 'GOPAY',
            ],
            [
                'names' => [
                    'en' => 'LinkAja',
                    'id' => 'LinkAja',
                    'ko' => '링크아자',
                ],
                'name' => 'LinkAja',
                'code' => 'LINKAJA',
            ],
            [
                'names' => [
                    'en' => 'Bank CIMB Niaga',
                    'id' => 'Bank CIMB Niaga',
                    'ko' => 'CIMB 니아가 은행',
                ],
                'name' => 'Bank CIMB Niaga',
                'code' => 'BNIAIDJA',
            ],
            [
                'names' => [
                    'en' => 'Bank Danamon',
                    'id' => 'Bank Danamon',
                    'ko' => '다나몬 은행',
                ],
                'name' => 'Bank Danamon',
                'code' => 'BDINIDJA',
            ],
            [
                'names' => [
                    'en' => 'Bank Permata',
                    'id' => 'Bank Permata',
                    'ko' => '페르마타 은행',
                ],
                'name' => 'Bank Permata',
                'code' => 'BBBAIDJA',
            ],
            [
                'names' => [
                    'en' => 'Bank OCBC NISP',
                    'id' => 'Bank OCBC NISP',
                    'ko' => 'OCBC NISP 은행',
                ],
                'name' => 'Bank OCBC NISP',
                'code' => 'NISPIDJA',
            ],
            [
                'names' => [
                    'en' => 'Bank UOB Indonesia',
                    'id' => 'Bank UOB Indonesia',
                    'ko' => 'UOB 인도네시아 은행',
                ],
                'name' => 'Bank UOB Indonesia',
                'code' => 'UOVBIDJA',
            ],
            [
                'names' => [
                    'en' => 'Bank DBS Indonesia',
                    'id' => 'Bank DBS Indonesia',
                    'ko' => 'DBS 인도네시아 은행',
                ],
                'name' => 'Bank DBS Indonesia',
                'code' => 'DBSBIDJA',
            ],
            [
                'names' => [
                    'en' => 'Bank Tabungan Negara',
                    'id' => 'Bank Tabungan Negara',
                    'ko' => '국가저축은행',
                ],
                'name' => 'Bank Tabungan Negara',
                'code' => 'BTANIDJA',
            ],
            [
                'names' => [
                    'en' => 'Bank Syariah Indonesia',
                    'id' => 'Bank Syariah Indonesia',
                    'ko' => '인도네시아 이슬람 은행',
                ],
                'name' => 'Bank Syariah Indonesia',
                'code' => 'BSMDIDJA',
            ],
            [
                'names' => [
                    'en' => 'Bank Muamalat',
                    'id' => 'Bank Muamalat',
                    'ko' => '무아말라트 은행',
                ],
                'name' => 'Bank Muamalat',
                'code' => 'MUABIDJA',
            ],
            [
                'names' => [
                    'en' => 'Bank Mega Syariah',
                    'id' => 'Bank Mega Syariah',
                    'ko' => '메가 샤리아 은행',
                ],
                'name' => 'Bank Mega Syariah',
                'code' => 'BMSIIDJA',
            ],
            [
                'names' => [
                    'en' => 'Bank BTPN Syariah',
                    'id' => 'Bank BTPN Syariah',
                    'ko' => 'BTPN 샤리아 은행',
                ],
                'name' => 'Bank BTPN Syariah',
                'code' => 'BTPNIDJA',
            ],
            [
                'names' => [
                    'en' => 'Bank Aceh Syariah',
                    'id' => 'Bank Aceh Syariah',
                    'ko' => '아체 샤리아 은행',
                ],
                'name' => 'Bank Aceh Syariah',
                'code' => 'ACEHIDJA',
            ],
            [
                'names' => [
                    'en' => 'Bank Panin Dubai Syariah',
                    'id' => 'Bank Panin Dubai Syariah',
                    'ko' => '파닌 두바이 샤리아 은행',
                ],
                'name' => 'Bank Panin Dubai Syariah',
                'code' => 'PINBIDJA',
            ],
            [
                'names' => [
                    'en' => 'Bank Syariah Bukopin',
                    'id' => 'Bank Syariah Bukopin',
                    'ko' => '부코핀 샤리아 은행',
                ],
                'name' => 'Bank Syariah Bukopin',
                'code' => 'BBUKIDJA',
            ],
            [
                'names' => [
                    'en' => 'Bank Jawa Barat dan Banten',
                    'id' => 'Bank Jawa Barat dan Banten',
                    'ko' => '서자바 반튼 은행',
                ],
                'name' => 'Bank Jawa Barat dan Banten',
                'code' => 'BJBRIDJA',
            ],
            [
                'names' => [
                    'en' => 'Bank DKI',
                    'id' => 'Bank DKI',
                    'ko' => 'DKI 은행',
                ],
                'name' => 'Bank DKI',
                'code' => 'DKIAIDJA',
            ],
            [
                'names' => [
                    'en' => 'Bank Jatim',
                    'id' => 'Bank Jatim',
                    'ko' => '동자바 은행',
                ],
                'name' => 'Bank Jatim',
                'code' => 'JATMIDJA',
            ],
            [
                'names' => [
                    'en' => 'Bank Sumut',
                    'id' => 'Bank Sumut',
                    'ko' => '북수마트라 은행',
                ],
                'name' => 'Bank Sumut',
                'code' => 'SUMTIDJA',
            ],
            [
                'names' => [
                    'en' => 'Bank Sumsel Babel',
                    'id' => 'Bank Sumsel Babel',
                    'ko' => '남수마트라 방카벨리퉁 은행',
                ],
                'name' => 'Bank Sumsel Babel',
                'code' => 'SUMBIDJA',
            ],
            [
                'names' => [
                    'en' => 'Bank BPD Bali',
                    'id' => 'Bank BPD Bali',
                    'ko' => 'BPD 발리 은행',
                ],
                'name' => 'Bank BPD Bali',
                'code' => 'BALIIDJA',
            ],
            [
                'names' => [
                    'en' => 'Bank OCBC',
                    'id' => 'Bank OCBC',
                    'ko' => 'OCBC 은행',
                ],
                'name' => 'Bank OCBC',
                'code' => 'OCBCIDJA',
            ],
            [
                'names' => [
                    'en' => 'Bank Maybank Indonesia',
                    'id' => 'Bank Maybank Indonesia',
                    'ko' => '메이뱅크 인도네시아',
                ],
                'name' => 'Bank Maybank Indonesia',
                'code' => 'IBBKIDJA',
            ],
            [
                'names' => [
                    'en' => 'Bank Sinarmas',
                    'id' => 'Bank Sinarmas',
                    'ko' => '시나르마스 은행',
                ],
                'name' => 'Bank Sinarmas',
                'code' => 'SBJKIDJA',
            ],
            [
                'names' => [
                    'en' => 'Bank Mega',
                    'id' => 'Bank Mega',
                    'ko' => '메가 은행',
                ],
                'name' => 'Bank Mega',
                'code' => 'MEGAIDJA',
            ],
            [
                'names' => [
                    'en' => 'Bank J Trust Indonesia',
                    'id' => 'Bank J Trust Indonesia',
                    'ko' => 'J 트러스트 인도네시아 은행',
                ],
                'name' => 'Bank J Trust Indonesia',
                'code' => 'JTBKIDJA',
            ],
            [
                'names' => [
                    'en' => 'Bank Shinhan Indonesia',
                    'id' => 'Bank Shinhan Indonesia',
                    'ko' => '신한은행 인도네시아',
                ],
                'name' => 'Bank Shinhan Indonesia',
                'code' => 'SHBKIDJA',
            ],
            [
                'names' => [
                    'en' => 'Bank QNB Indonesia',
                    'id' => 'Bank QNB Indonesia',
                    'ko' => 'QNB 인도네시아 은행',
                ],
                'name' => 'Bank QNB Indonesia',
                'code' => 'QNBAIDJA',
            ],
            [
                'names' => [
                    'en' => 'Bank Jago',
                    'id' => 'Bank Jago',
                    'ko' => '자고 은행',
                ],
                'name' => 'Bank Jago',
                'code' => 'ARTOIIDJA',
            ],
            [
                'names' => [
                    'en' => 'Allo Bank',
                    'id' => 'Allo Bank',
                    'ko' => '알로 은행',
                ],
                'name' => 'Allo Bank',
                'code' => 'INDOIDJA',
            ],
            [
                'names' => [
                    'en' => 'Bank Neo Commerce',
                    'id' => 'Bank Neo Commerce',
                    'ko' => '네오 커머스 은행',
                ],
                'name' => 'Bank Neo Commerce',
                'code' => 'NEOCIDJA',
            ],
            [
                'names' => [
                    'en' => 'Blu by BCA',
                    'id' => 'Blu by BCA',
                    'ko' => 'BCA 블루',
                ],
                'name' => 'Blu by BCA',
                'code' => 'BBLUIDJA',
            ],
            [
                'names' => [
                    'en' => 'Bank Raya',
                    'id' => 'Bank Raya',
                    'ko' => '라야 은행',
                ],
                'name' => 'Bank Raya',
                'code' => 'RAYAIDJA',
            ],
            [
                'names' => [
                    'en' => 'SeaBank',
                    'id' => 'SeaBank',
                    'ko' => '씨뱅크',
                ],
                'name' => 'SeaBank',
                'code' => 'SEABIDJA',
            ],
        ];

        foreach ($banks as $bank) {
            if (Bank::where('code', $bank['code'])->exists()) {
                $this->command->info('Bank '.$bank['name'].' already exists');

                continue;
            }
            Bank::updateOrCreate([
                'code' => $bank['code'],
            ], [
                'name' => $bank['name'],
                'names' => $bank['names'],
            ]);
        }

        $this->command->info('Banks seeded!');
    }
}
