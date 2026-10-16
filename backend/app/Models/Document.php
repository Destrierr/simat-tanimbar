<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\DB;

#[Fillable([
    'asset_id', 'document_type', 'document_number', 'document_date', 'file_name', 'file_path',
    'description', 'uploaded_by',
])]
class Document extends Model
{
    use HasFactory;

    protected $table = 'dokumen_aset';

    protected function casts(): array
    {
        return [
            'tanggal_dokumen' => 'date',
        ];
    }

    public function getDocumentTypeAttribute(): ?string
    {
        return DB::table('jenis_dokumen')->where('id', $this->jenis_dokumen_id)->value('nama');
    }

    public function setDocumentTypeAttribute(string $value): void
    {
        $lookup = DB::table('jenis_dokumen')->where('nama', $value)->first();
        $this->attributes['jenis_dokumen_id'] = $lookup?->id ?? DB::table('jenis_dokumen')->insertGetId([
            'nama' => $value,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function getDocumentNumberAttribute(): ?string
    {
        return $this->nomor_dokumen;
    }

    public function setDocumentNumberAttribute(?string $value): void
    {
        $this->attributes['nomor_dokumen'] = $value;
    }

    public function getDocumentDateAttribute(): mixed
    {
        return $this->tanggal_dokumen;
    }

    public function setDocumentDateAttribute(?string $value): void
    {
        $this->attributes['tanggal_dokumen'] = $value;
    }

    public function getFileNameAttribute(): ?string
    {
        return $this->nama_file;
    }

    public function setFileNameAttribute(string $value): void
    {
        $this->attributes['nama_file'] = $value;
    }

    public function getFilePathAttribute(): ?string
    {
        return $this->lokasi_file;
    }

    public function setFilePathAttribute(string $value): void
    {
        $this->attributes['lokasi_file'] = $value;
    }

    public function getDescriptionAttribute(): ?string
    {
        return $this->keterangan;
    }

    public function setDescriptionAttribute(?string $value): void
    {
        $this->attributes['keterangan'] = $value;
    }

    public function getUploadedByAttribute(): ?int
    {
        return $this->diunggah_oleh;
    }

    public function setUploadedByAttribute(int $value): void
    {
        $this->attributes['diunggah_oleh'] = $value;
    }

    public function asset(): BelongsTo
    {
        return $this->belongsTo(LandAsset::class, 'asset_id');
    }

    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'diunggah_oleh');
    }
}
