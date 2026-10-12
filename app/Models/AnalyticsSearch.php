<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AnalyticsSearch extends Model
{
    public $timestamps = false;

    protected $guarded = [];

    protected $casts = [
        'searched_at' => 'datetime',
    ];
}
