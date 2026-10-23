import { SectionLabel } from '@/shared/layout';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/Button';
import { FormFieldsSkeleton, Skeleton } from '@/shared/ui/states';
import { StickyActionBar } from '@/shared/ui/StickyActionBar';
import { Switch } from '@/shared/ui/Switch';

import {
  displayOverlayUrl,
  GRAPHIC_COLOR_FALLBACK,
  themeAccentColor,
  themePropertyLabel,
} from '../lib/broadcastGraphics';
import type { useBroadcastGraphics } from './useBroadcastGraphics';

type BroadcastGraphicsFlow = ReturnType<typeof useBroadcastGraphics>;

type MatchBroadcastGraphicsBodyProps = {
  flow: BroadcastGraphicsFlow;
};

/** Theme picker, options, overlay URL, sticky save — under ScreenBar. */
export function MatchBroadcastGraphicsBody({ flow }: MatchBroadcastGraphicsBodyProps) {
  const {
    themes,
    sessionReady,
    sessionFailed,
    readOnly,
    draftThemeId,
    draftConfig,
    schemaProperties,
    configValid,
    isDirty,
    homeName,
    awayName,
    homeShort,
    awayShort,
    selectTheme,
    patchConfig,
    handleSave,
    handleCopy,
    handleRegenerate,
    bootstrapping,
    overlayUrl,
    expiresLabel,
    expiringSoon,
    previewBar,
    upsertState,
    refreshState,
  } = flow;

  if (bootstrapping) {
    return (
      <div className="flex flex-col gap-4 px-4 py-6" aria-busy="true" aria-label="Loading Broadcast Graphics">
        <Skeleton className="h-2.5 w-12" />
        <div className="flex flex-wrap gap-2">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-16 min-w-0 flex-1 rounded-field" />
          ))}
        </div>
        <Skeleton className="h-2.5 w-20" />
        <Skeleton className="h-28 w-full rounded-card" />
        <Skeleton className="h-2.5 w-16" />
        <FormFieldsSkeleton rows={2} />
        <Skeleton className="h-12 w-full rounded-field" />
      </div>
    );
  }

  return (
    <>
      <div className="flex-1 px-4 pt-3 pb-4">
        <SectionLabel>Theme</SectionLabel>
        <div className="mb-4 flex flex-wrap gap-2">
          {themes.map((theme) => {
            const on = theme.id === draftThemeId;
            const accent = themeAccentColor(theme);
            return (
              <button
                key={theme.id}
                type="button"
                disabled={readOnly}
                onClick={() => selectTheme(theme)}
                className={cn(
                  'flex min-w-0 flex-1 flex-col rounded-field border p-2.5 text-left disabled:opacity-50',
                  on ? 'border-brand bg-surface' : 'border-border-subtle bg-surface'
                )}
              >
                <span className="bg-page-deep mb-1.5 flex h-11 items-end overflow-hidden rounded-panel p-1.5">
                  <span className="h-3.5 flex-1 rounded-chip" style={{ background: accent }} />
                </span>
                <span className={cn('text-3xs leading-normal font-bold', on ? 'text-ink' : 'text-muted')}>
                  {theme.name}
                </span>
              </button>
            );
          })}
        </div>

        <div className="border-border-subtle bg-surface-raised mb-5 rounded-field border p-2.5">
          <p className="font-mono text-dim mb-2 text-4xs font-bold tracking-eyebrow uppercase">Lower third preview</p>
          <div data-surface="navy" className="bg-brand-deep flex items-center gap-2.5 rounded-panel px-2.5 py-2.5">
            <span
              className="font-mono rounded-chip px-1.5 py-0.5 text-3xs font-extrabold tracking-eyebrow text-white uppercase"
              style={{ background: previewBar }}
            >
              {homeShort}
            </span>
            <span className="font-mono text-body-lg leading-normal font-extrabold text-ink">0/0</span>
            <span className="font-mono text-muted text-3xs font-semibold">0.0</span>
            <span className="font-mono text-muted ml-auto text-3xs font-semibold uppercase">{awayShort}</span>
          </div>
        </div>

        {schemaProperties.length > 0 ? (
          <>
            <SectionLabel>Theme Options</SectionLabel>
            <div className="mb-5 flex flex-col gap-3">
              {schemaProperties.map((prop) => {
                const label = themePropertyLabel(prop, homeName, awayName);
                const fieldId = `broadcast-${prop.key}`;
                if (prop.type === 'boolean') {
                  return (
                    <label
                      key={prop.key}
                      className={cn(
                        'border-border-subtle bg-surface flex items-center gap-3 rounded-card border px-3.5 py-3',
                        readOnly && 'opacity-60'
                      )}
                    >
                      <span className="min-w-0 flex-1 text-body-sm font-bold text-ink">{label}</span>
                      <Switch
                        id={fieldId}
                        checked={Boolean(draftConfig[prop.key])}
                        disabled={readOnly || upsertState.isLoading}
                        onCheckedChange={(v) => patchConfig(prop.key, v)}
                        aria-label={label}
                      />
                    </label>
                  );
                }
                const colorValue =
                  typeof draftConfig[prop.key] === 'string' && /^#[0-9a-fA-F]{6}$/.test(String(draftConfig[prop.key]))
                    ? String(draftConfig[prop.key])
                    : GRAPHIC_COLOR_FALLBACK;
                return (
                  <div key={prop.key} className="flex flex-col gap-1.5">
                    <span className="text-2xs font-bold text-ink">{label}</span>
                    <input
                      id={fieldId}
                      type="color"
                      value={colorValue}
                      disabled={readOnly || upsertState.isLoading}
                      onChange={(e) => patchConfig(prop.key, e.target.value)}
                      className="border-border-subtle bg-surface h-11 w-full cursor-pointer rounded-field border p-1 disabled:cursor-not-allowed disabled:opacity-60"
                      aria-label={label}
                    />
                  </div>
                );
              })}
            </div>
          </>
        ) : null}

        {sessionFailed ? (
          <p className="text-danger-soft mb-4 text-2xs" role="alert">
            Could not load the overlay session. Try again in a moment.
          </p>
        ) : null}

        <SectionLabel>Overlay URL</SectionLabel>
        {sessionReady && overlayUrl ? (
          <>
            <div className="border-border-subtle bg-surface mb-2 rounded-field border px-3 py-3">
              <p className="font-mono text-body truncate text-2xs font-semibold">{displayOverlayUrl(overlayUrl)}</p>
            </div>
            {expiresLabel ? (
              <p className={cn('text-dim mb-2 text-3xs', expiringSoon && 'text-brand-text font-semibold')}>
                {expiringSoon ? 'Expires soon — ' : 'Expires '}
                {expiresLabel}
              </p>
            ) : null}
            <div className="flex gap-2">
              <Button className="h-12 flex-[1.4]" disabled={!overlayUrl || readOnly} onClick={() => void handleCopy()}>
                Copy URL
              </Button>
              <Button
                variant="secondary"
                className="h-12 flex-1"
                disabled={readOnly || refreshState.isLoading || !overlayUrl}
                onClick={() => void handleRegenerate()}
              >
                Regenerate
              </Button>
            </div>
            <p className="text-dim mt-2 text-3xs leading-relaxed">
              Signed link. Anyone with it can display the overlay but not score.
            </p>
          </>
        ) : (
          <p className="text-muted text-2xs leading-relaxed">Save a theme to create the signed overlay URL for OBS.</p>
        )}

        {readOnly ? (
          <p className="text-dim mt-4 text-3xs leading-relaxed">
            View-only — you can see graphics setup but can&apos;t change it.
          </p>
        ) : null}
      </div>

      {!readOnly ? (
        <StickyActionBar edge>
          <Button
            className="w-full"
            disabled={upsertState.isLoading || draftThemeId == null || !configValid || (!isDirty && sessionReady)}
            onClick={() => void handleSave()}
          >
            {upsertState.isLoading ? 'Saving…' : sessionReady ? 'Save Settings' : 'Save & Create Overlay'}
          </Button>
        </StickyActionBar>
      ) : null}
    </>
  );
}
