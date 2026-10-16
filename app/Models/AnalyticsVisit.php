<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AnalyticsVisit extends Model
{
    public $timestamps = false;

    protected $guarded = [];

    protected $casts = [
        'started_at' => 'immutable_datetime',
        'last_seen_at' => 'immutable_datetime',
    ];
}
