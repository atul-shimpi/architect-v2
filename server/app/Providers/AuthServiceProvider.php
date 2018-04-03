<?php

namespace App\Providers;

use App\User;
use Vebto\Billing\BillingPlan;
use App\BuilderPage;
use App\Policies\BillingPlanPolicy;
use App\Policies\BuilderPagePolicy;
use App\Policies\ProjectPolicy;
use App\Policies\SubscriptionPolicy;
use App\Project;
use Vebto\Billing\Subscription;
use Vebto\Policies\UserPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The policy mappings for the application.
     *
     * @var array
     */
    protected $policies = [
        'App\Model' => 'App\Policies\ModelPolicy',
        'Template' => 'App\Policies\TemplatePolicy',
        BuilderPage::class => BuilderPagePolicy::class,
        Project::class => ProjectPolicy::class,
        BillingPlan::class => BillingPlanPolicy::class,
        Subscription::class => SubscriptionPolicy::class,
        User::class => UserPolicy::class,
    ];

    /**
     * Register any authentication / authorization services.
     *
     * @return void
     */
    public function boot()
    {
        $this->registerPolicies();
    }
}
