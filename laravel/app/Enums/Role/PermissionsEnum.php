<?php

namespace App\Enums\Role;

use App\Enums\BaseEnumTrait;

enum PermissionsEnum: string
{
    use BaseEnumTrait;

    public function label()
    {
        if (in_array($this, self::getViewPropertyPermissions())) {
            return __("permissions.{$this->value}");
        }

        return $this->value;
    }

    case VIEW_PULSE = 'pulse.view';

    case VIEW_LOGIN_HISTORY = 'login.history.view';
    case VIEW_CURRENT_SESSIONS = 'login.current.view';
    case KILL_CURRENT_SESSION = 'login.current.kill';

    case VIEW_AGENTS = 'agent.view.all';
    case VIEW_AGENT_HIERARCHY = 'agent.view.hierarchy';
    case VIEW_AGENT = 'agent.view';
    case CREATE_AGENT = 'agent.create';
    case UPDATE_AGENT = 'agent.update';
    case DELETE_AGENT = 'agent.delete';

    case VIEW_MEMBERS = 'member.view.all';
    case VIEW_MEMBER = 'member.view';
    case UPDATE_MEMBER = 'member.update';

    case VIEW_EXCHANGE_REQUESTS = 'exchange_request.view.all';
    case VIEW_EXCHANGE_REQUEST = 'exchange_request.view';
    case UPDATE_EXCHANGE_REQUEST = 'exchange_request.update';
    case DELETE_EXCHANGE_REQUEST = 'exchange_request.delete';
    case APPROVE_EXCHANGE_REQUEST = 'exchange_request.approve';
    case REJECT_EXCHANGE_REQUEST = 'exchange_request.reject';

    case VIEW_TRANSACTIONS = 'transaction.view.all';
    case PAY = 'transaction.pay';

    case VIEW_TEMPLATES = 'template.view.all';
    case VIEW_TEMPLATE = 'template.view';
    case CREATE_TEMPLATE = 'template.create';
    case UPDATE_TEMPLATE = 'template.update';
    case DELETE_TEMPLATE = 'template.delete';

    case VIEW_FAQS = 'faq.view.all';
    case VIEW_FAQ = 'faq.view';
    case CREATE_FAQ = 'faq.create';
    case UPDATE_FAQ = 'faq.update';
    case DELETE_FAQ = 'faq.delete';

    case VIEW_ANNOUNCEMENTS = 'announcement.view.all';
    case VIEW_ANNOUNCEMENT = 'announcement.view';
    case CREATE_ANNOUNCEMENT = 'announcement.create';
    case UPDATE_ANNOUNCEMENT = 'announcement.update';
    case DELETE_ANNOUNCEMENT = 'announcement.delete';

    case VIEW_QUICK_INQUIRIES = 'quick_inquiry.view.all';
    case VIEW_QUICK_INQUIRY = 'quick_inquiry.view';
    case DELETE_QUICK_INQUIRY = 'quick_inquiry.delete';

    case VIEW_CUSTOMER_INQUIRIES = 'customer_inquiry.view.all';
    case VIEW_CUSTOMER_INQUIRY = 'customer_inquiry.view';
    case REPLY_TO_CUSTOMER_INQUIRY = 'customer_inquiry.reply';
    case DELETE_CUSTOMER_INQUIRY = 'customer_inquiry.delete';

    case VIEW_POPUPS = 'popup.view.all';
    case VIEW_POPUP = 'popup.view';
    case CREATE_POPUP = 'popup.create';
    case UPDATE_POPUP = 'popup.update';
    case DELETE_POPUP = 'popup.delete';

    case VIEW_NOTES = 'note.view.all';
    case VIEW_NOTE = 'note.view';
    case CREATE_NOTE = 'note.create';
    case UPDATE_NOTE = 'note.update';
    case DELETE_NOTE = 'note.delete';

    case VIEW_BLACKLISTED_IPS = 'blacklisted_ip.view.all';
    case VIEW_BLACKLISTED_IP = 'blacklisted_ip.view';
    case CREATE_BLACKLISTED_IP = 'blacklisted_ip.create';
    case UPDATE_BLACKLISTED_IP = 'blacklisted_ip.update';
    case DELETE_BLACKLISTED_IP = 'blacklisted_ip.delete';

    case VIEW_WHITELISTED_IPS = 'whitelisted_ip.view.all';
    case VIEW_WHITELISTED_IP = 'whitelisted_ip.view';
    case CREATE_WHITELISTED_IP = 'whitelisted_ip.create';
    case UPDATE_WHITELISTED_IP = 'whitelisted_ip.update';
    case DELETE_WHITELISTED_IP = 'whitelisted_ip.delete';

    case VIEW_SOUNDS = 'sound.view.all';
    case VIEW_SOUND = 'sound.view';
    case CREATE_SOUND = 'sound.create';
    case UPDATE_SOUND = 'sound.update';
    case DELETE_SOUND = 'sound.delete';

    case VIEW_SOUND_SETTINGS = 'sound-setting.view.all';
    case VIEW_SOUND_SETTING = 'sound-setting.view';
    case CREATE_SOUND_SETTING = 'sound-setting.create';
    case UPDATE_SOUND_SETTING = 'sound-setting.update';
    case DELETE_SOUND_SETTING = 'sound-setting.delete';

    case VIEW_MEMBERSHIP_COMMISSION_SETTINGS = 'membership-level-commission-setting.view.all';
    case UPDATE_MEMBERSHIP_COMMISSION_SETTING = 'membership-level-commission-setting.update';

    case VIEW_SYSTEM_SETTINGS = 'system-setting.view.all';
    case VIEW_SYSTEM_SETTING = 'system-setting.view';
    case UPDATE_SYSTEM_SETTING = 'system-setting.update';

    case STATS_GET_REQUESTS_COUNTER = 'stats.requests-counter.get';
    case STATS_GET_REQUESTS = 'stats.requests.get';
    case STATS_GET_ACTIVITIES = 'stats.activities.get';
    case STATS_GET_CALCULATIONS = 'stats.calculations.get';

    case VIEW_PROVIDERS = 'provider.view.all';
    case VIEW_PROVIDER = 'provider.view';
    case CREATE_PROVIDER = 'provider.create';
    case UPDATE_PROVIDER = 'provider.update';
    case DELETE_PROVIDER = 'provider.delete';

    case VIEW_DAILY_SETTLEMENTS = 'daily-settlement.view.all';
    case VIEW_USER_DAILY_SETTLEMENTS = 'user-daily-settlement.view.all';
    case VIEW_MONTHLY_SETTLEMENTS = 'monthly-settlement.view.all';
    case VIEW_USER_MONTHLY_SETTLEMENTS = 'user-monthly-settlement.view.all';

    case VIEW_BETS_HISTORY = 'bet-history.view.all';

    case MANAGE_DOMAINS = 'domain.manage';

    case WITHDRAW_ROLLING_MONEY = 'withdraw.rolling-money';
    case WITHDRAW_LOSING_MONEY = 'withdraw.losing-money';

    case VIEW_GAME_RESULT_CARDS = 'game-result-card.view.all';
    case VIEW_GAME_RESULT_CARD = 'game-result-card.view';

    case VIEW_ROLES = 'roles.view.all';
    case VIEW_ROLE = 'roles.view';

    case VIEW_VIEW_PROPERTY_PERMISSIONS = 'view-property-permissions.view.all';
    case SYNC_ROLE_PERMISSIONS = 'role-permissions.sync';

    case SYNC_USER_PERMISSIONS = 'user-permissions.sync';

    case VIEW_PROPERTY_USERNAME = 'property.view.username';
    case VIEW_PROPERTY_NAME = 'property.view.name';
    case VIEW_PROPERTY_NICKNAME = 'property.view.nickname';
    case VIEW_PROPERTY_PHONE = 'property.view.phone';
    case VIEW_PROPERTY_DOB = 'property.view.dob';
    case VIEW_PROPERTY_LEVEL = 'property.view.level';
    case VIEW_PROPERTY_BANK_NAME = 'property.view.bank-name';
    case VIEW_PROPERTY_ACCOUNT_HOLDER = 'property.view.account-holder';
    case VIEW_PROPERTY_ACCOUNT_NUMBER = 'property.view.account-number';

    case VIEW_BANKS = 'bank.view.all';
    case VIEW_BANK = 'bank.view';
    case CREATE_BANK = 'bank.create';
    case UPDATE_BANK = 'bank.update';
    case DELETE_BANK = 'bank.delete';

    case VIEW_BANK_ACCOUNTS = 'bank-account.view.all';
    case VIEW_BANK_ACCOUNT = 'bank-account.view';
    case CREATE_BANK_ACCOUNT = 'bank-account.create';
    case UPDATE_BANK_ACCOUNT = 'bank-account.update';
    case DELETE_BANK_ACCOUNT = 'bank-account.delete';

    case CREATE_APP_RELEASE = 'app-release.create';

    public static function getViewPropertyPermissions(): array
    {
        return [
            self::VIEW_PROPERTY_USERNAME,
            self::VIEW_PROPERTY_NAME,
            self::VIEW_PROPERTY_NICKNAME,
            self::VIEW_PROPERTY_PHONE,
            self::VIEW_PROPERTY_DOB,
            self::VIEW_PROPERTY_LEVEL,
            self::VIEW_PROPERTY_BANK_NAME,
            self::VIEW_PROPERTY_ACCOUNT_HOLDER,
            self::VIEW_PROPERTY_ACCOUNT_NUMBER,
        ];
    }
}
