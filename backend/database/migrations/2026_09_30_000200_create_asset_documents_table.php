<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('asset_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('asset_id')->constrained('assets')->cascadeOnDelete();
            $table->string('document_type');
            $table->string('document_number')->nullable();
            $table->date('document_date')->nullable();
            $table->string('file_name');
            $table->string('file_path');
            $table->string('mime_type', 120);
            $table->unsignedBigInteger('file_size');
            $table->text('description')->nullable();
            $table->foreignId('uploaded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();
            $table->index(['asset_id', 'document_type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('asset_documents');
    }
};
