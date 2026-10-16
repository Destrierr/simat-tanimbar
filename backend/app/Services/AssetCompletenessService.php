<?php

namespace App\Services;

use App\Models\LandAsset;

class AssetCompletenessService
{
    /**
     * Initial implementation rule. The planning documents state that the final
     * required-field rule is to be agreed during requirements analysis.
     */
    public const REQUIRED_FIELDS = [
        'nama_jenis_barang', 'kode_barang', 'nomor_register', 'luas', 'tahun_pengadaan',
        'lokasi', 'alamat', 'kecamatan_id', 'status_tanah_id', 'nama_pemilik',
        'tanggal_dokumen', 'nomor_dokumen_kepemilikan', 'asal_usul', 'harga',
        'pematokan', 'progres_bpn_id',
    ];

    public function postgresStatusExpression(string $table = 'assets'): string
    {
        $parts = array_map(fn (string $field) => "CASE WHEN NULLIF(TRIM(CAST({$table}.{$field} AS TEXT)), '') IS NOT NULL THEN 1 ELSE 0 END", self::REQUIRED_FIELDS);
        $filled = implode(' + ', $parts);
        $total = count(self::REQUIRED_FIELDS);

        return "CASE WHEN ({$filled}) = {$total} THEN 'Lengkap' WHEN ({$filled}) > 0 THEN 'Sebagian Lengkap' ELSE 'Belum Lengkap' END";
    }

    public function calculate(LandAsset $asset): array
    {
        $filled = collect(self::REQUIRED_FIELDS)->filter(function (string $field) use ($asset) {
            $value = $asset->{$field};

            return $value !== null && trim((string) $value) !== '';
        })->count();

        $total = count(self::REQUIRED_FIELDS);
        $percentage = $total > 0 ? round(($filled / $total) * 100, 2) : 100;

        $status = match (true) {
            $percentage >= 100 => 'Lengkap',
            $percentage > 0 => 'Sebagian Lengkap',
            default => 'Belum Lengkap',
        };

        $missing = collect(self::REQUIRED_FIELDS)->filter(fn (string $field) => blank($asset->{$field}))->values()->all();

        return ['percentage' => $percentage, 'status' => $status, 'filled_required_fields' => $filled, 'total_required_fields' => $total, 'missing_fields' => $missing];
    }
}
