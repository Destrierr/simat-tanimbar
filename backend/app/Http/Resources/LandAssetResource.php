<?php

namespace App\Http\Resources;

use App\Services\AssetCompletenessService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LandAssetResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'nama_jenis_barang' => $this->nama_jenis_barang,
            'kode_barang' => $this->kode_barang,
            'register' => $this->register,
            'luas' => $this->luas === null ? null : (float) $this->luas,
            'tahun_pengadaan' => $this->tahun_pengadaan,
            'lokasi' => $this->lokasi,
            'letak_alamat' => $this->letak_alamat,
            'kecamatan' => $this->kecamatan,
            'status_tanah' => $this->status_tanah,
            'nama_pemilik' => $this->nama_pemilik,
            'tanggal_dokumen' => $this->tanggal_dokumen?->toDateString(),
            'no_dokumen_kepemilikan' => $this->no_dokumen_kepemilikan,
            'asal_usul' => $this->asal_usul,
            'harga' => $this->harga === null ? null : (float) $this->harga,
            'keterangan' => $this->keterangan,
            'pematokan' => $this->pematokan,
            'progres_bpn' => $this->progres_bpn,
            'permasalahan' => $this->permasalahan,
            'rincian_permasalahan' => $this->rincian_permasalahan,
            'link_google_maps' => $this->link_google_maps,
            'documents' => DocumentResource::collection($this->whenLoaded('documents')),
            'document_count' => $this->whenCounted('documents'),
            'completeness' => app(AssetCompletenessService::class)->calculate($this->resource),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
