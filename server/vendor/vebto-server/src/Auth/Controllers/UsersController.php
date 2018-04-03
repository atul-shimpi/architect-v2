<?php namespace Vebto\Auth\Controllers;

use Auth;
use App\User;
use Illuminate\Http\Request;
use Vebto\Auth\UserRepository;
use Vebto\Bootstrap\Controller;
use Vebto\Auth\Requests\ModifyUsers;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class UsersController extends Controller {

    /**
     * @var User
     */
    private $model;

    /**
     * @var UserRepository
     */
    private $userRepository;

    /**
     * @var Request
     */
    private $request;

    /**
     * UsersController constructor.
     *
     * @param User $user
     * @param UserRepository $userRepository
     * @param Request $request
     */
    public function __construct(User $user, UserRepository $userRepository, Request $request)
    {
        $this->model = $user;
        $this->request = $request;
        $this->userRepository = $userRepository;

        $this->middleware('auth', ['except' => ['show']]);
    }

    /**
     * Return a collection of all registered users.
     *
     * @return LengthAwarePaginator
     */
    public function index()
    {
        $this->authorize('index', User::class);

        return $this->userRepository->paginateUsers($this->request->all());
    }

    /**
     * Return user matching given id.
     *
     * @param integer $id
     * @return User
     */
    public function show($id)
    {
        $user = $this->model->with(['groups', 'social_profiles'])->findOrFail($id);

        $this->authorize('show', $user);

        return $this->success(['user' => $user]);
    }

    /**
     * Create a new user.
     *
     * @param ModifyUsers $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(ModifyUsers $request)
    {
        $this->authorize('store', User::class);

        $user = $this->userRepository->create($this->request->all());

        return $this->success(['user' => $user], 201);
    }

    /**
     * Update an existing user.
     *
     * @param integer $id
     * @param ModifyUsers $request
     *
     * @return User
     */
    public function update($id, ModifyUsers $request)
    {
        $user = $this->userRepository->findOrFail($id);

        $this->authorize('update', $user);

        $user = $this->userRepository->update($user, $this->request->all());

        return $this->success(['user' => $user]);
    }

    /**
     * Delete multiple users.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function deleteMultiple()
    {
        $this->authorize('destroy', User::class);

        $this->validate($this->request, [
            'ids' => 'required|array|min:1'
        ]);

        $this->userRepository->deleteMultiple($this->request->get('ids'));

        return $this->success([], 204);
    }
}
