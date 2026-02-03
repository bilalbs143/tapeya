<?php

namespace App\Services\Payments\NowPayments;

use App\Enums\CryptoPayments\PaymentGatewayEnum;
use App\Enums\Currency\CurrencyTypeEnum;
use App\Models\CryptoCurrency;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use PrevailExcel\Nowpayments\Facades\Nowpayments;

class CurrencyService extends BaseNowPaymentService
{
    public function sync()
    {
        $availableCurrencies = Nowpayments::getCurrencies();

        if (! isset($availableCurrencies['currencies'])) {
            return false;
        }

        $currencyCodes = $availableCurrencies['currencies'];

        $detailedCurrencies = $this->fetchDetailedCurrencies($currencyCodes);

        $this->updateOrCreate($detailedCurrencies, $currencyCodes);

        return true;
    }

    private function fetchDetailedCurrencies(array $currencyCodes): array
    {
        $detailed = [];

        try {
            $response = Http::withHeaders([
                'x-api-key' => config('nowpayments.apiKey'),
            ])->get(NowPaymentsUtils::resolveUrl('full-currencies'));

            if ($response->successful()) {
                $fullCurrencies = $response->json();

                if (isset($fullCurrencies['currencies'])) {
                    foreach ($fullCurrencies['currencies'] as $currency) {
                        // Case-insensitive matching since basic API returns lowercase but detailed API uses uppercase
                        if (in_array(strtolower($currency['code']), array_map('strtolower', $currencyCodes))) {
                            $detailed[strtolower($currency['code'])] = $currency;
                        }
                    }
                }
            }
        } catch (\Exception $e) {
            Log::error('Failed to fetch detailed currencies: '.$e->getMessage());
        }

        return $detailed;
    }

    private function updateOrCreate(array $detailedCurrencies, array $availableCurrencies): void
    {
        $updated = 0;
        $created = 0;
        $disabled = 0;

        // Process each available currency
        foreach ($availableCurrencies as $code) {
            $detailed = $detailedCurrencies[$code] ?? null;

            $currencyData = [
                'code' => strtolower($code),
                'name' => $detailed['name'] ?? ucfirst($code),
                'logo_url' => $detailed['logo_url'] ?? null,
                'category' => CurrencyTypeEnum::findByCode($code),
                'enabled' => true,
                'network' => $detailed['network'] ?? null,
                'is_maxlimit' => $detailed['is_maxlimit'] ?? false,
                'is_popular' => $detailed['is_popular'] ?? false,
                'is_stable' => $detailed['is_stable'] ?? false,
                'network_precision' => $detailed['network_precision'] ?? null,
                'wallet_regex' => $detailed['wallet_regex'] ?? null,
                'extra_data' => $detailed ? json_encode($detailed) : null,
                'last_synced_at' => now(),
            ];

            $currencyData['priority'] = $currencyData['category']->priority();

            $currency = CryptoCurrency::updateOrCreate(
                [
                    'code' => $currencyData['code'],
                    'gateway' => PaymentGatewayEnum::NOWPAYMENTS,
                ],
                $currencyData
            );

            if ($currency->wasRecentlyCreated) {
                $created++;
            } else {
                $updated++;
            }
        }

        // Disable currencies that are no longer available
        $availableCodesLower = array_map('strtolower', $availableCurrencies);
        $disabledCount = CryptoCurrency::whereNotIn('code', $availableCodesLower)
            ->enabled()
            ->update([
                'enabled' => false,
                'last_synced_at' => now(),
            ]);

        $disabled = $disabledCount;

        Log::info("Database updated: {$created} created, {$updated} updated, {$disabled} disabled");
    }
}
