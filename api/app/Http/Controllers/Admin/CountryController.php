<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CountryController extends Controller
{
    /**
     * List countries for dropdowns. Returns id, name, country_code (iso2).
     * Uses nnjeim/world package when available.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $action = \Nnjeim\World\World::countries([
                'fields' => 'id,name,iso2',
                'search' => $request->input('search'),
            ]);

            if (! $action->success || ! $action->data) {
                return response()->json(['data' => []]);
            }

            $data = collect($action->data)->map(fn ($c) => [
                'id' => is_object($c) ? $c->id : $c['id'] ?? null,
                'name' => is_object($c) ? $c->name : $c['name'] ?? '',
                'country_code' => is_object($c) ? ($c->iso2 ?? null) : ($c['iso2'] ?? null),
            ])->filter(fn ($c) => $c['country_code'] !== null)->values();

            return response()->json(['data' => $data]);
        } catch (\Throwable) {
            return response()->json(['data' => []]);
        }
    }

    /**
     * List cities by country (iso2 code) for dropdowns.
     */
    public function cities(Request $request): JsonResponse
    {
        $countryCode = $request->input('country_code');
        if (empty($countryCode)) {
            return response()->json(['data' => []]);
        }

        try {
            $action = \Nnjeim\World\World::cities([
                'fields' => 'id,name',
                'filters' => ['country_code' => $countryCode],
                'search' => $request->input('search'),
            ]);

            if (! $action->success || ! $action->data) {
                return response()->json(['data' => []]);
            }

            $data = collect($action->data)->map(fn ($c) => [
                'id' => is_object($c) ? $c->id : $c['id'] ?? null,
                'name' => is_object($c) ? $c->name : $c['name'] ?? '',
            ])->values();

            return response()->json(['data' => $data]);
        } catch (\Throwable) {
            return response()->json(['data' => []]);
        }
    }
}
