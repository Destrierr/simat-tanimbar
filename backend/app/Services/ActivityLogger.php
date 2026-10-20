<?php

namespace App\Services;

use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ActivityLogger
{
    private const HIDDEN = ['password', 'password_confirmation', 'current_password', 'token'];

    public static function log(
        string $action,
        string $description,
        ?Request $request = null,
        ?string $subjectType = null,
        ?int $subjectId = null,
        array $properties = [],
        ?User $user = null,
    ): void {
        try {
            $request ??= request();

            ActivityLog::create([
                'user_id' => $user?->id ?? $request->user()?->id,
                'action' => $action,
                'subject_type' => $subjectType,
                'subject_id' => $subjectId,
                'description' => $description,
                'properties' => $properties ? array_diff_key($properties, array_flip(self::HIDDEN)) : null,
                'ip_address' => $request->ip(),
                'user_agent' => mb_substr((string) $request->userAgent(), 0, 500),
            ]);
        } catch (\Throwable $e) {
            Log::warning('Gagal mencatat log aktivitas: '.$e->getMessage());
        }
    }
}