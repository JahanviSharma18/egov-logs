<?php
 
namespace App\Models;
 
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;   // ← ADD this import
 
class User extends Authenticatable
{
    use HasRoles, Notifiable;            // ← ADD HasRoles here
 
    protected $fillable = [
        'name',
        'email',
        'password',
    ];
 
    protected $hidden = [
        'password',
        'remember_token',
    ];
 
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }
}