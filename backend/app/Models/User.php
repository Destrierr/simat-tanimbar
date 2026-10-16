<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\DB;
use Laravel\Sanctum\HasApiTokens;

#[Fillable(['username', 'name', 'email', 'password', 'role', 'role_id', 'is_active', 'status_aktif'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected static function booted(): void
    {
        static::creating(function (self $user) {
            if (blank($user->username)) {
                $base = mb_substr((string) strstr($user->email, '@', true), 0, 40);
                $username = $base !== '' ? $base : 'user';
                $candidate = $username;
                $suffix = 1;
                while (static::where('username', $candidate)->exists()) {
                    $candidate = mb_substr($username, 0, 42).'_'.$suffix++;
                }
                $user->username = $candidate;
            }
        });
    }

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'status_aktif' => 'boolean',
        ];
    }

    public function getRoleAttribute(): ?string
    {
        return DB::table('role')->where('id', $this->role_id)->value('nama');
    }

    public function setRoleAttribute(?string $role): void
    {
        if ($role === null) {
            $this->attributes['role_id'] = null;

            return;
        }

        $lookup = DB::table('role')->where('nama', $role)->first();
        $this->attributes['role_id'] = $lookup?->id ?? DB::table('role')->insertGetId([
            'nama' => $role,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function getIsActiveAttribute(): bool
    {
        return (bool) $this->status_aktif;
    }

    public function setIsActiveAttribute(bool $active): void
    {
        $this->attributes['status_aktif'] = $active;
    }
}
