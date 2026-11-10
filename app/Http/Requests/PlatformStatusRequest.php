<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PlatformStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return (bool) $this->user()?->is_super_admin;
    }

    public function rules(): array
    {
        return [
            'status' => ['required', 'in:active,suspended'],
            'reason' => ['required', 'string', 'min:3', 'max:1000'],
            'confirmed' => ['required', 'accepted'],
        ];
    }
}
