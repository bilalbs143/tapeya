<?php

namespace Database\Seeders;

use App\Enums\Company\CompanyEnum;
use App\Models\Company;
use App\Models\Provider;
use Illuminate\Database\Seeder;
use Illuminate\Support\Collection;

class CompaniesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('=== Seeding Companies ===');

        foreach (CompanyEnum::allEnabled() as $companyKey) {
            $company = $this->createCompany($companyKey, $companyKey->config());
            $this->createProviders($company, $companyKey->providers());
        }

        $this->command->info('=== Companies seeded! ===');
    }

    private function createCompany(
        CompanyEnum $key,
        array $config
    ): Company {
        return Company::updateOrCreate(
            ['key' => $key],
            ['configurations' => $config, 'is_production' => app()->isProduction()]
        );
    }

    private function createProviders(Company $company, Collection $providers)
    {
        $providers->each(fn ($provider) => $this->createProvider($company, $provider['key'], $provider['name']));
    }

    private function createProvider(
        Company $company,
        string $key,
        string $name
    ): Provider {
        return Provider::updateOrCreate(
            ['key' => $key, 'company_id' => $company->id],
            ['name' => $name]
        );
    }
}
