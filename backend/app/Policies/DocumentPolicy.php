<?php

namespace App\Policies;

use App\Models\Document;
use App\Models\User;

class DocumentPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->is_active;
    }

    public function view(User $user, Document $document): bool
    {
        return $user->is_active;
    }

    public function create(User $user): bool
    {
        return $user->is_active && in_array($user->role, ['admin', 'operator'], true);
    }

    public function delete(User $user, Document $document): bool
    {
        return $user->is_active && $user->role === 'admin';
    }
}
