<?php

namespace App\Providers;

use Barryvdh\LaravelIdeHelper\IdeHelperServiceProvider;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot()
    {
        \Schema::defaultStringLength(191);
    }

    /**
     * Register any application services.
     *
     * @return void
     */
    public function register()
    {
        //register dev service providers
        if ($this->app->environment() !== 'production') {
            try {
                $this->app->register(IdeHelperServiceProvider::class);
                $this->app->register(\Barryvdh\Debugbar\ServiceProvider::class);
            } catch (\Exception $e) {
                //
            }
        }
    }
}
