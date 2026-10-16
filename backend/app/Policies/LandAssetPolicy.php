<?php

namespace App\Policies;

use App\Models\LandAsset;
use App\Models\User;

class LandAssetPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->is_active;
    }

    public function view(User $user, LandAsset $asset): bool
    {
        return $user->is_active;
    }

    public function create(User $user): bool
    {
        return $user->is_active && in_array($user->role, ['admin', 'operator'], true);
    }

    public function update(User $user, LandAsset $asset): bool
    {
        return $user->is_active && in_array($user->role, ['admin', 'operator'], true);
    }

    public function delete(User $user, LandAsset $asset): bool
    {
        return $user->is_active && $user->role === 'admin';
    }

    public function export(User $user): bool
    {
        return $user->is_active && in_array($user->role, ['admin', 'operator'], true);
    }
}
