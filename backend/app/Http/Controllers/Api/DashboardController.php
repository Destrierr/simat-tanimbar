<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\DocumentResource;
use App\Http\Resources\LandAssetResource;
use App\Models\Document;
use App\Models\LandAsset;
use App\Services\AssetCompletenessService;
use App\Support\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function summary(AssetCompletenessService $completeness)
    {
        $assets = LandAsset::withCount('documents')->get();
        $statuses = $assets->map(fn ($asset) => $completeness->calculate($asset)['status']);

        return ApiResponse::success([
            'total_assets' => $assets->count(),
            'total_area' => (float) $assets->sum('luas'),
            'total_documents' => Document::count(),
            'complete_count' => $statuses->filter(fn ($s) => $s === 'Lengkap')->count(),
            'incomplete_count' => $statuses->filter(fn ($s) => $s !== 'Lengkap')->count(),
            'problem_count' => $assets->filter(fn ($a) => filled($a->permasalahan) && mb_strtolower(trim((string) $a->permasalahan)) !== 'tidak ada')->count(),
            'by_land_status' => DB::table('assets')->join('status_tanah', 'assets.status_tanah_id', '=', 'status_tanah.id')->select('status_tanah.nama as status_tanah', DB::raw('COUNT(*) as count'))->groupBy('status_tanah.nama')->orderByDesc('count')->get(),
            'by_bpn_progress' => DB::table('assets')->leftJoin('progres_bpn', 'assets.progres_bpn_id', '=', 'progres_bpn.id')->select('progres_bpn.nama as progres_bpn', DB::raw('COUNT(*) as count'))->groupBy('progres_bpn.nama')->orderByDesc('count')->get(),
        ], 'Ringkasan dashboard berhasil dimuat');
    }

    public function recentAssets(Request $request)
    {
        $rows = LandAsset::withCount('documents')->latest('updated_at')->limit(min(max($request->integer('limit', 10), 1), 50))->get();

        return ApiResponse::success(LandAssetResource::collection($rows)->resolve($request), 'Aset terbaru berhasil dimuat');
    }

    public function recentDocuments(Request $request)
    {
        $rows = Document::with('asset')->latest()->limit(min(max($request->integer('limit', 10), 1), 50))->get();

        return ApiResponse::success(DocumentResource::collection($rows)->resolve($request), 'Dokumen terbaru berhasil dimuat');
    }
}
