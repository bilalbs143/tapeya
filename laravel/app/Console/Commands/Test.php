<?php

namespace App\Console\Commands;

use App\Enums\Company\CompanyEnum;
use App\Http\Controllers\v1\User\GameController;
use App\Models\Company;
use Illuminate\Console\Command;

class Test extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:test';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test command for testing purpose.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        // $games = \App\Models\Game::all();

        // auth()->loginUsingId(10);

        // foreach ($games as $game) {
        //     app(GameController::class)->launch($game);
        // }

        // CompanyEnum::THEBIGHIT->service()->syncGames();

        // dd(md5('80c8213345ada9b70b4196eec2569ff8#123'));

        // $company = Company::where('key', CompanyEnum::THEBIGHIT)->first();

        // $secret = $company->getConfig('secret');

        // dump($secret);

        // // $secret = 'ae38da877fea5e5b11ea89d7f1f44669';
        // $token = 'mltrwmbkjtps78huvqkv';
        // $requestId = '17574436882049047645';
        // if (! $token) {
        //     dd(md5($secret.'#'.$requestId));
        // }

        // dd(md5($secret.'#'.$requestId.'#'.$token));

        // $this->info(now()->format('Y-m-d H:i:s'));

        // info('Running Test Command');
    }
}
