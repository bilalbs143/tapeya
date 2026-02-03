<?php

namespace App\Exceptions\Seamless;

use App\Enums\Company\CompanyEnum;
use App\Enums\Seamless\FourTen\FourTenStatusCode;
use App\Enums\Seamless\TheBigHit\TheBigHitStatusCode;
use App\Enums\Seamless\Vinus\VinusStatusCode;
use App\Facades\CompanyRequest;
use App\Utils\Services\Companies\Seamless\AntechipSeamlessService;
use App\Utils\Services\Companies\Seamless\FourTenSeamlessService;
use App\Utils\Services\Companies\Seamless\TheBigHitSeamlessService;
use App\Utils\Services\Companies\Seamless\VinusSeamlessService;
use Exception;

class FailureException extends Exception
{
    public function __construct(
        public string $msg = '',
        public int|string $statusCode = 400,
        public bool $isResponse = true,
        public string|int|null|VinusStatusCode|TheBigHitStatusCode|FourTenStatusCode $customCode = null,
        public array $errors = [],
        public bool $isSuccess = false,
        public array $antechipStatus = [],
    ) {}

    public function render()
    {
        if ($this->isResponse) {
            if (CompanyRequest::hasCompany()) {
                return $this->handleException();
            } else {
                return response()->json(['message' => $this->msg], 404);
            }
        }
    }

    private function handleException()
    {
        if (CompanyRequest::getCompany()->key === CompanyEnum::ANTECHIP) {
            return $this->handleAntechip();
        }

        if (CompanyRequest::getCompany()->key === CompanyEnum::VINUS) {
            return $this->handleVinus();
        }

        if (CompanyRequest::getCompany()->key === CompanyEnum::THEBIGHIT) {
            return $this->handleTheBigHit();
        }

        if (CompanyRequest::getCompany()->key === CompanyEnum::FOURTEN) {
            return $this->handleFourTen();
        }
    }

    private function handleAntechip()
    {
        $data = [
            'status' => $this->antechipStatus,
        ];

        if ($this->isSuccess) {
            $data['user_info'] = AntechipSeamlessService::getUser(CompanyRequest::getUser());
        }

        $data = [
            ...$data,
            ...$this->errors,
            'processing_time' => AntechipSeamlessService::getProcessingTime(),
        ];

        return response()->json($data);
    }

    private function handleVinus()
    {
        if ($this->isSuccess) {
            return VinusSeamlessService::handleSuccessResponse(customCode: $this->customCode, data: $this->errors, hasErrors: true, addBalance: true);
        }

        return VinusSeamlessService::handleErrorResponse(customCode: $this->customCode, errors: $this->errors);
    }

    private function handleTheBigHit()
    {
        if ($this->isSuccess) {
            return TheBigHitSeamlessService::handleSuccessResponse(data: $this->errors);
        }

        return TheBigHitSeamlessService::handleErrorResponse(customCode: $this->customCode, message: $this->msg);
    }

    private function handleFourTen()
    {
        if ($this->isSuccess) {
            return FourTenSeamlessService::handleSuccessResponse(data: $this->errors);
        }

        return FourTenSeamlessService::handleErrorResponse(customCode: $this->customCode, errors: $this->errors);
    }
}
