<?php

namespace App\Exports;

use App\Models\Document;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;

class DocumentsExport implements FromCollection, WithHeadings
{
    public function __construct(private readonly array $filters = []) {}

    public function collection(): Collection
    {
        return Document::with('asset')
            ->when($this->filters['document_type'] ?? null, fn ($q, $v) => $q->whereIn('jenis_dokumen_id', DB::table('jenis_dokumen')->select('id')->where('nama', $v)))
            ->when($this->filters['search'] ?? null, fn ($q, $v) => $q->where(fn ($x) => $x->where('nomor_dokumen', 'ilike', "%{$v}%")->orWhere('nama_file', 'ilike', "%{$v}%")))
            ->get()->map(fn ($d) => [$d->asset?->register, $d->asset?->nama_jenis_barang, $d->document_type, $d->document_number, $d->document_date?->format('Y-m-d'), $d->file_name]);
    }

    public function headings(): array
    {
        return ['Register', 'Nama/Jenis Barang', 'Jenis Dokumen', 'Nomor Dokumen', 'Tanggal Dokumen', 'Nama File'];
    }
}
