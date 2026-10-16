<?php

namespace Database\Factories;

use App\Models\LandAsset;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<LandAsset> */
class LandAssetFactory extends Factory
{
    protected $model = LandAsset::class;

    public function definition(): array
    {
        return [
            'nama_jenis_barang' => fake()->randomElement(['Tanah Bangunan Pendidikan Dan Latihan', 'Tanah Kantor', 'Tanah Puskesmas']),
            'kode_barang' => fake()->numerify('01.01.##.##.###'),
            'register' => fake()->unique()->numberBetween(1, 999999),
            'luas' => fake()->randomFloat(2, 100, 50000),
            'tahun_pengadaan' => fake()->numberBetween(2000, 2026),
            'lokasi' => fake()->city(),
            'letak_alamat' => fake()->address(),
            'kecamatan' => fake()->randomElement(['Tanimbar Selatan', 'Nirunmas', 'Wertamrian', 'Tanimbar Utara']),
            'status_tanah' => 'Hak Pakai',
            'nama_pemilik' => 'Pemerintah Kabupaten Kepulauan Tanimbar',
            'tanggal_dokumen' => fake()->date(),
            'no_dokumen_kepemilikan' => fake()->numerify('DOC-#####'),
            'asal_usul' => 'Pembelian',
            'harga' => fake()->randomFloat(2, 1000000, 5000000000),
            'keterangan' => null,
            'pematokan' => true,
            'progres_bpn' => 'Sertipikat Selesai',
            'permasalahan' => 'Tidak ada',
            'rincian_permasalahan' => null,
            'link_google_maps' => 'https://maps.google.com/?q=-7.5,131.3',
        ];
    }
}
