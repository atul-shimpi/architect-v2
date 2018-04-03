<?php namespace App\Http\Controllers;

use App\Project;
use App\Services\TemplateLoader;
use Cache;
use Vebto\Auth\User;
use Carbon\Carbon;
use Vebto\Pages\Page;
use Vebto\Bootstrap\Controller;

class AnalyticsController extends Controller
{

    /**
     * @var User
     */
    private $user;

    /**
     * @var Page
     */
    private $page;

    /**
     * @var Project
     */
    private $project;

    /**
     * @var TemplateLoader
     */
    private $templateLoader;

    /**
     * AnalyticsController Constructor.
     *
     * @param Page $page
     * @param Project $project
     * @param User $user
     * @param TemplateLoader $templateLoader
     */
    public function __construct(Page $page, Project $project, User $user, TemplateLoader $templateLoader)
    {
        $this->user = $user;
        $this->page = $page;
        $this->project = $project;
        $this->templateLoader = $templateLoader;
    }

    /**
     * Get stats for analytics page.
     *
     * @return array
     * @throws \Illuminate\Auth\Access\AuthorizationException
     */
    public function stats()
    {
        $this->authorize('index', 'ReportPolicy');

        return Cache::remember('analytics.stats', Carbon::now()->addDay(), function () {
            return [
                'pages' => number_format($this->page->count()),
                'projects' => number_format($this->project->count()),
                'templates' => number_format($this->templateLoader->loadAll()->count()),
                'users' => number_format($this->user->count()),
            ];
        });
    }
}
