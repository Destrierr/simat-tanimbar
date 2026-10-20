<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Support\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use App\Services\ActivityLogger;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', User::class);
        $query = User::query();
        if ($search = trim((string) $request->query('search'))) {
            $query->where(fn ($q) => $q
                ->where('name', 'ilike', "%{$search}%")
                ->orWhere('username', 'ilike', "%{$search}%")
                ->orWhere('email', 'ilike', "%{$search}%"));
        }
        if ($request->filled('role')) {
            $query->whereIn('role_id', DB::table('role')->select('id')->where('nama', $request->query('role')));
        }
        if ($request->filled('is_active')) {
            $query->where('status_aktif', filter_var($request->query('is_active'), FILTER_VALIDATE_BOOLEAN));
        }
        $page = $query->latest('id')->paginate(min(max($request->integer('per_page', 10), 1), 100));
        $roleCounts = DB::table('users')
            ->join('role', 'users.role_id', '=', 'role.id')
            ->selectRaw('role.nama as role, COUNT(*) as count')
            ->groupBy('role.nama')
            ->pluck('count', 'role');
        $latestUsers = User::query()
            ->latest('id')
            ->limit(5)
            ->get()
            ->map(fn (User $user) => (new UserResource($user))->resolve($request));

        return ApiResponse::success(
            UserResource::collection($page->items())->resolve($request),
            'Daftar pengguna berhasil dimuat',
            200,
            [
                'current_page' => $page->currentPage(),
                'per_page' => $page->perPage(),
                'total' => $page->total(),
                'last_page' => $page->lastPage(),
                'role_counts' => $roleCounts,
                'latest_users' => $latestUsers,
            ],
        );
    }

    public function store(StoreUserRequest $request)
    {
        $this->authorize('create', User::class);
        $data = $request->validated();
        $data['password'] = Hash::make($data['password']);
        $user = User::create($data);

        ActivityLogger::log('create', "Menambah pengguna {$user->name}", $request, 'user', $user->id);

        return ApiResponse::success((new UserResource($user))->resolve($request), 'Pengguna berhasil dibuat', 201);
    }

    public function show(Request $request, User $user)
    {
        $this->authorize('view', $user);

        return ApiResponse::success((new UserResource($user))->resolve($request));
    }

    public function update(UpdateUserRequest $request, User $user)
    {
        $this->authorize('update', $user);
        $data = $request->validated();
        if (array_key_exists('password', $data)) {
            $data['password'] = Hash::make($data['password']);
        }
        $user->update($data);

        $keys = array_keys($request->validated());
        if ($keys === ['is_active']) {
            $state = $request->boolean('is_active') ? 'mengaktifkan' : 'menonaktifkan';
            ActivityLogger::log('status', "Berhasil {$state} akun {$user->name}", $request, 'user', $user->id);
        } else {
            ActivityLogger::log('update', "Mengubah pengguna {$user->name}", $request, 'user', $user->id, [
                'changed_fields' => $keys,
            ]);
        }


        return ApiResponse::success((new UserResource($user->fresh()))->resolve($request), 'Pengguna berhasil diperbarui');
    }

    public function destroy(Request $request, User $user)
    {
        $this->authorize('delete', $user);
        if ($request->user()->is($user)) {
            return ApiResponse::error('Akun yang sedang digunakan tidak dapat dihapus.', 422);
        }
        if ($user->role === 'admin' && $user->is_active && User::whereIn('role_id', DB::table('role')->select('id')->where('nama', 'admin'))->where('status_aktif', true)->count() <= 1) {
            return ApiResponse::error('Sistem harus memiliki sedikitnya satu admin aktif.', 422);
        }

        ActivityLogger::log('delete', "Menghapus pengguna {$user->name}", $request, 'user', $user->id);

        $user->delete();

        return response()->noContent();
    }

    public function resetPassword(Request $request, User $user)
    {
        $this->authorize('update', $user);

        $data = $request->validate([
            // kosongkan untuk membuat password sementara otomatis
            'password' => ['nullable', 'string', 'min:8', 'confirmed'],
        ]);

        $generated = empty($data['password']);
        $newPassword = $generated ? Str::password(12, symbols: false) : $data['password'];

        $user->update(['password' => Hash::make($newPassword)]);

        // logout semua perangkat user tersebut, kecuali sesi admin yang sedang dipakai
        $currentId = $request->user()->is($user) ? $request->user()->currentAccessToken()?->id : null;
        $user->tokens()->when($currentId, fn ($q) => $q->where('id', '!=', $currentId))->delete();

        // LOG
        ActivityLogger::log('reset_password', "Mereset password {$user->name}", $request, 'user', $user->id);

        return ApiResponse::success(
            $generated ? ['temporary_password' => $newPassword] : [],
            "Password {$user->name} berhasil direset",
        );
    }
}
