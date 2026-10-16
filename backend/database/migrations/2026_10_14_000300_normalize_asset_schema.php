<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        foreach (['role', 'kecamatan', 'status_tanah', 'progres_bpn', 'jenis_dokumen'] as $tableName) {
            Schema::create($tableName, function (Blueprint $table) {
                $table->id();
                $table->string('nama', 100)->unique();
                $table->text('deskripsi')->nullable();
                $table->timestamps();
            });
        }
        foreach (['kecamatan', 'status_tanah'] as $tableName) {
            DB::table($tableName)->insertOrIgnore(['nama' => 'Belum ditentukan', 'created_at' => now(), 'updated_at' => now()]);
        }

        foreach (DB::table('users')->distinct()->pluck('role')->filter()->unique() as $role) {
            DB::table('role')->insert(['nama' => $role, 'created_at' => now(), 'updated_at' => now()]);
        }
        foreach ([
            'kecamatan' => 'kecamatan',
            'status_tanah' => 'status_tanah',
            'progres_bpn' => 'progres_bpn',
        ] as $source => $target) {
            foreach (DB::table('assets')->distinct()->pluck($source)->filter()->unique() as $name) {
                DB::table($target)->insert(['nama' => $name, 'created_at' => now(), 'updated_at' => now()]);
            }
        }
        foreach (DB::table('assets')->distinct()->pluck('jenis_dokumen_kepemilikan')->filter()->unique() as $name) {
            DB::table('jenis_dokumen')->insert(['nama' => $name, 'created_at' => now(), 'updated_at' => now()]);
        }
        foreach (DB::table('asset_documents')->distinct()->pluck('document_type')->filter()->unique() as $name) {
            DB::table('jenis_dokumen')->insertOrIgnore(['nama' => $name, 'created_at' => now(), 'updated_at' => now()]);
        }

        Schema::table('users', function (Blueprint $table) {
            $table->string('username', 50)->nullable()->after('id');
            $table->foreignId('role_id')->nullable()->after('password')->constrained('role');
            $table->renameColumn('is_active', 'status_aktif');
        });
        foreach (DB::table('users')->get() as $user) {
            DB::table('users')->where('id', $user->id)->update([
                'username' => $this->uniqueUsername($user->email, $user->id),
                'role_id' => DB::table('role')->where('nama', $user->role)->value('id'),
            ]);
        }
        Schema::table('users', function (Blueprint $table) {
            $table->string('username', 50)->nullable(false)->change();
            $table->string('name', 100)->change();
            $table->string('email', 100)->change();
            $table->unique('username');
            $table->dropColumn(['role', 'remember_token', 'email_verified_at']);
            $table->foreignId('role_id')->nullable(false)->change();
        });

        Schema::table('assets', function (Blueprint $table) {
            $table->foreignId('kecamatan_id')->nullable()->constrained('kecamatan');
            $table->foreignId('status_tanah_id')->nullable()->after('kecamatan_id')->constrained('status_tanah');
            $table->foreignId('progres_bpn_id')->nullable()->after('pematokan')->constrained('progres_bpn');
            $table->boolean('ada_permasalahan')->default(false)->after('progres_bpn_id');
            $table->boolean('pematokan_baru')->default(false);
            $table->renameColumn('register', 'nomor_register');
            $table->renameColumn('letak_alamat', 'alamat');
            $table->renameColumn('no_dokumen_kepemilikan', 'nomor_dokumen_kepemilikan');
        });
        foreach (DB::table('assets')->get() as $asset) {
            DB::table('assets')->where('id', $asset->id)->update([
                'kecamatan_id' => DB::table('kecamatan')->where('nama', $asset->kecamatan ?: 'Belum ditentukan')->value('id'),
                'status_tanah_id' => DB::table('status_tanah')->where('nama', $asset->status_tanah ?: 'Belum ditentukan')->value('id'),
                'progres_bpn_id' => DB::table('progres_bpn')->where('nama', $asset->progres_bpn)->value('id'),
                'ada_permasalahan' => filled($asset->permasalahan) && mb_strtolower(trim($asset->permasalahan)) !== 'tidak ada',
                'pematokan_baru' => in_array(mb_strtolower(trim((string) $asset->pematokan)), ['1', 'true', 'ya', 'sudah', 'sudah patok'], true),
            ]);
        }
        Schema::table('assets', function (Blueprint $table) {
            $table->dropIndex(['kecamatan']);
            $table->dropIndex(['status_tanah']);
            $table->dropIndex(['progres_bpn']);
            $table->dropIndex(['permasalahan']);
            $table->dropColumn(['kecamatan', 'status_tanah', 'jenis_dokumen_kepemilikan', 'permasalahan', 'created_by', 'updated_by', 'deleted_at', 'pematokan']);
            $table->renameColumn('pematokan_baru', 'pematokan');
            $table->string('nama_jenis_barang', 150)->change();
            $table->string('nama_pemilik', 150)->nullable()->change();
            $table->string('nomor_dokumen_kepemilikan', 100)->nullable()->change();
            $table->integer('tahun_pengadaan')->nullable()->change();
            $table->text('alamat')->nullable()->change();
            $table->decimal('luas', 15, 2)->change();
            $table->decimal('harga', 18, 2)->nullable()->change();
            $table->foreignId('kecamatan_id')->nullable(false)->change();
            $table->foreignId('status_tanah_id')->nullable(false)->change();
        });

        Schema::table('asset_documents', function (Blueprint $table) {
            $table->foreignId('jenis_dokumen_id')->nullable()->after('asset_id')->constrained('jenis_dokumen');
            $table->renameColumn('document_number', 'nomor_dokumen');
            $table->renameColumn('document_date', 'tanggal_dokumen');
            $table->renameColumn('file_name', 'nama_file');
            $table->renameColumn('file_path', 'lokasi_file');
            $table->renameColumn('description', 'keterangan');
            $table->renameColumn('uploaded_by', 'diunggah_oleh');
            $table->text('lokasi_file')->change();
            $table->string('nomor_dokumen', 100)->nullable()->change();
            $table->string('nama_file', 255)->change();
        });
        foreach (DB::table('asset_documents')->get() as $document) {
            $uploaderId = $document->uploaded_by ?? DB::table('users')->value('id');
            DB::table('asset_documents')->where('id', $document->id)->update([
                'jenis_dokumen_id' => DB::table('jenis_dokumen')->where('nama', $document->document_type)->value('id'),
                'diunggah_oleh' => $uploaderId,
            ]);
        }
        Schema::table('asset_documents', function (Blueprint $table) {
            $table->dropIndex(['asset_id', 'document_type']);
            $table->dropColumn(['document_type', 'mime_type', 'file_size', 'deleted_at']);
            $table->foreignId('jenis_dokumen_id')->nullable(false)->change();
            $table->foreignId('diunggah_oleh')->nullable(false)->change();
        });
        Schema::rename('asset_documents', 'dokumen_aset');
    }

    public function down(): void
    {
        throw new RuntimeException('This schema migration is intentionally irreversible because it removes legacy asset metadata fields.');
    }

    private function uniqueUsername(string $email, int $id): string
    {
        $base = mb_substr((string) strstr($email, '@', true), 0, 40);
        $username = $base !== '' ? $base : 'user';
        $candidate = $username;
        $suffix = 1;
        while (DB::table('users')->where('username', $candidate)->exists()) {
            $candidate = mb_substr($username, 0, 42).$id.'_'.$suffix++;
        }

        return $candidate;
    }
};
