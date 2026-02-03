<?php

namespace App\Models;

use App\Utils\Traits\Model\BaseModelTrait;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * App\Models\BaseModel
 *
 * @method static \Illuminate\Database\Eloquent\Builder|BaseModel newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|BaseModel newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|BaseModel query()
 *
 * @property-read \App\Models\Currency|null $currency
 * @property-read User|null $operator
 *
 * @mixin \Eloquent
 */
abstract class BaseModel extends Model
{
    use BaseModelTrait, HasFactory;
    use SoftDeletes;

    public function commonCasts()
    {
        return [
            'restored_at' => 'datetime',
        ];
    }
}
