<?php

namespace App\Http\Requests;

use App\Models\LandAsset;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreLandAssetRequest extends FormRequest
{
    public function authorize(): bool
    {
        return in_array($this->user()?->role, ['admin', 'operator'], true);
    }

    public function rules(): array
    {
        $asset = $this->route('asset');
        $ignore = $asset instanceof LandAsset ? $asset->id : null;

        return [
            'nama_jenis_barang' => ['required', 'string', 'max:255'],
            'kode_barang' => ['required', 'string', 'max:100'],
            'register' => ['required', 'string', 'max:100', Rule::unique('assets', 'nomor_register')->where(fn ($q) => $q->where('kode_barang', $this->input('kode_barang')))->ignore($ignore)],
            'luas' => ['required', 'numeric', 'min:0'],
            'tahun_pengadaan' => ['required', 'integer', 'between:1800,2200'],
            'lokasi' => ['required', 'string', 'max:255'],
            'letak_alamat' => ['required', 'string', 'max:2000'],
            'kecamatan' => ['required', 'string', 'max:100', Rule::exists('kecamatan', 'nama')],
            'status_tanah' => ['required', 'string', 'max:150'],
            'nama_pemilik' => ['required', 'string', 'max:255'],
            'tanggal_dokumen' => ['required', 'date'],
            'no_dokumen_kepemilikan' => ['required', 'string', 'max:150'],
            'asal_usul' => ['required', 'string', 'max:150'],
            'harga' => ['required', 'numeric', 'min:0'],
            'keterangan' => ['nullable', 'string', 'max:10000'],
            'pematokan' => ['required', 'boolean'],
            'progres_bpn' => ['required', 'string', 'max:150'],
            'permasalahan' => ['nullable', 'string', 'max:255'],
            'rincian_permasalahan' => ['nullable', 'string', 'max:10000'],
            'link_google_maps' => ['nullable', 'url', 'max:2000'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            $asset = $this->route('asset');
            $query = LandAsset::query()
                ->where('kode_barang', $this->input('kode_barang'))
                ->where('nomor_register', $this->input('register'));
            if ($asset instanceof LandAsset) {
                $query->where('id', '<>', $asset->id);
            }
            if ($query->exists()) {
                $validator->errors()->add('register', 'Kombinasi kode barang dan register sudah digunakan.');
            }
        });
    }
}
