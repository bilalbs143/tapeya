<?php

namespace App\Utils\Traits\Model\Actions;

use Closure;

trait ActionsTrait
{
    public function reject($status, array $extra = [], ?Closure $cb = null)
    {
        $this->update([
            'status' => $status,
            'rejected_by' => auth()->id(),
            'rejected_at' => now(),
            ...$extra,
        ]);

        if ($cb) {
            $cb($this);
        }
    }

    public function approve($status, array $extra = [], ?Closure $cb = null)
    {
        $this->update([
            'status' => $status,
            'approved_by' => auth()->id(),
            'approved_at' => now(),
            ...$extra,
        ]);

        if ($cb) {
            $cb($this);
        }
    }

    public function read(array $extra = [])
    {
        if ($this->read_at !== null) {
            return;
        }

        $this->update([
            'read_by' => auth()->id(),
            'read_at' => now(),
            ...$extra,
        ]);
    }
}
