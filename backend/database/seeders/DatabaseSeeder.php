<?php

namespace Database\Seeders;

use App\Models\LandAsset;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        foreach ([
            ['name' => 'Admin Aset Tanah', 'email' => 'admin@example.com', 'role' => 'admin'],
            ['name' => 'Operator Aset Tanah', 'email' => 'operator@example.com', 'role' => 'operator'],
            ['name' => 'Viewer Aset Tanah', 'email' => 'viewer@example.com', 'role' => 'viewer'],
        ] as $account) {
            User::updateOrCreate(['email' => $account['email']], $account + ['is_active' => true, 'password' => Hash::make('password')]);
        }

        $admin = User::where('email', 'admin@example.com')->firstOrFail();
        $rows = json_decode(file_get_contents(__DIR__.'/data/land-assets.json'), true, flags: JSON_THROW_ON_ERROR);
        foreach ($rows as $row) {
            unset($row['latitude'], $row['longitude'], $row['document_archive_reference']);
            $mapped = [
                'nama_jenis_barang' => $row['item_name'] ?? null,
                'kode_barang' => $row['item_code'] ?? null,
                'register' => $row['register_number'] ?? null,
                'luas' => $row['land_area'] ?? 0,
                'tahun_pengadaan' => $row['acquisition_year'] ?? null,
                'lokasi' => $row['location_name'] ?? null,
                'letak_alamat' => $row['address'] ?? null,
                'kecamatan' => $row['district'] ?? null,
                'status_tanah' => $row['land_status'] ?? null,
                'jenis_dokumen_kepemilikan' => $row['ownership_document_type'] ?? null,
                'nama_pemilik' => $row['owner_name'] ?? null,
                'tanggal_dokumen' => $row['document_date'] ?? null,
                'no_dokumen_kepemilikan' => $row['ownership_document_number'] ?? null,
                'asal_usul' => $row['acquisition_origin'] ?? null,
                'harga' => $row['asset_value'] ?? null,
                'keterangan' => $row['description'] ?? null,
                'pematokan' => $row['staking_status'] ?? null,
                'progres_bpn' => $row['bpn_progress'] ?? null,
                'permasalahan' => $row['problem_status'] ?? null,
                'rincian_permasalahan' => $row['problem_detail'] ?? null,
                'link_google_maps' => $row['google_maps_url'] ?? null,
                'created_by' => $admin->id,
            ];
            if ($mapped['kode_barang'] !== null && $mapped['register'] !== null) {
                LandAsset::updateOrCreate(['kode_barang' => $mapped['kode_barang'], 'register' => $mapped['register']], $mapped);
            }
        }
    }
}
