<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    private const NAMES = [
        'Tanimbar Selatan',
        'Wertamrian',
        'Wermaktian',
        'Selaru',
        'Tanimbar Utara',
        'Fordata',
        'Wuarlabobar',
        'Nirunmas',
        'Kormomolin',
        'Molu Maru',
    ];

    public function up(): void
    {
        $now = now();
        $rows = array_map(fn (string $name) => [
            'nama' => $name,
            'deskripsi' => null,
            'created_at' => $now,
            'updated_at' => $now,
        ], self::NAMES);

        DB::table('kecamatan')->insertOrIgnore($rows);
    }

    public function down(): void {}
};
