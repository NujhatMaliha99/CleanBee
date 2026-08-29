<?php

namespace App\Http\Requests;

class UpdatePickupRequest extends StorePickupRequest
{
    public function rules(): array
    {
        return collect(parent::rules())
            ->map(fn (array $rules) => array_merge(['sometimes'], $rules))
            ->all();
    }
}
