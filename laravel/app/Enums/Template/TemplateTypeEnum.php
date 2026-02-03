<?php

namespace App\Enums\Template;

use App\Enums\BaseEnumTrait;

enum TemplateTypeEnum: string
{
    use BaseEnumTrait;

    case CUSTOMER_INQUIRY = 'customer_inquiry';
    case FAQS = 'faqs';
    case ANNOUNCEMENTS = 'announcements';
    case NOTES = 'notes';
}
