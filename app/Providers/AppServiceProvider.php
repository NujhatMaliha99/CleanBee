<?php

namespace App\Providers;

use App\Models\AreaReport;
use App\Models\PickupRequest;
use App\Observers\AreaReportObserver;
use App\Observers\PickupRequestObserver;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        PickupRequest::observe(PickupRequestObserver::class);
        AreaReport::observe(AreaReportObserver::class);
    }
}
