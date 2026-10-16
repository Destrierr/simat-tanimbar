<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DocumentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'asset_id' => $this->asset_id,
            'document_type' => $this->document_type,
            'document_number' => $this->document_number,
            'document_date' => $this->document_date?->toDateString(),
            'file_name' => $this->file_name,
            'description' => $this->description,
            'uploaded_by' => $this->uploaded_by,
            'asset' => $this->whenLoaded('asset', fn () => $this->asset ? [
                'id' => $this->asset->id,
                'nama_jenis_barang' => $this->asset->nama_jenis_barang,
                'kode_barang' => $this->asset->kode_barang,
                'register' => $this->asset->register,
            ] : null),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
