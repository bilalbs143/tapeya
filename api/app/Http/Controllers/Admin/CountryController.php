<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Nnjeim\World\Models\City;
use Nnjeim\World\Models\Country;

class CountryController extends Controller
{
    /**
     * List countries for dropdowns. Returns id, name, country_code (iso2).
     * Reads from nnjeim/world package's countries table.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Country::query()
                ->select('id', 'name', 'iso2')
                ->whereNotNull('iso2')
                ->orderBy('name');

            if ($request->filled('search')) {
                $search = $request->input('search');
                $query->where('name', 'like', '%'.$search.'%');
            }

            $data = $query->get()->map(fn ($c) => [
                'id' => $c->id,
                'name' => $c->name,
                'country_code' => $c->iso2,
            ])->values();

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
            $query = City::query()
                ->select('id', 'name')
                ->where('country_code', $countryCode)
                ->orderBy('name');

            if ($request->filled('search')) {
                $search = $request->input('search');
                $query->where('name', 'like', '%'.$search.'%');
            }

            $data = $query->get()->map(fn ($c) => [
                'id' => $c->id,
                'name' => $c->name,
            ])->values();

            return response()->json(['data' => $data]);
        } catch (\Throwable) {
            return response()->json(['data' => []]);
        }
    }
}
