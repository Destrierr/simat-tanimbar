<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Support\ApiResponse;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

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
            throw new AuthenticationException('Kredensial tidak valid.');
        }

        $token = $user->createToken('asset-management')->plainTextToken;

        return ApiResponse::success(['user' => (new UserResource($user))->resolve($request), 'token' => $token], 'Login berhasil');
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()?->delete();

        return response()->noContent();
    }

    public function me(Request $request)
    {
        return ApiResponse::success((new UserResource($request->user()))->resolve($request));
    }
}
