import { type ChangeEvent } from 'react';

import { Alert } from '@/shared/ui/Alert';
import { CountryCityFields } from '@/shared/ui/CountryCityFields';
import { DatePicker } from '@/shared/ui/DatePicker';
import { Field } from '@/shared/ui/Field';
import { FormRow } from '@/shared/ui/Form';
import { DocumentIcon, PlusIcon } from '@/shared/ui/icons';
import { Input } from '@/shared/ui/Input';
import { SelectField, SelectItem } from '@/shared/ui/Select';

import { AVATAR_TYPES, checkInterestUpload, DOC_TYPES } from '../lib/upload';
import {
  fieldEnabled,
  type InterestCampaign,
  type InterestCustomField,
  type InterestFormField,
  type InterestFormValues,
  interestRenderableCustomFields,
} from '../model/schemas';
import { InterestIdentityCard } from './InterestIdentityCard';

export type InterestFormProps = {
  campaign: InterestCampaign;
  closedBanner?: boolean | undefined;
  values: InterestFormValues;
  onChange: (patch: Partial<InterestFormValues>) => void;
  onCustomAnswerChange: (fieldId: string, value: string) => void;
  avatarPreview: string | null;
  onAvatarFile: (file: File | null) => void;
  customFileMeta: Record<string, { name: string | null; url: string | null }>;
  onCustomFile: (fieldId: string, file: File | null) => void;
  errors: Partial<Record<'email' | 'avatar' | 'dateOfBirth' | 'city' | 'country', string>> & {
    custom?: Record<string, string>;
  };
  requiredAvatar?: boolean | undefined;
  onToastError?: ((title: string, description: string) => void) | undefined;
};

/** Locked identity card for name / phone / photo; editable fields below. Parent supplies `Form density="compact"`. */

export function InterestForm({
  campaign,
  closedBanner = false,
  values,
  onChange,
  onCustomAnswerChange,
  avatarPreview,
  onAvatarFile,
  customFileMeta,
  onCustomFile,
  errors,
  requiredAvatar = false,
  onToastError,
}: InterestFormProps) {
  const has = (f: InterestFormField) => fieldEnabled(campaign.formFields, f);
  const readOnly = closedBanner;

  function pickAvatar(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const bad = checkInterestUpload(file, 'avatar');
    if (bad) {
      onToastError?.('Picture Not Added', bad);
      return;
    }
    onAvatarFile(file);
  }

  function pickCustomFile(field: InterestCustomField) {
    return (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = '';
      if (!file) return;
      const bad = checkInterestUpload(file, 'doc');
      if (bad) {
        onToastError?.('Document Not Added', bad);
        return;
      }
      onCustomFile(field.id, file);
    };
  }

  const identityFields = {
    avatar: has('profile_picture'),
    name: has('name'),
    nickname: has('nickname'),
    phone: has('phone'),
  };
  const showIdentity = identityFields.avatar || identityFields.name || identityFields.nickname || identityFields.phone;

  return (
    <>
      {closedBanner ? (
        <Alert tone="warning" title="Interest Form Closed" description="New submissions are not accepted." />
      ) : null}

      {showIdentity ? (
        <InterestIdentityCard
          name={values.name}
          nickname={values.nickname}
          phone={values.phone}
          avatarPreview={avatarPreview}
          fields={identityFields}
          readOnly={readOnly}
          requiredAvatar={requiredAvatar}
          avatarError={errors.avatar}
          avatarAccept={AVATAR_TYPES.join(',')}
          onAvatarChange={readOnly ? undefined : pickAvatar}
        />
      ) : null}

      <FormRow>
        {has('email') ? (
          <Input
            label="Email"
            type="email"
            inputMode="email"
            value={values.email}
            onChange={(e) => onChange({ email: e.target.value })}
            error={errors.email}
            disabled={readOnly}
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
            disabled={readOnly}
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
          readOnly={readOnly}
          showCountry={has('country')}
          showCity={has('city')}
          {...(errors.country ? { countryError: errors.country } : {})}
          {...(errors.city ? { cityError: errors.city } : {})}
          layout="row"
          triggerClassName="h-12 rounded-panel"
        />
      ) : null}

      {interestRenderableCustomFields(campaign).map((field) => {
        const error = errors.custom?.[field.id];
        if (field.type === 'text') {
          return (
            <Input
              key={field.id}
              label={field.label}
              required={field.required}
              value={values.customAnswers[field.id] ?? ''}
              onChange={(e) => onCustomAnswerChange(field.id, e.target.value)}
              error={error}
              disabled={readOnly}
              placeholder={`Enter ${field.label}`}
              className="h-12 rounded-panel"
            />
          );
        }

        if (field.type === 'select') {
          const current = values.customAnswers[field.id] ?? '';
          return (
            <SelectField
              key={field.id}
              label={field.label}
              required={field.required}
              value={current || undefined}
              onValueChange={(v) => onCustomAnswerChange(field.id, v)}
              placeholder={`Select ${field.label}`}
              disabled={readOnly || field.options.length === 0}
              error={error}
              triggerClassName="h-12 rounded-panel"
            >
              {current && !field.options.includes(current) ? <SelectItem value={current}>{current}</SelectItem> : null}
              {field.options.map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectField>
          );
        }

        const meta = customFileMeta[field.id] ?? { name: null, url: null };
        const docName = meta.name;
        const docUrl = meta.url;

        return (
          <Field
            key={field.id}
            label={field.label}
            required={field.required}
            error={error}
            hint={error ? undefined : 'Image or PDF, up to 10 MB.'}
          >
            {({ id }) => (
              <>
                {docName || docUrl ? (
                  <div className="border-border-subtle bg-surface flex items-center gap-2.5 rounded-panel border p-2.5">
                    <span className="bg-surface-raised text-brand-text grid h-9 w-9 shrink-0 place-items-center rounded-panel">
                      <DocumentIcon size="sm" className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-xs font-bold text-ink">
                        {docName ?? 'Uploaded document'}
                      </span>
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
                    {!readOnly ? (
                      <button
                        type="button"
                        onClick={() => onCustomFile(field.id, null)}
                        className="text-dim hover:text-ink shrink-0 px-1 text-2xs font-bold"
                      >
                        Replace
                      </button>
                    ) : null}
                  </div>
                ) : readOnly ? (
                  <div
                    id={id}
                    className="border-border text-muted flex h-12 w-full items-center justify-center gap-2 rounded-panel border border-dashed text-xs font-semibold opacity-40"
                  >
                    <PlusIcon className="h-4 w-4" strokeWidth={2} />
                    Upload {field.label}
                  </div>
                ) : (
                  <label
                    id={id}
                    className="border-border text-muted hover:text-ink focus-within:outline-brand relative flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-panel border border-dashed text-xs font-semibold"
                  >
                    <PlusIcon className="h-4 w-4" strokeWidth={2} />
                    Upload {field.label}
                    <input
                      type="file"
                      accept={DOC_TYPES.join(',')}
                      onChange={pickCustomFile(field)}
                      className="absolute inset-0 cursor-pointer opacity-0"
                    />
                  </label>
                )}
              </>
            )}
          </Field>
        );
      })}
    </>
  );
}
