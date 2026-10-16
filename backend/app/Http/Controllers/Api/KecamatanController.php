<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreKecamatanRequest;
use App\Http\Requests\UpdateKecamatanRequest;
use App\Models\Kecamatan;
use App\Support\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class KecamatanController extends Controller
{
    public function index(Request $request)
    {
        $query = Kecamatan::query()->withCount('assets');

        if ($search = trim((string) $request->query('search'))) {
            $query->where('nama', 'ilike', "%{$search}%")
                ->orWhere('deskripsi', 'ilike', "%{$search}%");
        }

        $page = $query->orderBy('nama')->paginate(
            min(max($request->integer('per_page', 100), 1), 100),
        );

        return ApiResponse::success(
            $page->items(),
            'Daftar kecamatan berhasil dimuat',
            200,
            [
                'current_page' => $page->currentPage(),
                'per_page' => $page->perPage(),
                'total' => $page->total(),
                'last_page' => $page->lastPage(),
            ],
        );
    }

    public function store(StoreKecamatanRequest $request)
    {
        $kecamatan = Kecamatan::create($request->validated());

        return ApiResponse::success(
            $kecamatan->loadCount('assets'),
            'Kecamatan berhasil ditambahkan',
            201,
        );
    }

    public function show(Kecamatan $kecamatan)
    {
        return ApiResponse::success(
            $kecamatan->loadCount('assets'),
            'Detail kecamatan berhasil dimuat',
        );
    }

    public function update(UpdateKecamatanRequest $request, Kecamatan $kecamatan)
    {
        $kecamatan->update($request->validated());

        return ApiResponse::success(
            $kecamatan->fresh()->loadCount('assets'),
            'Kecamatan berhasil diperbarui',
        );
    }

    public function destroy(Kecamatan $kecamatan)
    {
        $assetCount = DB::table('assets')
            ->where('kecamatan_id', $kecamatan->id)
            ->count();

        if ($assetCount > 0) {
            return ApiResponse::error(
                'Kecamatan tidak dapat dihapus karena masih digunakan oleh aset.',
                422,
                ['assets' => ["Kecamatan ini digunakan oleh {$assetCount} aset."]],
            );
        }

        $kecamatan->delete();

        return response()->noContent();
    }
}
