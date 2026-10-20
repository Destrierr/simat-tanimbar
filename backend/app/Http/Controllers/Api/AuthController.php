<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Support\ApiResponse;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Services\ActivityLogger;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $data = $request->validate([
            'username' => ['required', 'string', 'max:50'],
            'password' => ['required', 'string', 'max:255'],
        ]);

        $user = User::where('username', strtolower($data['username']))->first();
        if (! $user || ! $user->is_active || ! Hash::check($data['password'], $user->password)) {
            
            ActivityLogger::log('login_failed', "Percobaan login gagal untuk username {$data['username']}", $request);
            
            throw new AuthenticationException('Kredensial tidak valid.');
        }

        $token = $user->createToken('asset-management')->plainTextToken;

        ActivityLogger::log('login', "{$user->name} login", $request, 'user', $user->id, user: $user);

        return ApiResponse::success(['user' => (new UserResource($user))->resolve($request), 'token' => $token], 'Login berhasil');
    }

    public function logout(Request $request)
    {
        ActivityLogger::log('logout', "{$request->user()->name} logout", $request, 'user', $request->user()->id);
        
        $request->user()->currentAccessToken()?->delete();

        return response()->noContent();
    }

    public function me(Request $request)
    {
        return ApiResponse::success((new UserResource($request->user()))->resolve($request));
    }

    public function refresh(Request $request)
    {
        $user = $request->user();
        $current = $user->currentAccessToken();

        $token = $user->createToken('asset-management')->plainTextToken;
        $current?->delete();

        return ApiResponse::success(
            ['user' => (new UserResource($user))->resolve($request), 'token' => $token],
            'Token diperbarui',
        );
    }
}
