<?php

use App\Http\Middleware\EnsureActiveUser;
use App\Http\Middleware\EnsureUserHasRole;
use App\Support\ApiResponse;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->alias([
            'role' => EnsureUserHasRole::class,
            'active' => EnsureActiveUser::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson(),
        );
        $exceptions->render(function (ValidationException $exception, Request $request) {
            if ($request->is('api/*')) {
                return ApiResponse::error('Data yang dikirim tidak valid.', 422, $exception->errors());
            }
        });
        $exceptions->render(function (AuthenticationException $exception, Request $request) {
            if ($request->is('api/*')) {
                return ApiResponse::error('Autentikasi diperlukan.', 401);
            }
        });
        $exceptions->render(function (AuthorizationException $exception, Request $request) {
            if ($request->is('api/*')) {
                return ApiResponse::error('Anda tidak memiliki izin untuk melakukan tindakan ini.', 403);
            }
        });
        $exceptions->render(function (HttpExceptionInterface $exception, Request $request) {
            if (! $request->is('api/*')) {
                return null;
            }
            $status = $exception->getStatusCode();
            $message = match ($status) {
                404 => 'Data tidak ditemukan.', 429 => 'Terlalu banyak permintaan. Coba kembali sebentar lagi.', 400 => 'Permintaan tidak dapat diproses.', default => 'Terjadi kesalahan pada permintaan.'
            };

            return ApiResponse::error($message, $status);
        });
        $exceptions->render(function (Throwable $exception, Request $request) {
            if ($request->is('api/*')) {
                return ApiResponse::error('Terjadi kesalahan internal server.', 500);
            }
        });
    })->create();
