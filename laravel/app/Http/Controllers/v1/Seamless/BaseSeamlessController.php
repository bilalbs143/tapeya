<?php

namespace App\Http\Controllers\v1\Seamless;

use App\Exceptions\Seamless\FailureException;
use App\Facades\CompanyRequest;
use App\Http\Controllers\Controller;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Pipeline;

abstract class BaseSeamlessController extends Controller
{
    protected function run(Request $request, array $pipes): JsonResponse|Collection
    {
        try {
            return Pipeline::send($request)->through($pipes)->thenReturn();
        } catch (Exception $e) {
            if ($e instanceof FailureException) {
                return $e->render();
            }

            return CompanyRequest::throwResponse($e);
        }
    }
}
