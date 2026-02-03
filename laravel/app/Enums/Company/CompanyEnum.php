<?php

namespace App\Enums\Company;

use App\Enums\BaseEnumTrait;
use App\Utils\Services\Companies\AntechipService;
use App\Utils\Services\Companies\Base\BaseCompanyService;
use App\Utils\Services\Companies\FourTenService;
use App\Utils\Services\Companies\TheBigHitService;
use App\Utils\Services\Companies\VinusService;
use Illuminate\Support\Arr;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\File;

enum CompanyEnum: string
{
    use BaseEnumTrait;

    case ANTECHIP = 'antechip';
    case VINUS = 'vinus';
    case THEBIGHIT = 'thebighit';
    case FOURTEN = 'fourten';

    public static function allEnabled(): array
    {
        $cases = [];

        foreach (self::cases() as $case) {
            if ($case->isEnabled()) {
                $cases[] = $case;
            }
        }

        return $cases;
    }

    public function isEnabled(): bool
    {
        return match ($this) {
            self::ANTECHIP => false,
            self::VINUS => false,
            self::THEBIGHIT => false,
            self::FOURTEN => true,
        };
    }

    public function service(): BaseCompanyService
    {
        return match ($this) {
            self::ANTECHIP => new AntechipService,
            self::VINUS => new VinusService,
            self::THEBIGHIT => new TheBigHitService,
            self::FOURTEN => new FourTenService,
        };
    }

    public function tokenLength(): string
    {
        return match ($this) {
            self::ANTECHIP => 20,
            self::VINUS => 20,
            self::THEBIGHIT => 20,
            self::FOURTEN => 20,
        };
    }

    public function creds(): array
    {
        $creds = File::json('companies-creds.json');

        return Arr::dot(
            match ($this) {
                self::ANTECHIP => $creds[self::ANTECHIP->value],
                self::VINUS => $creds[self::VINUS->value],
                self::THEBIGHIT => $creds[self::THEBIGHIT->value],
                self::FOURTEN => $creds[self::FOURTEN->value],
            }
        );
    }

    public function config(): array
    {
        $creds = $this->creds();

        return [
            'production' => [
                'baseUrl' => $creds['production.baseUrl'],
                'apiKey' => isset($creds['production.apiKey']) ? encrypt($creds['production.apiKey']) : null,
                'secret' => isset($creds['production.secretKey']) ? encrypt($creds['production.secretKey']) : null,
                'infoUrl' => $creds['production.infoUrl'] ?? null,
                'siteCode' => $creds['production.siteCode'] ?? null,
            ],
            'staging' => [
                'baseUrl' => $creds['staging.baseUrl'],
                'apiKey' => isset($creds['staging.apiKey']) ? encrypt($creds['staging.apiKey']) : null,
                'secret' => isset($creds['staging.secretKey']) ? encrypt($creds['staging.secretKey']) : null,
                'infoUrl' => $creds['staging.infoUrl'] ?? null,
                'siteCode' => $creds['staging.siteCode'] ?? null,
            ],
        ];
    }

    public function providers(): Collection
    {
        return collect(
            match ($this) {
                self::ANTECHIP => [
                    // ['key' => self::ANTECHIP->value, 'name' => self::ANTECHIP->label()],
                    // ['key' => 'play', 'name' => 'Play'],
                    // ['key' => 'evolution', 'name' => 'Evolution'],
                    // ['key' => 'SEXYBCRT', 'name' => 'SEXYBCRT'],
                    // ['key' => 'booongo', 'name' => 'booongo'],
                    // ['key' => 'playson', 'name' => 'playson'],
                    // ['key' => 'bt1', 'name' => 'bt1'],
                    // ['key' => 'cq9', 'name' => 'cq9'],
                    // ['key' => 'cq9_casino', 'name' => 'cq9_casino'],
                    // ['key' => 'dowin', 'name' => 'dowin'],
                    // ['key' => 'netent', 'name' => 'netent'],
                    // ['key' => 'redtiger', 'name' => 'redtiger'],
                    // ['key' => 'habanero', 'name' => 'habanero'],
                    // ['key' => 'MICRO_Casino', 'name' => 'MICRO_Casino'],
                    // ['key' => 'AGIN', 'name' => 'AGIN'],
                    // ['key' => 'playpearls', 'name' => 'playpearls'],
                    // ['key' => 'wearecasino', 'name' => 'wearecasino'],
                    // ['key' => 'wazdan', 'name' => 'wazdan'],
                    // ['key' => 'vibragaming', 'name' => 'vibragaming'],
                    // ['key' => 'redrake', 'name' => 'redrake'],
                    // // ['key' => 'Vinus', 'name' => 'Vinus'],
                    // ['key' => 'patagonia', 'name' => 'patagonia'],
                    // ['key' => 'onetouch', 'name' => 'onetouch'],
                    // ['key' => 'Njoy Gaming', 'name' => 'Njoy Gaming'],
                    // ['key' => 'mplay', 'name' => 'mplay'],
                    // ['key' => 'macaw', 'name' => 'macaw'],
                    // ['key' => 'legaplay', 'name' => 'legaplay'],
                    // ['key' => 'kagaming', 'name' => 'kagaming'],
                    // ['key' => 'gmw', 'name' => 'gmw'],
                    // ['key' => 'gamefishglobal', 'name' => 'gamefishglobal'],
                    // ['key' => 'gameart', 'name' => 'gameart'],
                    // ['key' => 'evoplay', 'name' => 'evoplay'],
                    // ['key' => 'egp', 'name' => 'egp'],
                    // ['key' => 'conceptgaming', 'name' => 'conceptgaming'],
                    // ['key' => 'bfgames', 'name' => 'bfgames'],
                    // ['key' => 'belatra', 'name' => 'belatra'],
                    // ['key' => '1x2', 'name' => '1x2'],
                    // ['key' => 'VOTA', 'name' => 'VOTA'],
                    // ['key' => 'TOMHORN_AbsoluteLive', 'name' => 'TOMHORN_AbsoluteLive'],
                    // ['key' => 'TOMHORN_7Mojos', 'name' => 'TOMHORN_7Mojos'],
                    // ['key' => 'TOMHORN_FBastards', 'name' => 'TOMHORN_FBastards'],
                    // ['key' => 'TOMHORN_VIVO', 'name' => 'TOMHORN_VIVO'],
                    // ['key' => 'TOMHORN_SLOT', 'name' => 'TOMHORN_SLOT'],
                    // ['key' => 'taishan', 'name' => 'taishan'],
                    // ['key' => 'supernex', 'name' => 'supernex'],
                    // ['key' => 'pragmatic_casino', 'name' => 'pragmatic_casino'],
                    // ['key' => 'pragmatic_slot', 'name' => 'pragmatic_slot'],
                    // ['key' => 'PT_casino', 'name' => 'PT_casino'],
                    // ['key' => 'PT', 'name' => 'PT'],
                    // ['key' => 'PLAYNGO', 'name' => 'PLAYNGO'],
                    // ['key' => 'MICRO_Slot', 'name' => 'MICRO_Slot'],
                    ['key' => 'evolution', 'name' => '에볼루션'],
                    ['key' => 'btg', 'name' => '빅타임게이밍'],
                    ['key' => 'netent', 'name' => '넷엔트'],
                    ['key' => 'nlc', 'name' => '노리밋시티'],
                    ['key' => 'redtiger', 'name' => '레드타이거'],
                    ['key' => 'pp', 'name' => '프라그마틱'],
                    ['key' => 'pp_live', 'name' => '프라그마틱LIVE'],
                    ['key' => 'micro', 'name' => '마이크로'],
                    ['key' => 'micro_live', 'name' => '마이크로LIVE'],
                    ['key' => 'pgsoft', 'name' => 'PGSoft'],
                    ['key' => 'v_AGIN', 'name' => 'AGIN'],
                    ['key' => 'v_SEXYBCRT', 'name' => 'SEXYBCRT'],
                    ['key' => 'v_booongo', 'name' => 'booongo'],
                    ['key' => 'v_bt1', 'name' => 'bt1'],
                    ['key' => 'v_color', 'name' => 'color'],
                    ['key' => 'v_cq9', 'name' => 'cq9'],
                    ['key' => 'v_cq9_casino', 'name' => 'cq9_casino'],
                    ['key' => 'v_dowin', 'name' => 'dowin'],
                    ['key' => 'v_dream', 'name' => 'dream'],
                    ['key' => 'v_evolution', 'name' => 'evolution'],
                    ['key' => 'v_netent', 'name' => 'netent'],
                    ['key' => 'v_redtiger', 'name' => 'redtiger'],
                    ['key' => 'v_btg', 'name' => 'btg'],
                    ['key' => 'v_nlc', 'name' => 'nlc'],
                    ['key' => 'v_fc_arcade', 'name' => 'fc_arcade'],
                    ['key' => 'v_fc_slot', 'name' => 'fc_slot'],
                    ['key' => 'v_habanero', 'name' => 'habanero'],
                    ['key' => 'v_hacksaw_arcade', 'name' => 'hacksaw_arcade'],
                    ['key' => 'v_hacksaw_slot', 'name' => 'hacksaw_slot'],
                    ['key' => 'v_jdb', 'name' => 'jdb'],
                    ['key' => 'v_jdb_arcade', 'name' => 'jdb_arcade'],
                    ['key' => 'v_jili_arcade', 'name' => 'jili_arcade'],
                    ['key' => 'v_jili', 'name' => 'jili'],
                    ['key' => 'v_kgame', 'name' => 'kgame'],
                    ['key' => 'v_MICRO_Slot', 'name' => 'MICRO_Slot'],
                    ['key' => 'v_MICRO_Casino', 'name' => 'MICRO_Casino'],
                    ['key' => 'v_oriental', 'name' => 'oriental'],
                    ['key' => 'v_pgsoft', 'name' => 'pgsoft'],
                    ['key' => 'v_PLAYNGO', 'name' => 'PLAYNGO'],
                    ['key' => 'v_realholdem', 'name' => 'realholdem'],
                    ['key' => 'v_sa', 'name' => 'sa'],
                    ['key' => 'v_TOMHORN_SLOT', 'name' => 'TOMHORN_SLOT'],
                    ['key' => 'v_TOMHORN_AbsoluteLive', 'name' => 'TOMHORN_AbsoluteLive'],
                    ['key' => 'v_TOMHORN_7Mojos', 'name' => 'TOMHORN_7Mojos'],
                    ['key' => 'v_TOMHORN_VIVO', 'name' => 'TOMHORN_VIVO'],
                    ['key' => 'v_VOTA', 'name' => 'VOTA'],
                    ['key' => 'v_1x2', 'name' => '1x2'],
                    ['key' => 'v_belatra', 'name' => 'belatra'],
                    ['key' => 'v_bfgames', 'name' => 'bfgames'],
                    ['key' => 'v_conceptgaming', 'name' => 'conceptgaming'],
                    ['key' => 'v_egp', 'name' => 'egp'],
                    ['key' => 'v_evoplay', 'name' => 'evoplay'],
                    ['key' => 'v_gamefishglobal', 'name' => 'gamefishglobal'],
                    ['key' => 'v_gmw', 'name' => 'gmw'],
                    ['key' => 'v_kagaming', 'name' => 'kagaming'],
                    ['key' => 'v_legaplay', 'name' => 'legaplay'],
                    ['key' => 'v_macaw', 'name' => 'macaw'],
                    ['key' => 'v_mplay', 'name' => 'mplay'],
                    ['key' => 'v_onetouch', 'name' => 'onetouch'],
                    ['key' => 'v_patagonia', 'name' => 'patagonia'],
                    ['key' => 'v_redrake', 'name' => 'redrake'],
                    ['key' => 'v_vibragaming', 'name' => 'vibragaming'],
                    ['key' => 'v_wazdan', 'name' => 'wazdan'],
                ],
                self::VINUS => [
                    ['key' => 'evolution', 'name' => 'evolution'],
                    ['key' => 'pragmatic_casino', 'name' => 'pragmatic_casino'],
                    ['key' => 'AGIN', 'name' => 'AGIN'],
                    ['key' => 'SEXYBCRT', 'name' => 'SEXYBCRT'],
                    ['key' => 'cq9_casino', 'name' => 'cq9_casino'],
                    ['key' => 'MICRO_Casino', 'name' => 'MICRO_Casino'],
                    ['key' => 'taishan', 'name' => 'taishan'],
                    ['key' => 'TOMHORN_VIVO', 'name' => 'TOMHORN_VIVO'],
                    ['key' => 'TOMHORN_7Mojos', 'name' => 'TOMHORN_7Mojos'],
                    ['key' => 'TOMHORN_AbsoluteLive', 'name' => 'TOMHORN_AbsoluteLive'],
                    ['key' => 'VOTA', 'name' => 'VOTA'],
                    ['key' => 'pragmatic_slot', 'name' => 'pragmatic_slot'],
                    ['key' => 'PLAYNGO', 'name' => 'PLAYNGO'],
                    ['key' => 'MICRO_Slot', 'name' => 'MICRO_Slot'],
                    ['key' => 'booongo', 'name' => 'booongo'],
                    ['key' => 'playson', 'name' => 'playson'],
                    ['key' => 'cq9', 'name' => 'cq9'],
                    ['key' => 'habanero', 'name' => 'habanero'],
                    ['key' => 'netent', 'name' => 'netent'],
                    ['key' => 'redtiger', 'name' => 'redtiger'],
                    ['key' => 'TOMHORN_SLOT', 'name' => 'TOMHORN_SLOT'],
                    ['key' => 'patagonia', 'name' => 'patagonia'],
                    ['key' => 'belatra', 'name' => 'belatra'],
                    ['key' => 'bfgames', 'name' => 'bfgames'],
                    ['key' => 'conceptgaming', 'name' => 'conceptgaming'],
                    ['key' => 'egp', 'name' => 'egp'],
                    ['key' => 'evoplay', 'name' => 'evoplay'],
                    ['key' => 'gameart', 'name' => 'gameart'],
                    ['key' => 'gmw', 'name' => 'gmw'],
                    ['key' => 'kagaming', 'name' => 'kagaming'],
                    ['key' => 'legaplay', 'name' => 'legaplay'],
                    ['key' => 'macaw', 'name' => 'macaw'],
                    ['key' => 'mplay', 'name' => 'mplay'],
                    ['key' => 'Njoy Gaming', 'name' => 'Njoy Gaming'],
                    ['key' => 'onetouch', 'name' => 'onetouch'],
                    ['key' => 'wazdan', 'name' => 'wazdan'],
                    ['key' => 'wearecasino', 'name' => 'wearecasino'],
                    ['key' => 'dowin', 'name' => 'dowin'],

                    // New Providers
                    // ['key' => "kendoo", 'name' => "kendoo"],
                    // ['key' => "bt1", 'name' => "bt1"],
                    // ['key' => "color", 'name' => "color"],
                    // ['key' => "dream", 'name' => "dream"],
                    // ['key' => "btg", 'name' => "btg"],
                    // ['key' => "nlc", 'name' => "nlc"],
                    // ['key' => "fc_arcade", 'name' => "fc_arcade"],
                    // ['key' => "fc_slot", 'name' => "fc_slot"],
                    // ['key' => "hacksaw_arcade", 'name' => "hacksaw_arcade"],
                    // ['key' => "hacksaw_slot", 'name' => "hacksaw_slot"],
                    // ['key' => "jdb", 'name' => "jdb"],
                    // ['key' => "jdb_arcade", 'name' => "jdb_arcade"],
                    // ['key' => "jili_arcade", 'name' => "jili_arcade"],
                    // ['key' => "jili", 'name' => "jili"],
                    // ['key' => "kgame", 'name' => "kgame"],
                    // ['key' => "oriental", 'name' => "oriental"],
                    // ['key' => "pgsoft", 'name' => "pgsoft"],
                    // ['key' => "realholdem", 'name' => "realholdem"],
                    // ['key' => "sa", 'name' => "sa"],

                    ['key' => 'gtf', 'name' => 'gtf'], // new
                    ['key' => 'spade', 'name' => 'spade'], // new
                    ['key' => 'yellowbat', 'name' => 'yellowbat'], // new
                    ['key' => 'advantplay', 'name' => 'advantplay'], // new
                    ['key' => 'askmeslot', 'name' => 'askmeslot'], // new
                    ['key' => 'bgaming', 'name' => 'bgaming'], // new
                    ['key' => 'gpk7mj', 'name' => 'gpk7mj'], // new
                    ['key' => 'booming', 'name' => 'booming'], // new
                    ['key' => 'spinomenal', 'name' => 'spinomenal'], // new
                    ['key' => 'dbgame', 'name' => 'dbgame'], // new
                    ['key' => 'live22', 'name' => 'live22'], // new
                    ['key' => 'cg', 'name' => 'cg'], // new
                    ['key' => 'thunderkick', 'name' => 'thunderkick'], // new
                    ['key' => 'evop', 'name' => 'evop'], // new
                ],
                self::THEBIGHIT => [
                    ['key' => 'thebighit', 'name' => 'thebighit'],
                ],
                self::FOURTEN => [
                    ['key' => 'fourten', 'name' => 'fourten'],
                ],
            }
        );
    }
}
