<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Feedback extends Model
{
    protected $table = 'feedback';

    protected $fillable = [
        'name',
        'email',
        'comment',
        'isResolved'
    ];

    protected $casts = [
        'isResolved' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function scopePending($query)
    {
        return $query->where('isResolved', false);
    }

    public function scopeResolved($query)
    {
        return $query->where('isResolved', true);
    }
}
