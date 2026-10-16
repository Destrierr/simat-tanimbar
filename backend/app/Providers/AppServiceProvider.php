<?php

namespace App\Providers;

use App\Models\Document;
use App\Models\LandAsset;
use App\Models\User;
use App\Policies\DocumentPolicy;
use App\Policies\LandAssetPolicy;
use App\Policies\UserPolicy;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void {}

    public function boot(): void
    {
        Gate::policy(LandAsset::class, LandAssetPolicy::class);
        Gate::policy(Document::class, DocumentPolicy::class);
        Gate::policy(User::class, UserPolicy::class);
    }
}
