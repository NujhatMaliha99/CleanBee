<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePickupRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'waste_type' => ['required', 'string', 'in:plastic,organic,paper,e-waste,glass,metal,mixed'],
            'quantity' => ['required', 'numeric', 'gt:0', 'max:99999999.99'],
            'quantity_unit' => ['required', 'string', 'in:kg,bags,items'],
            'pickup_address' => ['required', 'string', 'max:1000'],
            'pickup_date' => ['required', 'date', 'after_or_equal:today'],
            'pickup_time' => ['required', 'date_format:H:i'],
            'contact_phone' => ['required', 'string', 'regex:/^\+?[0-9\s-]{7,15}$/'],
            'instructions' => ['nullable', 'string', 'max:2000'],
            'image' => ['nullable', 'image', 'mimes:jpeg,jpg,png,webp', 'max:5120'],
        ];
    }
}
