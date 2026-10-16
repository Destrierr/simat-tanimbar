<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreKecamatanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->role === 'admin';
    }

    public function rules(): array
    {
        return [
            'nama' => ['required', 'string', 'max:100', Rule::unique('kecamatan', 'nama')],
            'deskripsi' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
