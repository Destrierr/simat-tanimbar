<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Support\ApiResponse;
use Illuminate\Http\Request;

class ActivityLogController extends Controller
{
    public function index(Request $request)
    {
        $query = ActivityLog::query()->with('user:id,name,username');

        if ($search = trim((string) $request->query('search'))) {
            $query->where(fn ($q) => $q
                ->where('description', 'ilike', "%{$search}%")
                ->orWhere('ip_address', 'ilike', "%{$search}%")
                ->orWhereHas('user', fn ($u) => $u
                    ->where('name', 'ilike', "%{$search}%")
                    ->orWhere('username', 'ilike', "%{$search}%")));
        }
        if ($request->filled('action')) {
            $query->where('action', $request->query('action'));
        }
        if ($request->filled('subject_type')) {
            $query->where('subject_type', $request->query('subject_type'));
        }
        if ($request->filled('user_id')) {
            $query->where('user_id', $request->integer('user_id'));
        }
        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->query('date_from'));
        }
        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->query('date_to'));
        }

        $page = $query->latest('id')->paginate(min(max($request->integer('per_page', 10), 1), 100));

        $items = collect($page->items())->map(fn (ActivityLog $log) => [
            'id' => $log->id,
            'action' => $log->action,
            'subject_type' => $log->subject_type,
            'subject_id' => $log->subject_id,
            'description' => $log->description,
            'properties' => $log->properties,
            'ip_address' => $log->ip_address,
            'user_agent' => $log->user_agent,
            'user' => $log->user ? [
                'id' => $log->user->id,
                'name' => $log->user->name,
                'username' => $log->user->username,
            ] : null,
            'created_at' => $log->created_at?->toIso8601String(),
        ])->values();

        return ApiResponse::success($items, 'Log aktivitas berhasil dimuat', 200, [
            'current_page' => $page->currentPage(),
            'per_page' => $page->perPage(),
            'total' => $page->total(),
            'last_page' => $page->lastPage(),
            'filter_options' => [
                'action' => ActivityLog::query()->distinct()->orderBy('action')->pluck('action'),
                'subject_type' => ActivityLog::query()->whereNotNull('subject_type')
                    ->distinct()->orderBy('subject_type')->pluck('subject_type'),
            ],
        ]);
    }
}