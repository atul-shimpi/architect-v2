<?php namespace App\Http\Controllers;

use Auth;
use App\User;
use Cache;
use Artisan;
use Exception;
use Vebto\Settings\Setting;
use Vebto\Settings\DotEnvEditor;
use Vebto\Bootstrap\Controller;

class UpdateController extends Controller {
    /**
     * @var DotEnvEditor
     */
    private $dotEnvEditor;

    /**
     * @var Setting
     */
    private $setting;

    /**
     * @var User
     */
    private $user;

    /**
     * UpdateController constructor.
     *
     * @param DotEnvEditor $dotEnvEditor
     * @param Setting $setting
     * @param User $user
     */
	public function __construct(DotEnvEditor $dotEnvEditor, Setting $setting, User $user)
	{
        $this->user = $user;
        $this->setting = $setting;
        $this->dotEnvEditor = $dotEnvEditor;
    }

    /**
     * Show update view.
     *
     * @return \Illuminate\Contracts\View\Factory|\Illuminate\View\View
     */
    public function show()
    {
        if ( ! $this->canAccessUpdatePage()) {
            return redirect('/login');
        }

        return view('update');
    }

    /**
     * Perform the update.
     *
     * @return \Illuminate\Http\RedirectResponse
     */
    public function update()
	{
        if ( ! $this->canAccessUpdatePage()) {
            return redirect('/login');
        }

	    //fix "index is too long" issue on MariaDB and older mysql versions
        \Schema::defaultStringLength(191);

        Artisan::call('migrate', ['--force' => 'true']);
        Artisan::call('db:seed', ['--force' => 'true']);
        Artisan::call('vebto:seed');

        //migrate versions prior to 2.0
        if (version_compare(config('vebto.site.version'), '2.0.0', '<=')) {
            $this->user->where('permissions', '{"superuser":1}')->update(['permissions' => '{"superuser":1, "admin": 1}']);
            Artisan::call('legacy:projects');
        }

        //update version number
        $version = $this->getAppVersion();
        $this->dotEnvEditor->write(['app_version' => $version]);

        Cache::flush();

        return redirect()->back()->with('status', 'Updated the site successfully.');
	}


    /**
     * Get new app version.
     *
     * @return string
     */
    private function getAppVersion()
    {
        try {
            return $this->dotEnvEditor->load(base_path('.env.example'))['app_version'];
        } catch (Exception $e) {
            return '2.0.4';
        }
    }

    /**
     * Check if currently logged in user can access update page.
     *
     * @return bool
     */
    private function canAccessUpdatePage()
    {
        if (config('vebto.site.disable_update_auth')) return true;

        return Auth::check() && Auth::user()->hasPermission('admin');
    }
}