<?php

namespace Database\Factories;

use App\Models\Document;
use App\Models\LandAsset;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Document> */
class DocumentFactory extends Factory
{
    protected $model = Document::class;

    public function definition(): array
    {
        return [
            'asset_id' => LandAsset::factory(),
            'document_type' => 'Sertipikat',
            'document_number' => fake()->numerify('DOC-#####'),
            'document_date' => fake()->date(),
            'file_name' => 'dokumen.pdf',
            'file_path' => 'asset-documents/dokumen.pdf',
            'description' => null,
            'uploaded_by' => User::factory(),
        ];
    }
}
