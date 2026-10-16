<?php

namespace App\Services;

use App\Models\LandAsset;
use Illuminate\Support\Facades\DB;

class LandAssetService
{
    public function create(array $attributes): LandAsset
    {
        return DB::transaction(function () use ($attributes) {
            return LandAsset::create($attributes)->load('documents');
        });
    }

    public function update(LandAsset $asset, array $attributes): LandAsset
    {
        return DB::transaction(function () use ($asset, $attributes) {
            $asset->update($attributes);

            return $asset->fresh('documents');
        });
    }

    public function delete(LandAsset $asset): void
    {
        DB::transaction(fn () => $asset->delete());
    }
}
