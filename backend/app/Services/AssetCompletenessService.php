<?php

namespace App\Services;

use App\Models\LandAsset;

class AssetCompletenessService
{
    public const REQUIRED_FIELDS = [
        'nama_jenis_barang', 'kode_barang', 'nomor_register', 'luas', 'tahun_pengadaan',
        'lokasi', 'alamat', 'kecamatan_id', 'status_tanah_id', 'nama_pemilik',
        'tanggal_dokumen', 'nomor_dokumen_kepemilikan', 'asal_usul', 'harga',
        'pematokan', 'progres_bpn_id',
    ];

    public const LABELS = [
        'nama_jenis_barang' => 'Nama/Jenis Barang',
        'kode_barang' => 'Kode Barang',
        'nomor_register' => 'Nomor Register',
        'luas' => 'Luas',
        'tahun_pengadaan' => 'Tahun Pengadaan',
        'lokasi' => 'Lokasi',
        'alamat' => 'Letak/Alamat',
        'kecamatan_id' => 'Kecamatan',
        'status_tanah_id' => 'Status Tanah',
        'nama_pemilik' => 'Nama Pemilik',
        'tanggal_dokumen' => 'Tanggal Dokumen',
        'nomor_dokumen_kepemilikan' => 'No. Dokumen Kepemilikan',
        'asal_usul' => 'Asal Usul',
        'harga' => 'Harga',
        'pematokan' => 'Pematokan',
        'progres_bpn_id' => 'Progres BPN',
    ];

    // Minimal field terisi agar "Sebagian Lengkap". Di bawahnya = "Belum Lengkap".
    // 1 = perilaku sekarang. Naikkan (mis. 8) agar "Belum Lengkap" bermakna.
    public const PARTIAL_MIN_FILLED = 1;

    private function postgresFilledExpression(string $table): string
    {
        return implode(' + ', array_map(
            fn (string $f) => "CASE WHEN NULLIF(TRIM(CAST({$table}.{$f} AS TEXT)), '') IS NOT NULL THEN 1 ELSE 0 END",
            self::REQUIRED_FIELDS,
        ));
    }

    public function postgresStatusExpression(string $table = 'assets'): string
    {
        $filled = $this->postgresFilledExpression($table);
        $total = count(self::REQUIRED_FIELDS);
        $min = self::PARTIAL_MIN_FILLED;

        return "CASE WHEN ({$filled}) = {$total} THEN 'Lengkap' WHEN ({$filled}) >= {$min} THEN 'Sebagian Lengkap' ELSE 'Belum Lengkap' END";
    }

    // Jumlah aset yang kosong per field, dalam satu query
    public function postgresMissingCountsSelect(string $table = 'assets'): string
    {
        return implode(', ', array_map(
            fn (string $f) => "COALESCE(SUM(CASE WHEN NULLIF(TRIM(CAST({$table}.{$f} AS TEXT)), '') IS NULL THEN 1 ELSE 0 END), 0) AS {$f}",
            self::REQUIRED_FIELDS,
        ));
    }

    public function calculate(LandAsset $asset): array
    {
        // blank() memperlakukan false dan 0 sebagai terisi, sama seperti SQL
        $missing = collect(self::REQUIRED_FIELDS)
            ->filter(fn (string $f) => blank($asset->{$f}))
            ->values()
            ->all();

        $total = count(self::REQUIRED_FIELDS);
        $filled = $total - count($missing);
        $percentage = $total > 0 ? round(($filled / $total) * 100, 2) : 100;

        $status = match (true) {
            $filled === $total => 'Lengkap',
            $filled >= self::PARTIAL_MIN_FILLED => 'Sebagian Lengkap',
            default => 'Belum Lengkap',
        };

        return [
            'percentage' => $percentage,
            'status' => $status,
            'filled_required_fields' => $filled,
            'total_required_fields' => $total,
            'missing_fields' => $missing,
        ];
    }
}
