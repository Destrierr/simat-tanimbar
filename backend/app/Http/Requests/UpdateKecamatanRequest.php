<?php

namespace App\Http\Requests;

use App\Models\Kecamatan;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateKecamatanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->role === 'admin';
    }

    public function rules(): array
    {
        $kecamatan = $this->route('kecamatan');
        $id = $kecamatan instanceof Kecamatan ? $kecamatan->id : null;

        return [
            'nama' => ['sometimes', 'required', 'string', 'max:100', Rule::unique('kecamatan', 'nama')->ignore($id)],
            'deskripsi' => ['sometimes', 'nullable', 'string', 'max:1000'],
        ];
    }
}
