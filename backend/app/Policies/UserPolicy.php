<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    public function viewAny(User $actor): bool
    {
        return $actor->is_active && $actor->role === 'admin';
    }

    public function view(User $actor, User $user): bool
    {
        return $actor->is_active && $actor->role === 'admin';
    }

    public function create(User $actor): bool
    {
        return $actor->is_active && $actor->role === 'admin';
    }

    public function update(User $actor, User $user): bool
    {
        return $actor->is_active && $actor->role === 'admin';
    }

    public function delete(User $actor, User $user): bool
    {
        return $actor->is_active && $actor->role === 'admin' && $actor->id !== $user->id;
    }
}
