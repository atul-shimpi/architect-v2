<?php namespace Vebto\Files;

use Illuminate\Http\Request;
use Vebto\Bootstrap\Controller;
use Illuminate\Support\Collection;

class PublicUploadsController extends Controller {

    /**
     * @var Request
     */
    private $request;

    /**
     * @var FileStorage
     */
    private $fileStorage;

    /**
     * @var Uploads
     */
    private $uploads;

    /**
     * UploadsController constructor.
     *
     * @param Request $request
     * @param FileStorage $fileStorage
     * @param Uploads $uploads
     */
    public function __construct(Request $request, FileStorage $fileStorage, Uploads $uploads)
    {
        $this->request = $request;
        $this->uploads = $uploads;
        $this->fileStorage = $fileStorage;
    }

    /**
     * Store video or music files without attaching them to any database records.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function videos()
    {
        $this->authorize('store', Upload::class);

        $this->validate($this->request, [
            'type'    => 'required|string|in:track',
            'files'   => 'required|array|min:1|max:5',
            'files.*' => 'required|file|mimeTypes:audio/mpeg,video/mp4,application/mp4'
        ]);

        $type = $this->request->get('type');

        $urls = array_map(function($file) use($type) {
            $config = ['disk' => 'public', 'path' => "{$type}_files"];
            return ['url' => $this->uploads->storePublic($file, $config)];
        }, $this->request->all()['files']);

        return response(['data' => $urls], 201);
    }

    /**
     * Store images on public disk.
     *
     * @return \Illuminate\Contracts\Routing\ResponseFactory|\Symfony\Component\HttpFoundation\Response
     * @throws \Illuminate\Auth\Access\AuthorizationException
     */
    public function images() {

        $this->authorize('store', Upload::class);

        $this->validate($this->request, [
            'type'    => 'required_without:path|string|min:1',
            'path'    => 'required_without:type|string|min:1',
            'files'   => 'required|array|min:1|max:5',
            'files.*' => 'required|file|image'
        ]);

        $type = $this->request->get('type');
        $path = $this->request->has('path') ? $this->request->get('path') : "{$type}_images";

        $config = ['disk' => 'public', 'path' => $path];
        $uploads = $this->uploads->storePublic($this->request->all()['files'], $config);

        return response(['data' => $uploads], 201);
    }
}
