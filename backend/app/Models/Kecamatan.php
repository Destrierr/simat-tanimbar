<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['nama', 'deskripsi'])]
class Kecamatan extends Model
{
    use HasFactory;

    protected $table = 'kecamatan';

    public function assets(): HasMany
    {
        return $this->hasMany(LandAsset::class, 'kecamatan_id');
    }
}
