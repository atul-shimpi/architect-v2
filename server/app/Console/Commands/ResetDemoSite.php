<?php namespace App\Console\Commands;

use App\Project;
use App\Services\ProjectRepository;
use Carbon\Carbon;
use Hash;
use Artisan;
use App\User;
use Illuminate\Console\Command;
use Illuminate\Filesystem\Filesystem;
use Illuminate\Support\Collection;
use Vebto\Localizations\Localization;

class ResetDemoSite extends Command {

	/**
	 * The name and signature of the console command.
	 *
	 * @var string
	 */
	protected $signature = 'demo:reset';

	/**
	 * The console command description.
	 *
	 * @var string
	 */
	protected $description = 'Reset demo site.';

    /**
     * @var User
     */
    private $user;
    /**
     * @var Localization
     */
    private $localization;

    /**
     * @var ProjectRepository
     */
    private $projectRepository;

    /**
     * @var Project
     */
    private $project;

    /**
     * @var Filesystem
     */
    private $filesystem;

    /**
     * ResetDemoAdminAccount constructor.
     *
     * @param User $user
     * @param Localization $localization
     * @param ProjectRepository $projectRepository
     * @param Project $project
     * @param Filesystem $filesystem
     */
    public function __construct(User $user, Localization $localization, ProjectRepository $projectRepository, Project $project, Filesystem $filesystem)
	{
        parent::__construct();

	    $this->user = $user;
        $this->localization = $localization;
        $this->projectRepository = $projectRepository;
        $this->project = $project;
        $this->filesystem = $filesystem;
    }

    /**
     * Execute the console command.
     *
     * @throws \Exception
     * @return void
     */
	public function handle()
	{
        if ( ! config('vebto.site.demo')) return;

	    /** @var User $admin */
	    $admin = $this->user->where('email', 'admin@admin.com')->firstOrFail();

        $admin->avatar = null;
        $admin->password = Hash::make('admin');
        $admin->permissions = ['admin' => 1, 'superAdmin' => 1];
        $admin->save();

        //delete projects
        $this->project->orderBy('id')->chunk(50, function(Collection $projects)  {
            $projects->each(function(Project $project) {
                $this->projectRepository->delete($project);
            });
        });

        //create some demo projects
        $demoProjectsPath = file_exists(base_path('../../demo-projects')) ? base_path('../../demo-projects') : base_path('../demo-projects');
        $projectsPath = public_path("storage/projects/{$admin->id}");

        foreach ($this->filesystem->directories($demoProjectsPath) as $key => $demoProjectPath) {
            $templateName = basename($demoProjectPath);
            $config = json_decode($this->filesystem->get("$demoProjectPath/config.json"), true);
            preg_match("/projects\/[0-9]\/(.+?)\/css/", $this->filesystem->get("$demoProjectPath/index.html"), $matches);

            $project = $admin->projects()->create([
                'name' => 'Demo '.(8 - $key),
                'uuid' => $matches[1],
                'theme' => $config['theme'],
                'template' => $templateName,
                'framework' => 'bootstrap-3',
                'updated_at' => Carbon::now()->addMinute($key),
            ]);

            $this->filesystem->copyDirectory($demoProjectPath, "$projectsPath/$templateName");
            $this->filesystem->moveDirectory("$projectsPath/$templateName", "$projectsPath/{$project->uuid}");

            foreach ($this->filesystem->allFiles("$projectsPath/{$project->uuid}") as $fileInfo) {
                if ( ! in_array($fileInfo->getExtension(), ['html', 'css', 'js'])) continue;

                $content = $this->filesystem->get($fileInfo->getRealPath());
                $content = str_replace('http://localhost:4200', config('app.url'), $content);
                $content = str_replace('http://', 'https://', $content);
                $this->filesystem->put($fileInfo->getRealPath(), $content);
            }
        }


        //delete localizations
        $this->localization->get()->each(function(Localization $localization) {
            if (strtolower($localization->name) !== 'english') {
                $localization->delete();
            }
        });

        Artisan::call('cache:clear');

        $this->info('Demo site reset.');
	}
}
