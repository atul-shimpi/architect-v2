<?php namespace Vebto\Database;

use Cache;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Arr;

class Paginator
{
    /**
     * @var Builder
     */
    private $query;

    /**
     * @var Model
     */
    private $model;

    /**
     * @var string
     */
    private $defaultOrderColumn = 'updated_at';

    /**
     * @var string
     */
    private $defaultOrderDirection = 'desc';

    /**
     * Search callback provided by caller.
     *
     * @var callable
     */
    private $searchCallback;

    /**
     * Paginator constructor.
     *
     * @param Model $model
     */
    public function __construct(Model $model)
    {
        $this->model = $model;
        $this->query = $model->newQuery();
    }

    /**
     * Paginate given model.
     *
     * @param array $params
     *
     * @return LengthAwarePaginator
     */
    public function paginate($params)
    {
        $with = array_filter(explode(',', Arr::get($params, 'with', '')));
        $searchTerm = Arr::get($params, 'query');
        $order = $this->getOrder($params);
        $perPage = Arr::get($params, 'per_page', 15);
        $page = Arr::get($params, 'page', 1);

        //lazy load
        if ( ! empty($with)) $this->query->with($with);

        //search
        if ($searchTerm) $this->query->where('name', 'LIKE', "$searchTerm%");

        //order
        $this->query->orderBy($order['col'], $order['dir']);

        //paginate
        return new LengthAwarePaginator(
            $this->query->skip(($page - 1) * $perPage)->take($perPage)->get(),
            $this->getTotalCount(),
            $perPage,
            $page
        );
    }

    /**
     * @return Builder
     */
    public function query() {
        return $this->query;
    }

    /**
     * Load specified relation counts with paginator items.
     *
     * @param mixed $relations
     * @return $this
     */
    public function withCount($relations)
    {
        $this->query->withCount($relations);
        return $this;
    }

    /**
     * Load specified relations of paginated items.
     *
     * @param mixed $relations
     * @return $this
     */
    public function with($relations)
    {
        $this->query->with($relations);
        return $this;
    }

    /**
     * Set default order column and direction for paginator.
     *
     * @param $column
     * @param string $direction
     * @return $this
     */
    public function orderBy($column, $direction = 'desc')
    {
        $this->defaultOrderColumn = $column;
        $this->defaultOrderDirection = $direction;
        return $this;
    }

    public function getTotalCount()
    {
        $key = "pagination.{$this->model->getTable()}_count";

        return Cache::remember($key, Carbon::now()->addDay(), function () {
            return $this->model->count();
        });
    }

    /**
     * Extract order for paginator query from specified params.
     *
     * @param $params
     * @return array
     */
    private function getOrder($params) {
        //order provided as single string: "column|direction"
        if (Arr::has($params, 'order')) {
            list($orderCol, $orderDir) = explode('|', $params['order']);
        } else {
            $orderCol = Arr::get($params, 'order_by', $this->defaultOrderColumn);
            $orderDir = Arr::get($params, 'order_dir', $this->defaultOrderDirection);
        }

        return ['dir' => $orderDir, 'col' => $orderCol];
    }
}
