<?php

namespace App\Utils\Traits\Model;

use App\Utils\Constants\ApiConstants;
use App\Utils\Services\Utils;
use App\Utils\Traits\Model\Actions\ActionsTrait;
use App\Utils\Traits\Model\Filters\FilterTrait;
use App\Utils\Traits\Model\Relationships\CommonRelationTrait;
use App\Utils\Traits\Model\Relationships\OperatorRelationTrait;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

trait BaseModelTrait
{
    use ActionsTrait;
    use CommonRelationTrait, OperatorRelationTrait;
    use FilterTrait;
    use LogsActivity;

    protected static $logName = 'model_logs';

    protected static $logFillable = true;

    protected static $logOnlyDirty = true;

    public function kebab()
    {
        return Utils::getModelKebab(class_basename($this));
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults();
    }

    public function getDescriptionForEvent(string $eventName): string
    {
        $modelName = Str::headline(class_basename($this));

        return "The {$modelName} has been {$eventName}.";
    }

    public function isChanged()
    {
        return $this->isDirty() || count($this->getChanges()) > 0;
    }

    public function scopePagination($query)
    {
        return $query
            ->paginate(ApiConstants::perPage())
            ->appends(request()->query());
    }

    protected static function generateUniqueValue(string $field, int $length = 20, bool $isNumber = false): string
    {
        do {
            $randomToken = Utils::generateRandomToken($length, isNumber: $isNumber);
        } while (get_called_class()::where($field, $randomToken)->exists());

        return $randomToken;
    }

    // Events Handling
    protected static function boot()
    {
        parent::boot();

        static::creating(function (self $model) {
            if (auth()->check() && in_array('created_by', $model->fillable) && ! $model->isDirty('created_by')) {
                $model->created_by = auth()->id();
            }

            if (in_array('ip_address', $model->fillable)) {
                $model->ip_address = Utils::getClientIp();
            }
        });

        static::updating(function (self $model) {
            if (auth()->check() && in_array('updated_by', $model->fillable) && ! $model->isDirty('updated_by')) {
                $model->updated_by = auth()->id();
            }
        });

        if (in_array(SoftDeletes::class, class_uses(self::class), true)) {
            static::softDeleted(function (self $model) {
                if (auth()->check() && ! $model->isForceDeleting()) {
                    self::withoutEvents(function () use ($model) {
                        $model->deleted_by = auth()->id();
                        $model->restored_at = null;
                        $model->restored_by = null;
                        $model->save();
                    });
                }
            });

            static::restored(function (self $model) {
                if (auth()->check()) {
                    self::withoutEvents(function () use ($model) {
                        $model->deleted_by = null;
                        $model->restored_at = now();
                        $model->restored_by = auth()->id();
                        $model->save();
                    });
                }
            });
        }

    }
}
