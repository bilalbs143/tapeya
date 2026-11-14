import { cn } from '@/shared/lib/cn';
import { Avatar } from '@/shared/ui/Avatar';
import { CameraIcon, LockIcon, PhoneIcon } from '@/shared/ui/icons';

type InterestIdentityFields = {
  avatar: boolean;
  name: boolean;
  nickname: boolean;
  phone: boolean;
};

type InterestIdentityCardProps = {
  name: string;
  nickname: string;
  phone: string;
  avatarPreview: string | null;
  fields: InterestIdentityFields;
  readOnly: boolean;
  requiredAvatar?: boolean | undefined;
  avatarError?: string | undefined;
  onPickAvatar: () => void;
};

/**
 * Locked account strip — transparent over the campaign stage.
 * Photo is the only interactive control; name / phone stay read-only.
 */
export function InterestIdentityCard({
  name,
  nickname,
  phone,
  avatarPreview,
  fields,
  readOnly,
  requiredAvatar = false,
  avatarError,
  onPickAvatar,
}: InterestIdentityCardProps) {
  const handle = nickname.trim().replace(/^@/, '');
  const displayName = name.trim() || '—';
  const displayPhone = phone.trim() || '—';
  const hasPhoto = Boolean(avatarPreview);
  const canEditAvatar = fields.avatar && !readOnly;

  return (
    <div className="flex flex-col gap-1.5">
      <section
        className={cn(
          'border-border-subtle flex items-center gap-3.5 rounded-panel border p-3.5',
          avatarError && 'border-danger/45'
        )}
        aria-label="Your Account"
      >
        {fields.avatar ? (
          canEditAvatar ? (
            <button
              type="button"
              onClick={onPickAvatar}
              aria-label={hasPhoto ? 'Replace Picture' : requiredAvatar ? 'Add Picture (Required)' : 'Add Picture'}
              className={cn(
                'relative shrink-0 rounded-full focus-visible:outline-brand',
                !hasPhoto &&
                  cn(
                    'border-border text-muted hover:border-brand/45 hover:bg-brand/8 hover:text-brand-text grid h-20 w-20 place-items-center border border-dashed transition-colors',
                    avatarError && 'border-danger/55 text-danger-text'
                  )
              )}
            >
              {hasPhoto ? (
                <>
                  <Avatar
                    src={avatarPreview ?? undefined}
                    name={displayName}
                    size="xl"
                    className="ring-brand-hover/70 ring-offset-page h-20 w-20 ring-2 ring-offset-2"
                  />
                  <span className="bg-brand absolute right-0 bottom-0 grid h-6 w-6 place-items-center rounded-full text-white shadow-card">
                    <CameraIcon className="h-3 w-3" strokeWidth={2.2} />
                  </span>
                </>
              ) : (
                <CameraIcon className="h-6 w-6" strokeWidth={1.85} />
              )}
            </button>
          ) : (
            <Avatar src={avatarPreview ?? undefined} name={displayName} size="xl" className="h-20 w-20" />
          )
        ) : null}

        <div className="min-w-0 flex-1">
          <p className="text-dim flex items-center gap-1 font-mono text-4xs font-bold tracking-eyebrow uppercase">
            <LockIcon size="xs" className="h-3 w-3 shrink-0" strokeWidth={2.2} />
            From Your Account
          </p>

          {fields.name ? (
            <p className="mt-1 truncate text-body-sm leading-snug font-extrabold tracking-tight text-ink">
              {displayName}
            </p>
          ) : null}

          {fields.nickname && handle ? (
            <p className="text-muted mt-0.5 truncate font-mono text-2xs">@{handle}</p>
          ) : null}

          {fields.phone ? (
            <p className="text-muted mt-1.5 flex min-w-0 items-center gap-1.5 font-mono text-2xs tabular-nums">
              <PhoneIcon size="xs" className="text-brand-text h-3.5 w-3.5 shrink-0" strokeWidth={2} />
              <span className="truncate">{displayPhone}</span>
            </p>
          ) : null}
        </div>
      </section>

      {avatarError ? (
        <p role="alert" className="text-danger-soft px-0.5 text-2xs font-semibold">
          {avatarError}
        </p>
      ) : canEditAvatar ? (
        <p className="text-dim px-0.5 text-3xs leading-relaxed">JPG, PNG or WebP, max 5 MB.</p>
      ) : null}
    </div>
  );
}
