<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\DocumentResource;
use App\Models\Document;
use App\Models\LandAsset;
use App\Support\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use App\Services\ActivityLogger;

class DocumentController extends Controller
{
    public function byAsset(Request $request, LandAsset $asset)
    {
        $this->authorize('view', $asset);
        $documents = $asset->documents()->latest()->get();

        return ApiResponse::success(DocumentResource::collection($documents)->resolve($request), 'Dokumen aset berhasil dimuat');
    }

    public function store(Request $request, LandAsset $asset)
    {
        $this->authorize('create', Document::class);
        $data = $request->validate([
            'document_type' => ['required', 'string', 'max:150'],
            'document_number' => ['nullable', 'string', 'max:150'],
            'document_date' => ['nullable', 'date'],
            'description' => ['nullable', 'string', 'max:5000'],
            'file' => ['required', 'file', 'mimes:pdf,jpg,jpeg,png', 'mimetypes:application/pdf,image/jpeg,image/png', 'max:10240'],
        ]);

        $file = $request->file('file');
        $path = $file->store('asset-documents', 'local');
        $document = Document::create([
            'asset_id' => $asset->id,
            'document_type' => $data['document_type'],
            'document_number' => $data['document_number'] ?? null,
            'document_date' => $data['document_date'] ?? null,
            'file_name' => $file->getClientOriginalName(),
            'file_path' => $path,
            'description' => $data['description'] ?? null,
            'uploaded_by' => $request->user()->id,
        ]);

        // LOG
        ActivityLogger::log(
            'upload',
            "Mengunggah dokumen {$document->file_name} pada aset {$asset->nama_jenis_barang} ({$asset->kode_barang})",
            $request,
            'document',
            $document->id,
            ['asset_id' => $asset->id, 'document_type' => $document->document_type],
        );

        return ApiResponse::success((new DocumentResource($document->load('asset')))->resolve($request), 'Dokumen berhasil diunggah', 201);
    }

    public function show(Request $request, Document $document)
    {
        $this->authorize('view', $document);

        return ApiResponse::success((new DocumentResource($document->load('asset')))->resolve($request));
    }

    public function destroy(Request $request, Document $document)
    {
        $this->authorize('delete', $document);

        // LOG: sebelum dihapus, supaya nama file masih terbaca
        ActivityLogger::log(
            'delete',
            "Menghapus dokumen {$document->file_name}",
            $request,
            'document',
            $document->id,
            ['asset_id' => $document->asset_id],
        );

        Storage::disk('local')->delete($document->file_path);
        $document->delete();

        return response()->noContent();
    }

    public function download(Request $request, Document $document)
    {
        $this->authorize('view', $document);
        abort_unless(Storage::disk('local')->exists($document->file_path), 404);

        // LOG
        ActivityLogger::log(
            'download',
            "Mengunduh dokumen {$document->file_name}",
            $request,
            'document',
            $document->id,
            ['asset_id' => $document->asset_id],
        );

        return Storage::disk('local')->download($document->file_path, $document->file_name);
    }
}
