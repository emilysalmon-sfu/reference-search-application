<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * One random salt per Vancouver day for the visitor hash. Older salts are deleted.
 */
class AnalyticsSalt extends Model
{
    public $timestamps = false;

    protected $guarded = [];
}
