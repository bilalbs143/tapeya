<?php

namespace App\Http\Controllers\v1\Admin;

use App\Events\Admin\User\KillAuthSession;
use App\Http\Resources\v1\Auth\LoginHistoryResource;
use App\Models\AuthenticationLog;
use Spatie\QueryBuilder\QueryBuilder;

class AuthenticationLogController extends BaseAdminController
{
    public function __construct()
    {
        parent::__construct(AuthenticationLog::class, LoginHistoryResource::class);
    }

    protected function baseQuery()
    {
        return $this->model->query();
    }

    public function loginHistory()
    {
        $data = QueryBuilder::for(AuthenticationLog::class)
            ->filterByAgentRole('authenticatable_id')
            ->ignoreSystem()
            ->with(['authenticatable', 'authenticatable.bank_account'])
            ->allowedFilters(AuthenticationLog::getFilters())
            ->defaultSort('-id')
            ->allowedSorts(AuthenticationLog::getSorts())
            ->pagination();

        return LoginHistoryResource::collection($data);
    }

    public function currentSessions()
    {
        // $subQuery = AuthenticationLog::query()
        //     ->current()
        //     ->select(DB::raw('MAX(id) as id'))
        //     ->groupBy('authenticatable_id');

        $data = QueryBuilder::for(AuthenticationLog::class)
            ->filterByAgentRole('authenticatable_id')
            ->current()
            // ->whereIn('id', $subQuery)
            ->with(['authenticatable', 'authenticatable.bank_account'])
            ->allowedFilters(AuthenticationLog::getFilters())
            ->defaultSort('-id')
            ->allowedSorts(AuthenticationLog::getSorts())
            ->pagination();

        return LoginHistoryResource::collection($data);
    }

    public function killSession(int $id)
    {
        $session = AuthenticationLog::with('authenticatable')->findOrFail($id);
        if ($session->authenticatable->id === auth()->id()) {
            return $this->forbidden('cannot_kill_own_session');
        }

        $session->logout();

        KillAuthSession::dispatch($session);

        return $this->success(message: 'session_killed');
    }
}
