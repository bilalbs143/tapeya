# API Documentation

## Base URL

- Development: `http://localhost:8000/api`
- Production: `https://api.tapeya.com/api`

## Authentication

The API uses Laravel Sanctum (token auth).

### Endpoints

- `POST /api/register` – Register
- `POST /api/login` – Login (returns token)
- `POST /api/logout` – Logout (authenticated)
- `GET /api/user` – Current user (authenticated)

---

## Response Format

Every response includes **`type`** so the frontend can branch on a stable string instead of (or in addition to) HTTP status.

**Success** (from `response()->success($data, $message, $type)`):

```json
{
  "success": true,
  "type": "SUCCESS",
  "message": "Optional message",
  "data": {}
}
```

For created resources use type `CREATED`:

```json
{
  "success": true,
  "type": "CREATED",
  "message": "Post created.",
  "data": { "id": 1, "title": "..." }
}
```

**Error** (from `response()->failure($message, $type, $errors)`):

```json
{
  "success": false,
  "type": "FORBIDDEN",
  "message": "Forbidden.",
  "errors": {}
}
```

**404** uses native format: HTTP status **404** with body `{ "success": false, "message": "Not found." }` (no `type`). Thrown by `response()->notFound()` or Laravel’s default for missing routes/models.

Macros: `success`, `failure`, `forbidden`, `notFound`, `unauth`.

### Response types

| Type               | When used                    |
|--------------------|------------------------------|
| `SUCCESS`          | Generic success (default)    |
| `CREATED`          | Resource created             |
| `BAD_REQUEST`      | Client error (default)       |
| `UNAUTHORIZED`     | Not authenticated            |
| `FORBIDDEN`        | Not allowed                  |
| `VALIDATION_ERROR` | Validation failed (422 → 200)|
| `SERVER_ERROR`     | Server error (500 only)      |

## Status Codes

Most responses use **HTTP 200** with body `type`; 404 uses native format.

| HTTP status | When |
|-------------|------|
| **200**     | Success, created, bad request, forbidden, validation error (body `type`). |
| **401**     | Unauthorized (`type: "UNAUTHORIZED"`). |
| **404**     | Not found (native: `success`, `message` only). |
| **500**     | Server error (`type: "SERVER_ERROR"`). |

**Frontend:** Prefer handling by `response.body.type` (and `response.body.success`) for UI logic; use 401 for re-auth and 500 for “something went wrong” if needed.

**Standard vs this approach:** Using 200 + `type` for most cases keeps frontend handling in one place (always read `body.success` and `body.type`) and avoids issues with proxies or clients that treat non-2xx as “hard” errors. The downside is you lose HTTP semantics for caching and tooling. If you prefer standard REST, you can keep status codes (200, 201, 400, 401, 403, 404, 422, 500) and still send `type` in the body for richer frontend handling.

---

## Development Patterns (Best Practice)

The API is structured for **minimal, clean, efficient** code using base query, base filter, and model enums (aligned with the main Laravel project).

### 1. Base model and query builder

- **Base model:** Extend `App\Models\BaseModel` for any non-auth model.
- **Filters & sorts:** Implement `getFilters()` and `getSorts()` on the model. These drive Spatie Query Builder for list endpoints.

**Example model** (e.g. `App\Models\Post`):

```php
use App\Enums\Common\StatusEnum;
use App\Models\BaseModel;
use Spatie\QueryBuilder\AllowedFilter;

class Post extends BaseModel
{
    protected $fillable = ['title', 'body', 'is_active'];
    protected $casts = ['is_active' => 'boolean'];

    public static function getFilters(): array
    {
        return [
            'title',
            AllowedFilter::exact('is_active'),
        ];
    }

    public static function getSorts(): array
    {
        return ['id', 'title', 'created_at', 'updated_at'];
    }
}
```

- Use **FilterTrait** scopes where useful: `scopeActive()`, `scopeToday()`, `scopeCreatedBetween()`, etc. (see `App\Utils\Traits\Model\Filters`).
- **Pagination:** `ApiConstants::perPage()` (default 20). Override with `?per_page=` or get all with `?all=1`.

### 2. Base controller and base query

- **Base controller:** Extend `App\Http\Controllers\BaseApiController` and use the standard index/store/show/update/destroy pattern.
- **baseQuery():** Override to define the default query for index/show (e.g. `with()`, global scopes). This keeps controllers thin and consistent.

**Example controller**:

```php
use App\Http\Controllers\BaseApiController;
use App\Http\Resources\PostResource;
use App\Models\Post;

class PostController extends BaseApiController
{
    public function __construct()
    {
        parent::__construct(Post::class, PostResource::class, 'post');
    }

    protected function baseQuery()
    {
        return $this->model->query();
    }

    public function store(StorePostRequest $request)
    {
        return $this->_store($request);
    }

    public function show(Post $post)
    {
        return $this->_show($post);
    }

    public function update(UpdatePostRequest $request, Post $post)
    {
        return $this->_patch($request, $post);
    }

    public function destroy(Post $post)
    {
        return $this->_destroy($post);
    }
}
```

- **index()** is provided by `BaseControllerTrait`: it uses `baseQuery()`, applies filters/sorts, and returns the resource collection (paginated or all).
- **Helpers:** `_store`, `_patch`, `_show`, `_destroy`; use `$this->success()`, `$this->failure()`, `$this->forbidden()` for responses.

### 3. Enums

- Use **PHP enums** with `App\Enums\BaseEnumTrait` for statuses, types, etc.
- Trait provides: `values()`, `labels()` (for select options), and `label()` on each case (humanized from value, e.g. `active` → "Active").

**Example enum** (see `App\Enums\Common\StatusEnum`):

```php
namespace App\Enums\Common;

use App\Enums\BaseEnumTrait;

enum StatusEnum: string
{
    use BaseEnumTrait;

    case ACTIVE = 'active';
    case INACTIVE = 'inactive';
}
```

### 4. List endpoint query params

| Param     | Description |
|----------|-------------|
| `filter[field]` | Filter by field (exact or scope; see model `getFilters()`) |
| `sort`   | Sort column; prefix `-` for descending (e.g. `-created_at`) |
| `per_page` | Page size (default from `ApiConstants::PER_PAGE`) |
| `all`    | Return all records (no pagination) |

---

## Practices to Follow

Use these so the API stays minimal, clean, and consistent.

### Checklist for every new resource

1. **List endpoints** – Use a model with `getFilters()` and `getSorts()`, and a controller that uses `index()` from the trait (no custom index logic unless needed).
2. **Create/update** – Use a Form Request per action (e.g. `StorePostRequest`, `UpdatePostRequest`) and call `_store` / `_patch` from the base controller.
3. **Responses** – Always use the response macros (`success`, `failure`, `forbidden`, `notFound`, `unauth`). Do not use raw `response()->json()` for success or error payloads.
4. **Fixed value sets** – Use PHP enums with `BaseEnumTrait` for status, type, category, etc., and expose `->label()` / `::labels()` in resources or forms.
5. **Code style** – Run Pint before committing: `composer pint` (or `composer pint:check` in CI).
6. **Security & environment** – Use `throttle` middleware on API (or at least on auth routes). Configure CORS in `config/cors.php` for your frontend origin(s).

### Strongly recommend

- **Form Requests** – One request class per write action; keep validation in `rules()` and controllers thin.
- **API Resources** – One resource per model for consistent JSON and to hide/transform fields.
- **Route model binding** – Type-hint the model in controller methods (e.g. `Post $post`) and rely on automatic 404.
- **Sanctum** – Use token auth for API routes; protect with `auth:sanctum` middleware.

### Keep minimal

- No extra application/service layer unless you have real shared logic.
- No translation layer; keep messages as plain strings.
- One pagination style: `ApiConstants::perPage()` with `?per_page` and `?all`.
- Single API version (e.g. `/api` or `/api/v1`) until you need multiple.

### New resource flow

1. Migration → 2. Model (BaseModel + getFilters/getSorts) → 3. Enum(s) if needed → 4. Form Request(s) → 5. Resource → 6. Controller (BaseApiController + baseQuery) → 7. Routes.

---

## Summary

- **Models:** `BaseModel` + `getFilters()` / `getSorts()` + Filter/Date traits.
- **Controllers:** `BaseApiController` + `baseQuery()` + `_store` / `_patch` / `_show` / `_destroy`.
- **Enums:** Backed enum + `BaseEnumTrait` (labels from value via `Str::headline`).
- **Responses:** `response()->success()` / `failure()` (and related macros); messages are plain strings.

This keeps the API minimal, consistent, and easy to extend.
