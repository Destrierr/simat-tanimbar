<?php

namespace App\Exports;

use App\Models\LandAsset;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;

class LandAssetsExport implements FromCollection, WithHeadings
{
    public function __construct(private readonly array $filters = []) {}

    public function collection(): Collection
    {
        $q = LandAsset::query();
        if (! empty($this->filters['search'])) {
            $s = $this->filters['search'];
            $q->where(fn ($x) => $x->where('nama_jenis_barang', 'ilike', "%{$s}%")->orWhere('kode_barang', 'ilike', "%{$s}%")->orWhere('nomor_register', 'ilike', "%{$s}%")->orWhere('lokasi', 'ilike', "%{$s}%")->orWhereIn('kecamatan_id', DB::table('kecamatan')->select('id')->where('nama', 'ilike', "%{$s}%")));
        }
        foreach (['kecamatan' => ['kecamatan_id', 'kecamatan'], 'status_tanah' => ['status_tanah_id', 'status_tanah'], 'progres_bpn' => ['progres_bpn_id', 'progres_bpn']] as $field => [$foreignKey, $table]) {
            if (! empty($this->filters[$field])) {
                $q->whereIn($foreignKey, DB::table($table)->select('id')->where('nama', $this->filters[$field]));
            }
        }
        if (! empty($this->filters['tahun_pengadaan'])) {
            $q->where('tahun_pengadaan', $this->filters['tahun_pengadaan']);
        }
        if (array_key_exists('pematokan', $this->filters)) {
            $q->where('pematokan', filter_var($this->filters['pematokan'], FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE) ?? mb_strtolower($this->filters['pematokan']) === 'sudah patok');
        }
        if (! empty($this->filters['permasalahan'])) {
            $q->where('ada_permasalahan', mb_strtolower($this->filters['permasalahan']) !== 'tidak ada');
        }

        return $q->latest('updated_at')->get()->map(fn ($a) => [
            $a->nama_jenis_barang, $a->kode_barang, $a->register, $a->luas, $a->tahun_pengadaan,
            $a->lokasi, $a->letak_alamat, $a->kecamatan, $a->status_tanah,
            $a->nama_pemilik, $a->tanggal_dokumen?->format('Y-m-d'), $a->no_dokumen_kepemilikan,
            $a->asal_usul, $a->harga, $a->keterangan, $a->pematokan, $a->progres_bpn,
            $a->permasalahan, $a->rincian_permasalahan, $a->link_google_maps,
        ]);
    }

    public function headings(): array
    {
        return ['Nama/Jenis Barang', 'Kode Barang', 'Register', 'Luas', 'Tahun Pengadaan', 'Lokasi', 'Letak/Alamat', 'Kecamatan', 'Status Tanah', 'Nama Pemilik', 'Tanggal Dokumen', 'No. Dokumen Kepemilikan', 'Asal Usul', 'Harga', 'Keterangan', 'Pematokan', 'Progres BPN', 'Permasalahan', 'Rincian Permasalahan', 'Link Google Maps'];
    }
}
