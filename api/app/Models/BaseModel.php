<?php

namespace App\Models;

use App\Utils\Traits\Model\BaseModelTrait;
use App\Utils\Traits\Model\Filters\FilterTrait;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Base model for API resources. Use getFilters() and getSorts() for query builder.
 */
abstract class BaseModel extends Model
{
    use BaseModelTrait;
    use FilterTrait;
    use HasFactory;
}
