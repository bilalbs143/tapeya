<?php

namespace App\Http\Requests\Admin;

use App\Enums\Broadcast\GraphicCommandDisplayModeEnum;
use App\Enums\Broadcast\GraphicCommandKeyEnum;
use App\Enums\Broadcast\GraphicCommandTypeEnum;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class StoreMatchGraphicCommandRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'command_type' => ['required', Rule::enum(GraphicCommandTypeEnum::class)],
            'command_key' => ['required', Rule::enum(GraphicCommandKeyEnum::class)],
            'payload' => ['nullable', 'array'],
            'display_mode' => ['nullable', Rule::enum(GraphicCommandDisplayModeEnum::class)],
            'activate' => ['sometimes', 'boolean'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            $type = $this->input('command_type');
            $keyRaw = $this->input('command_key');
            if (! $type instanceof GraphicCommandTypeEnum) {
                $type = is_string($type) ? GraphicCommandTypeEnum::tryFrom($type) : null;
            }
            $key = $keyRaw instanceof GraphicCommandKeyEnum
                ? $keyRaw
                : (is_string($keyRaw) ? GraphicCommandKeyEnum::tryFrom($keyRaw) : null);

            if (! $type instanceof GraphicCommandTypeEnum || ! $key instanceof GraphicCommandKeyEnum) {
                return;
            }
            if ($key->commandType() !== $type) {
                $validator->errors()->add(
                    'command_key',
                    'This command key is not valid for the selected command type.'
                );
            }
        });
    }
}
