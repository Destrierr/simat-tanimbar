<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('assets', function (Blueprint $table) {
            $table->id();
            $table->string('nama_jenis_barang');
            $table->string('kode_barang')->index();
            $table->string('register')->index();
            $table->decimal('luas', 16, 2);
            $table->unsignedSmallInteger('tahun_pengadaan')->nullable();
            $table->string('lokasi')->nullable();
            $table->text('letak_alamat')->nullable();
            $table->string('kecamatan')->nullable()->index();
            $table->string('status_tanah')->nullable()->index();
            $table->string('jenis_dokumen_kepemilikan')->nullable();
            $table->string('nama_pemilik')->nullable();
            $table->date('tanggal_dokumen')->nullable();
            $table->string('no_dokumen_kepemilikan')->nullable();
            $table->string('asal_usul')->nullable();
            $table->decimal('harga', 20, 2)->nullable();
            $table->text('keterangan')->nullable();
            $table->string('pematokan')->nullable();
            $table->string('progres_bpn')->nullable()->index();
            $table->string('permasalahan')->nullable()->index();
            $table->text('rincian_permasalahan')->nullable();
            $table->text('link_google_maps')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();
            $table->unique(['kode_barang', 'register']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('assets');
    }
};
