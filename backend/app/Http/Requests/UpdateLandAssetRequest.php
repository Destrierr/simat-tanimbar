<?php

namespace App\Http\Requests;

use App\Models\LandAsset;
use Illuminate\Validation\Rule;

class UpdateLandAssetRequest extends StoreLandAssetRequest
{
    public function rules(): array
    {
        $asset = $this->route('asset');
        $ignore = $asset instanceof LandAsset ? $asset->id : null;

        return [
            'nama_jenis_barang' => ['sometimes', 'required', 'string', 'max:255'],
            'kode_barang' => ['sometimes', 'required', 'string', 'max:100'],
            'register' => ['sometimes', 'required', 'string', 'max:100', Rule::unique('assets', 'nomor_register')->where(fn ($q) => $q->where('kode_barang', $this->input('kode_barang', $asset?->kode_barang)))->ignore($ignore)],
            'luas' => ['sometimes', 'required', 'numeric', 'min:0'],
            'tahun_pengadaan' => ['sometimes', 'required', 'integer', 'between:1800,2200'],
            'lokasi' => ['sometimes', 'required', 'string', 'max:255'],
            'letak_alamat' => ['sometimes', 'required', 'string', 'max:2000'],
            'kecamatan' => ['sometimes', 'required', 'string', 'max:100', Rule::exists('kecamatan', 'nama')],
            'status_tanah' => ['sometimes', 'required', 'string', 'max:150'],
            'nama_pemilik' => ['sometimes', 'required', 'string', 'max:255'],
            'tanggal_dokumen' => ['sometimes', 'required', 'date'],
            'no_dokumen_kepemilikan' => ['sometimes', 'required', 'string', 'max:150'],
            'asal_usul' => ['sometimes', 'required', 'string', 'max:150'],
            'harga' => ['sometimes', 'required', 'numeric', 'min:0'],
            'keterangan' => ['sometimes', 'nullable', 'string', 'max:10000'],
            'pematokan' => ['sometimes', 'required', 'boolean'],
            'progres_bpn' => ['sometimes', 'required', 'string', 'max:150'],
            'permasalahan' => ['sometimes', 'nullable', 'string', 'max:255'],
            'rincian_permasalahan' => ['sometimes', 'nullable', 'string', 'max:10000'],
            'link_google_maps' => ['sometimes', 'nullable', 'url', 'max:2000'],
        ];
    }
}
