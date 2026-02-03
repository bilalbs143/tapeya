<?php

namespace App\Models;

use App\Casts\AsFile;
use App\Enums\Bank\BankAccountTypeEnum;
use Spatie\QueryBuilder\AllowedFilter;

class BankAccount extends BaseModel
{
    protected $fillable = [
        'bank_id',
        'logo_path',
        'type',
        'account_holder_name',
        'account_number',
        'qr_code_path',
        'is_active',
        'min_deposit_amount',
        'max_deposit_amount',
        'bank_transaction_fee',
        'bank_transaction_subsidi',
        'created_by',
        'updated_by',
        'deleted_by',
        'restored_at',
        'restored_by',
    ];

    protected $casts = [
        'logo_path' => AsFile::class.':images/bank-accounts/logos',
        'qr_code_path' => AsFile::class.':images/bank-accounts/qrcodes',
        'type' => BankAccountTypeEnum::class,
        'is_active' => 'boolean',
        'restored_at' => 'datetime',
    ];

    public function bank()
    {
        return $this->belongsTo(Bank::class);
    }

    public static function getFilters()
    {
        return [
            AllowedFilter::exact('bank_id'),
            AllowedFilter::exact('is_active'),
            AllowedFilter::exact('type'),
            'account_holder_name',
            'account_number',
            ...self::getCreatorModifierFilters(),
        ];
    }

    public static function getSorts()
    {
        return [
            'bank_id',
            'is_active',
            'type',
            'account_holder_name',
            'account_number',
            ...self::getCreatorModifierSorts(),
        ];
    }
}
