<?php namespace App\Http\Controllers;

use App\Project;
use App\Services\ProjectRepository;
use Illuminate\Http\Request;
use Storage;
use Vebto\Bootstrap\Controller;
use League\Flysystem\Filesystem;
use League\Flysystem\Adapter\Ftp as Adapter;
use League\Flysystem\MountManager;

class PublishProjectController extends Controller
{
    /**
     * Request instance.
     *
     * @var Request
     */
    private $request;

    /**
     * @var Project
     */
    private $project;

    /**
     * @var ProjectRepository
     */
    private $repository;

    /**
     * Create new PublishProjectController instance.
     *
     * @param Request $request
     * @param Project $project
     * @param ProjectRepository $repository
     */
    public function __construct(Request $request, Project $project, ProjectRepository $repository)
    {
        $this->request = $request;
        $this->project = $project;
        $this->repository = $repository;
    }

    /**
     * Find a project by id.
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     * @throws \Illuminate\Auth\Access\AuthorizationException
     */
    public function publish($id)
    {
        $project = $this->project->findOrFail($id);

        $this->authorize('publish', $project);

        $this->validate($this->request, [
            'host' => 'required|string|min:1',
            'username' => 'required|string|min:1',
            'password' => 'required|string|min:1',
            'port' => 'integer|min:1',
            'root' => 'string|min:1',
            'ssl' => 'required|boolean',
        ]);

        try {
            $this->publishToFtp($project);
        } catch (\Exception $e) {
            return $this->error(['general' => $e->getMessage()]);
        }

        return $this->success();
    }

    /**
     * Publish specified project to FTP using flysystem.
     *
     * @param Project $project
     */
    public function publishToFtp(Project $project)
    {
        $directory = $this->request->get('directory', '/');

        $ftp = new Filesystem(new Adapter([
            'host' => $this->request->get('host'),
            'username' => $this->request->get('username'),
            'password' => $this->request->get('password'),
            'port' => $this->request->get('port', $this->getDefaultPort()),
            'passive' => true,
            'ssl' => $this->request->get('ssl', false),
            'timeout' => 30,
        ]));

        $manager = new MountManager([
            'ftp' => $ftp,
            'local' => Storage::disk('public')->getDriver(),
        ]);

        if ( ! $ftp->has($directory)) {
            $ftp->createDir($directory);
        }

        $projectRoot = $this->repository->getProjectPath($project);
        foreach ($manager->listContents("local://$projectRoot", true) as $file) {
            if ($file['type'] !== 'file') continue;
            $filePath = str_replace($projectRoot, $directory, $file['path']);

            //delete old files from ftp
            if ($ftp->has($filePath)) $ftp->delete($filePath);

            //copy file from local disk to ftp
            $manager->copy('local://'.$file['path'], 'ftp://'.$filePath);
        }
    }

    /**
     * Get default port for ftp.
     *
     * @return int
     */
    private function getDefaultPort() {
        return $this->request->get('ssl') ? 22 : 21;
    }
}
