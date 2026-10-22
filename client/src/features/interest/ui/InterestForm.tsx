import { type ChangeEvent, useRef } from 'react';

import { cn } from '@/shared/lib/cn';
import { Avatar } from '@/shared/ui/Avatar';
import { Button } from '@/shared/ui/Button';
import { CountryCityFields } from '@/shared/ui/CountryCityFields';
import { DatePicker } from '@/shared/ui/DatePicker';
import { Field, FieldLabel } from '@/shared/ui/Field';
import { FormRow } from '@/shared/ui/Form';
import { DocumentIcon, LockIcon, PlusIcon } from '@/shared/ui/icons';
import { Input } from '@/shared/ui/Input';

import { AVATAR_TYPES, checkInterestUpload, DOC_TYPES } from '../lib/upload';
import type { InterestUiActions } from '../model/actions';
import {
  fieldEnabled,
  type InterestCampaign,
  type InterestFormField,
  type InterestFormValues,
  READ_ONLY_FIELDS,
} from '../model/schemas';

export type InterestFormProps = {
  campaign: InterestCampaign;
  actions: InterestUiActions;
  values: InterestFormValues;
  onChange: (patch: Partial<InterestFormValues>) => void;
  avatarPreview: string | null;
  onAvatarFile: (file: File | null) => void;
  docName: string | null;
  docUrl: string | null;
  onDocFile: (file: File | null) => void;
  errors: Partial<Record<'email' | 'avatar' | 'doc' | 'dateOfBirth' | 'city' | 'country', string>>;
  /** Avatar required when campaign asks and none is on file yet. */
  requiredAvatar?: boolean | undefined;
  /** ID doc required when campaign asks and none is on file yet. */
  requiredDoc?: boolean | undefined;
  onWithdraw?: (() => void) | undefined;
  onToastError?: ((title: string, description: string) => void) | undefined;
};

/** Locked identity rows for name / nickname / phone; media via local file pick. Parent supplies `Form density="compact"`. */

export function InterestForm({
  campaign,
  actions: a,
  values,
  onChange,
  avatarPreview,
  onAvatarFile,
  docName,
  docUrl,
  onDocFile,
  errors,
  requiredAvatar = false,
  requiredDoc = false,
  onWithdraw,
  onToastError,
}: InterestFormProps) {
  const has = (f: InterestFormField) => fieldEnabled(campaign.formFields, f);
  const avatarInput = useRef<HTMLInputElement>(null);
  const docInput = useRef<HTMLInputElement>(null);

  function pick(kind: 'avatar' | 'doc') {
    return (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = '';
      if (!file) return;
      const bad = checkInterestUpload(file, kind);
      if (bad) {
        onToastError?.(kind === 'avatar' ? 'Picture Not Added' : 'Document Not Added', bad);
        return;
      }
      if (kind === 'avatar') onAvatarFile(file);
      else onDocFile(file);
    };
  }

  return (
    <>
      {campaign.description ? <p className="text-muted text-2xs leading-relaxed">{campaign.description}</p> : null}

      {a.banner ? (
        <p
          className={cn(
            'rounded-panel border px-3.5 py-3 text-2xs leading-relaxed',
            a.banner.tone === 'positive' && 'border-positive/35 bg-positive/10 text-ink',
            a.banner.tone === 'brand' && 'border-brand/35 bg-brand/10 text-ink',
            a.banner.tone === 'muted' && 'border-border text-muted'
          )}
        >
          {a.banner.text}
        </p>
      ) : null}

      {has('profile_picture') ? (
        <Field
          label="Profile Picture"
          required={requiredAvatar}
          error={errors.avatar}
          hint={errors.avatar ? undefined : 'JPG, PNG or WebP, max 5 MB.'}
        >
          {({ id }) => (
            <div className="flex items-center gap-3.5">
              <Avatar src={avatarPreview ?? undefined} name={values.name} size="lg" className="h-14 w-14" />
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                {a.readOnlyAll ? (
                  <span className="text-dim text-3xs">On file.</span>
                ) : (
                  <button
                    type="button"
                    id={id}
                    onClick={() => avatarInput.current?.click()}
                    className="text-brand-text self-start text-2xs font-bold"
                  >
                    {avatarPreview ? 'Replace Picture' : 'Add Picture'}
                  </button>
                )}
              </div>
              <input
                ref={avatarInput}
                type="file"
                accept={AVATAR_TYPES.join(',')}
                onChange={pick('avatar')}
                className="hidden"
              />
            </div>
          )}
        </Field>
      ) : null}

      <FormRow>
        {READ_ONLY_FIELDS.filter(has).map((f) => {
          const label = f === 'name' ? 'Full Name' : f === 'nickname' ? 'Nickname' : 'Phone';
          const raw = f === 'name' ? values.name : f === 'nickname' ? values.nickname : values.phone;
          const value = f === 'nickname' ? (raw ? `@${raw.replace(/^@/, '')}` : '—') : raw || '—';
          return <Locked key={f} label={label} value={value} mono={f !== 'name'} />;
        })}

        {has('email') ? (
          <Input
            label="Email"
            type="email"
            inputMode="email"
            value={values.email}
            onChange={(e) => onChange({ email: e.target.value })}
            error={errors.email}
            disabled={a.readOnlyAll}
            placeholder="Enter Email"
            className="h-12 rounded-panel"
          />
        ) : null}

        {has('date_of_birth') ? (
          <DatePicker
            label="Date of Birth"
            required
            value={values.dateOfBirth}
            onChange={(dateOfBirth) => onChange({ dateOfBirth })}
            error={errors.dateOfBirth}
            disabled={a.readOnlyAll}
            className="h-12 rounded-panel"
          />
        ) : null}
      </FormRow>

      {has('country') || has('city') ? (
        <CountryCityFields
          country={values.country}
          city={values.city}
          onCountryChange={(country) => onChange({ country })}
          onCityChange={(city) => onChange({ city })}
          required
          readOnly={a.readOnlyAll}
          showCountry={has('country')}
          showCity={has('city')}
          {...(errors.country ? { countryError: errors.country } : {})}
          {...(errors.city ? { cityError: errors.city } : {})}
          layout="row"
          triggerClassName="h-12 rounded-panel"
        />
      ) : null}

      {has('id_document') ? (
        <Field
          label="CNIC or B-Form"
          required={requiredDoc}
          error={errors.doc}
          hint={errors.doc ? undefined : 'Image or PDF, up to 10 MB.'}
        >
          {({ id }) => (
            <>
              {docName || docUrl ? (
                <div className="border-border-subtle bg-surface flex items-center gap-2.5 rounded-panel border p-2.5">
                  <span className="bg-surface-raised text-brand-text grid h-9 w-9 shrink-0 place-items-center rounded-panel">
                    <DocumentIcon size="sm" className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-bold text-ink">{docName ?? 'Uploaded document'}</span>
                    {docUrl ? (
                      <a
                        href={docUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-brand-text block text-3xs font-semibold"
                      >
                        View Uploaded Document
                      </a>
                    ) : (
                      <span className="text-brand-text block text-3xs font-semibold">Ready to Upload</span>
                    )}
                  </span>
                  {!a.readOnlyAll ? (
                    <button
                      type="button"
                      onClick={() => onDocFile(null)}
                      className="text-dim hover:text-ink shrink-0 px-1 text-2xs font-bold"
                    >
                      Replace
                    </button>
                  ) : null}
                </div>
              ) : (
                <button
                  type="button"
                  id={id}
                  onClick={() => docInput.current?.click()}
                  disabled={a.readOnlyAll}
                  className="border-border text-muted hover:text-ink focus-visible:outline-brand flex h-12 w-full items-center justify-center gap-2 rounded-panel border border-dashed text-xs font-semibold disabled:opacity-40"
                >
                  <PlusIcon className="h-4 w-4" strokeWidth={2} />
                  Upload CNIC or B-Form
                </button>
              )}
              <input
                ref={docInput}
                type="file"
                accept={DOC_TYPES.join(',')}
                onChange={pick('doc')}
                className="hidden"
              />
            </>
          )}
        </Field>
      ) : null}

      {a.showWithdraw && onWithdraw ? (
        <Button type="button" variant="danger" className="self-start" onClick={onWithdraw}>
          Withdraw
        </Button>
      ) : null}
    </>
  );
}

function Locked({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex flex-col gap-1.5">
      <FieldLabel>{label}</FieldLabel>
      <div className="border-border-subtle bg-surface flex h-12 items-center gap-2 rounded-panel border px-3.5">
        <span className={cn('text-dim flex-1 truncate text-sm', mono ? 'font-mono' : 'font-semibold')}>{value}</span>
        <LockIcon size="xs" className="text-dim h-3.5 w-3.5 shrink-0" strokeWidth={2} />
      </div>
    </div>
  );
}
