<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\DB;

#[Fillable([
    'nama_jenis_barang', 'kode_barang', 'nomor_register', 'register', 'luas', 'tahun_pengadaan', 'lokasi',
    'alamat', 'letak_alamat', 'kecamatan_id', 'kecamatan', 'status_tanah_id', 'status_tanah',
    'nama_pemilik', 'tanggal_dokumen', 'nomor_dokumen_kepemilikan', 'no_dokumen_kepemilikan',
    'asal_usul', 'harga', 'keterangan', 'pematokan', 'progres_bpn_id', 'progres_bpn',
    'ada_permasalahan', 'permasalahan', 'rincian_permasalahan', 'link_google_maps',
])]
class LandAsset extends Model
{
    use HasFactory;

    protected $table = 'assets';

    protected function casts(): array
    {
        return [
            'luas' => 'decimal:2',
            'harga' => 'decimal:2',
            'tanggal_dokumen' => 'date',
            'tahun_pengadaan' => 'integer',
            'pematokan' => 'boolean',
            'ada_permasalahan' => 'boolean',
        ];
    }

    public function getRegisterAttribute(): ?string
    {
        return $this->nomor_register;
    }

    public function setRegisterAttribute(string $value): void
    {
        $this->attributes['nomor_register'] = $value;
    }

    public function getLetakAlamatAttribute(): ?string
    {
        return $this->alamat;
    }

    public function setLetakAlamatAttribute(?string $value): void
    {
        $this->attributes['alamat'] = $value;
    }

    public function getNoDokumenKepemilikanAttribute(): ?string
    {
        return $this->nomor_dokumen_kepemilikan;
    }

    public function setNoDokumenKepemilikanAttribute(?string $value): void
    {
        $this->attributes['nomor_dokumen_kepemilikan'] = $value;
    }

    public function getKecamatanAttribute(): ?string
    {
        return $this->lookupName('kecamatan', $this->kecamatan_id);
    }

    public function setKecamatanAttribute(string $value): void
    {
        $this->attributes['kecamatan_id'] = $this->lookupId('kecamatan', $value);
    }

    public function getStatusTanahAttribute(): ?string
    {
        return $this->lookupName('status_tanah', $this->status_tanah_id);
    }

    public function setStatusTanahAttribute(string $value): void
    {
        $this->attributes['status_tanah_id'] = $this->lookupId('status_tanah', $value);
    }

    public function getProgresBpnAttribute(): ?string
    {
        return $this->lookupName('progres_bpn', $this->progres_bpn_id);
    }

    public function setProgresBpnAttribute(string $value): void
    {
        $this->attributes['progres_bpn_id'] = $this->lookupId('progres_bpn', $value);
    }

    public function getPermasalahanAttribute(): ?string
    {
        return $this->ada_permasalahan ? ($this->rincian_permasalahan ?: 'Ada') : 'Tidak ada';
    }

    public function setPermasalahanAttribute(?string $value): void
    {
        $this->attributes['ada_permasalahan'] = filled($value) && mb_strtolower(trim($value)) !== 'tidak ada';
    }

    public function setPematokanAttribute(bool|string|int $value): void
    {
        $normalized = mb_strtolower(trim((string) $value));
        $this->attributes['pematokan'] = in_array($normalized, ['1', 'true', 'ya', 'sudah', 'sudah patok'], true);
    }

    private function lookupName(string $table, ?int $id): ?string
    {
        return $id ? DB::table($table)->where('id', $id)->value('nama') : null;
    }

    private function lookupId(string $table, string $name): int
    {
        $lookup = DB::table($table)->where('nama', $name)->first();

        return $lookup?->id ?? DB::table($table)->insertGetId([
            'nama' => $name,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function documents(): HasMany
    {
        return $this->hasMany(Document::class, 'asset_id');
    }
}
