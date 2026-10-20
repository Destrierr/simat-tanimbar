<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreLandAssetRequest;
use App\Http\Requests\UpdateLandAssetRequest;
use App\Http\Resources\LandAssetResource;
use App\Models\LandAsset;
use App\Services\AssetCompletenessService;
use App\Services\LandAssetService;
use App\Support\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Services\ActivityLogger;

class LandAssetController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', LandAsset::class);
        $query = LandAsset::query()->withCount('documents');
        $this->applyFilters($query, $request);

        $sort = $request->query('sort', 'id');
        $direction = $request->query('direction') === 'asc' ? 'asc' : 'desc';
        $allowedSorts = ['id', 'nama_jenis_barang', 'kode_barang', 'register', 'luas', 'kecamatan', 'tahun_pengadaan'];
        if (in_array($sort, $allowedSorts, true)) {
            $query->orderBy($sort === 'register' ? 'nomor_register' : ($sort === 'kecamatan' ? 'kecamatan_id' : $sort), $direction);
        }

        $page = $query->paginate(min(max($request->integer('per_page', 10), 1), 100));
        $completenessExpression = app(AssetCompletenessService::class)
            ->postgresStatusExpression('assets');
        $completenessQuery = LandAsset::query();
        $this->applyFilters($completenessQuery, $request, withCompleteness: false);
        $completenessCounts = $completenessQuery
            ->selectRaw("({$completenessExpression}) as status, COUNT(*) as count")
            ->groupByRaw("({$completenessExpression})")
            ->pluck('count', 'status');
        $filterOptions = [
            'status_tanah' => DB::table('status_tanah')->orderBy('nama')->pluck('nama'),
            'nama_jenis_barang' => LandAsset::query()
                ->whereNotNull('nama_jenis_barang')
                ->distinct()
                ->orderBy('nama_jenis_barang')
                ->pluck('nama_jenis_barang'),
        ];

        return ApiResponse::success(
            LandAssetResource::collection($page->items())->resolve($request),
            'Daftar aset berhasil dimuat',
            200,
            [
                'current_page' => $page->currentPage(),
                'per_page' => $page->perPage(),
                'total' => $page->total(),
                'last_page' => $page->lastPage(),
                'completeness_counts' => $completenessCounts,
                'filter_options' => $filterOptions,
            ],
        );
    }

    public function store(StoreLandAssetRequest $request, LandAssetService $service)
    {
        $this->authorize('create', LandAsset::class);
        $asset = $service->create($request->validated());

        ActivityLogger::log('create', "Menambah aset {$asset->nama_jenis_barang} ({$asset->kode_barang})", $request, 'asset', $asset->id);

        return ApiResponse::success((new LandAssetResource($asset))->resolve($request), 'Aset berhasil ditambahkan', 201);
    }

    public function show(Request $request, LandAsset $asset)
    {
        $this->authorize('view', $asset);
        $asset->load('documents');

        return ApiResponse::success((new LandAssetResource($asset))->resolve($request));
    }

    public function update(UpdateLandAssetRequest $request, LandAsset $asset, LandAssetService $service)
    {
        $this->authorize('update', $asset);
        $asset = $service->update($asset, $request->validated());

        ActivityLogger::log('update', "Mengubah aset {$asset->nama_jenis_barang} ({$asset->kode_barang})", $request, 'asset', $asset->id, [
            'changed_fields' => array_keys($request->validated()),
        ]);

        return ApiResponse::success((new LandAssetResource($asset))->resolve($request), 'Aset berhasil diperbarui');
    }

    public function destroy(Request $request, LandAsset $asset, LandAssetService $service)
    {
        $this->authorize('delete', $asset);

        ActivityLogger::log('delete', "Menghapus aset {$asset->nama_jenis_barang} ({$asset->kode_barang})", $request, 'asset', $asset->id);
        
        $service->delete($asset);

        return response()->noContent();
    }

    private function applyFilters($query, Request $request, bool $withCompleteness = true): void
    {
        if ($search = trim((string) $request->query('search'))) {
            $query->where(fn ($q) => $q
                ->where('nama_jenis_barang', 'ilike', "%{$search}%")
                ->orWhere('kode_barang', 'ilike', "%{$search}%")
                ->orWhere('nomor_register', 'ilike', "%{$search}%")
                ->orWhere('lokasi', 'ilike', "%{$search}%")
                ->orWhere('alamat', 'ilike', "%{$search}%")
                ->orWhereIn('kecamatan_id', DB::table('kecamatan')->select('id')->where('nama', 'ilike', "%{$search}%")));
        }

        foreach (['kecamatan' => ['kecamatan_id', 'kecamatan'], 'status_tanah' => ['status_tanah_id', 'status_tanah'], 'progres_bpn' => ['progres_bpn_id', 'progres_bpn']] as $filter => [$foreignKey, $table]) {
            if ($request->filled($filter)) {
                $query->whereIn($foreignKey, DB::table($table)->select('id')->where('nama', $request->query($filter)));
            }
        }
        if ($request->filled('tahun_pengadaan')) {
            $query->where('tahun_pengadaan', $request->query('tahun_pengadaan'));
        }
        if ($request->filled('pematokan')) {
            $query->where('pematokan', filter_var($request->query('pematokan'), FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE) ?? mb_strtolower($request->query('pematokan')) === 'sudah patok');
        }
        if ($request->filled('permasalahan')) {
            $query->where('ada_permasalahan', mb_strtolower($request->query('permasalahan')) !== 'tidak ada');
        }

        if ($request->filled('nama_jenis_barang')) {
            $query->where('nama_jenis_barang', $request->query('nama_jenis_barang'));
        }
        if ($request->filled('register')) {
            $query->where('nomor_register', $request->query('register'));
        }

        if ($request->filled('completeness')) {
            $expression = app(AssetCompletenessService::class)->postgresStatusExpression('assets');
            $query->whereRaw("({$expression}) = ?", [$request->query('completeness')]);
        }
        if ($withCompleteness && $request->filled('completeness')) {
            $expression = app(AssetCompletenessService::class)->postgresStatusExpression('assets');
            $query->whereRaw("({$expression}) = ?", [$request->query('completeness')]);
        }
    }
}
