<?php

namespace App\Http\Controllers\Api;

use App\Exports\LandAssetsExport;
use App\Http\Controllers\Controller;
use App\Http\Resources\LandAssetResource;
use App\Models\Document;
use App\Models\LandAsset;
use App\Services\AssetCompletenessService;
use App\Support\ApiResponse;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Facades\Excel;
use App\Services\ActivityLogger;

class ReportController extends Controller
{
    public function assets(Request $request)
    {
        $this->authorize('viewAny', LandAsset::class);
        $query = $this->assetQuery($request);
        $page = $query->paginate(min(max($request->integer('per_page', 10), 1), 100));

        return ApiResponse::success(LandAssetResource::collection($page->items())->resolve($request), 'Laporan aset berhasil dimuat', 200, $this->meta($page));
    }

    public function summary(AssetCompletenessService $completeness)
    {
        $total = LandAsset::count();
        $fieldCount = count(AssetCompletenessService::REQUIRED_FIELDS);

        $counts = LandAsset::query()
            ->selectRaw("({$completeness->postgresStatusExpression('assets')}) as status, COUNT(*) as count")
            ->groupByRaw("({$completeness->postgresStatusExpression('assets')})")
            ->pluck('count', 'status');

        $missingRow = (array) LandAsset::query()
            ->selectRaw($completeness->postgresMissingCountsSelect('assets'))
            ->toBase()
            ->first();

        $missingFields = collect($missingRow)
            ->map(fn ($count, $field) => [
                'field' => $field,
                'label' => AssetCompletenessService::LABELS[$field] ?? $field,
                'count' => (int) $count,
            ])
            ->filter(fn ($row) => $row['count'] > 0)
            ->sortByDesc('count')
            ->values();

        $average = $total > 0
            ? round(100 - ($missingFields->sum('count') / ($total * $fieldCount)) * 100, 1)
            : 0;

        $completenessCounts = [
            'Lengkap' => (int) ($counts['Lengkap'] ?? 0),
            'Sebagian Lengkap' => (int) ($counts['Sebagian Lengkap'] ?? 0),
            'Belum Lengkap' => (int) ($counts['Belum Lengkap'] ?? 0),
        ];

        return ApiResponse::success([
            'total_assets' => $total,
            'total_documents' => Document::count(),
            'total_area' => (float) LandAsset::sum('luas'),
            'complete' => $completenessCounts['Lengkap'],
            'partially_complete' => $completenessCounts['Sebagian Lengkap'],
            'incomplete' => $completenessCounts['Belum Lengkap'],
            'completeness_counts' => $completenessCounts,
            'average_completeness' => $average,
            'missing_fields' => $missingFields,
            'by_status_tanah' => DB::table('assets')->join('status_tanah', 'assets.status_tanah_id', '=', 'status_tanah.id')->select('status_tanah.nama as status_tanah', DB::raw('COUNT(*) as count'))->groupBy('status_tanah.nama')->get(),
            'by_progres_bpn' => DB::table('assets')->leftJoin('progres_bpn', 'assets.progres_bpn_id', '=', 'progres_bpn.id')->select('progres_bpn.nama as progres_bpn', DB::raw('COUNT(*) as count'))->groupBy('progres_bpn.nama')->get(),
            'with_problems' => LandAsset::where('ada_permasalahan', true)->count(),
        ], 'Ringkasan laporan berhasil dimuat');
    }


    

    public function exportExcel(Request $request)
    {
        $this->authorize('export', LandAsset::class);

        ActivityLogger::log('export', 'Mengekspor laporan aset (Excel)', $request, 'report', null, ['filters' => $request->query()]);

        return Excel::download(new LandAssetsExport($request->query()), 'laporan-aset-tanah.xlsx');
    }

    public function exportPdf(Request $request)
    {
        $this->authorize('export', LandAsset::class);

        ActivityLogger::log('export', 'Mengekspor laporan aset (PDF)', $request, 'report', null, ['filters' => $request->query()]);


        return Pdf::loadView('reports.assets', ['assets' => $this->assetQuery($request)->get()])->setPaper('a4', 'landscape')->download('laporan-aset-tanah.pdf');
    }

    private function assetQuery(Request $request)
    {
        $query = LandAsset::withCount('documents');
        if ($search = trim((string) $request->query('search'))) {
            $query->where(fn ($q) => $q->where('nama_jenis_barang', 'ilike', "%{$search}%")->orWhere('kode_barang', 'ilike', "%{$search}%")->orWhere('nomor_register', 'ilike', "%{$search}%")->orWhere('lokasi', 'ilike', "%{$search}%")->orWhere('alamat', 'ilike', "%{$search}%")->orWhereIn('kecamatan_id', DB::table('kecamatan')->select('id')->where('nama', 'ilike', "%{$search}%")));
        }
        foreach (['kecamatan' => ['kecamatan_id', 'kecamatan'], 'status_tanah' => ['status_tanah_id', 'status_tanah'], 'progres_bpn' => ['progres_bpn_id', 'progres_bpn']] as $field => [$foreignKey, $table]) {
            if ($request->filled($field)) {
                $query->whereIn($foreignKey, DB::table($table)->select('id')->where('nama', $request->query($field)));
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
        if ($request->filled('completeness')) {
            $expression = app(AssetCompletenessService::class)->postgresStatusExpression('assets');
            $query->whereRaw("({$expression}) = ?", [$request->query('completeness')]);
        }

        return $query->latest('updated_at');
    }

    private function meta($page): array
    {
        return ['current_page' => $page->currentPage(), 'per_page' => $page->perPage(), 'total' => $page->total(), 'last_page' => $page->lastPage()];
    }
}
