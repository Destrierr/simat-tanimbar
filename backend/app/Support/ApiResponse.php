<?php

namespace App\Support;

use Illuminate\Http\JsonResponse;

final class ApiResponse
{
    public static function success(mixed $data = null, string $message = 'Berhasil', int $status = 200, array $meta = []): JsonResponse
    {
        $response = ['success' => true, 'message' => $message, 'data' => $data];
        if ($meta !== []) {
            $response['meta'] = $meta;
        }

        return response()->json($response, $status);
    }

    public static function error(string $message, int $status, array $errors = []): JsonResponse
    {
        return response()->json(['success' => false, 'message' => $message, 'errors' => (object) $errors], $status);
    }
}
