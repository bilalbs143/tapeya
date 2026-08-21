/**
 * Scoring header → Broadcast graphics (theme + OBS overlay URL).
 *
 * @param {string|number} matchId
 * @param {string} [homeName]
 * @param {string} [awayName]
 */

import { useCallback, useEffect, useMemo, useState } from 'react';

import { useToast } from '@/hooks/useToast';
import { getApiErrorMessage, isNotFoundError } from '@/lib/apiErrors';
import { FORM_HELPER_TEXT_CLASS } from '@/lib/constants/formLayout';
import {
  buildThemeConfig,
  copyText,
  formatOverlayExpiry,
  isValidThemeConfig,
  overlayExpiresSoon,
  themeConfigsEqual,
  themePropertyLabel,
  themeSchemaProperties,
} from '@/lib/utils/broadcastGraphics';
import {
  useGetGraphicSessionQuery,
  useGetGraphicThemesQuery,
  useRefreshGraphicSignedUrlMutation,
  useUpsertGraphicSessionMutation,
} from '@/store/api/matchApi';
import { Button } from '@/ui/Button';
import { DialogHeaderRow, dialogPrimaryTitleClass, DialogSaveButton, DialogScrollBody, DialogTitle } from '@/ui/Dialog';
import { FormActions } from '@/ui/form/FormActions';
import { FormStack } from '@/ui/form/FormStack';
import { FormField } from '@/ui/FormField';
import { Input } from '@/ui/Input';
import { LoaderBlock } from '@/ui/Loader';
import {
  Select,
  SelectContent,
  selectContentInputClass,
  SelectItem,
  selectItemInputClass,
  SelectTrigger,
  selectTriggerInputClass,
  SelectValue,
  selectViewportInputClass,
} from '@/ui/Select';
import { Switch } from '@/ui/Switch';

const GRAPHICS_FORM_ID = 'broadcast-graphics-form';

export function BroadcastGraphicsDialog({ matchId, homeName = 'Home', awayName = 'Away' }) {
  const toast = useToast();

  const [draftThemeId, setDraftThemeId] = useState(null);
  const [draftConfig, setDraftConfig] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [confirmRefresh, setConfirmRefresh] = useState(false);

  const { data: themes = [], isLoading: themesLoading } = useGetGraphicThemesQuery();
  const {
    data: session,
    error: sessionError,
    isLoading: sessionLoading,
  } = useGetGraphicSessionQuery(matchId, { skip: !matchId });
  const sessionMissing = isNotFoundError(sessionError);
  const sessionFailed = Boolean(sessionError) && !sessionMissing;
  const sessionReady = Boolean(session) && !sessionMissing;

  const [upsertSession] = useUpsertGraphicSessionMutation();
  const [refreshSignedUrl, { isLoading: isRefreshing }] = useRefreshGraphicSignedUrlMutation();

  useEffect(() => {
    if (themesLoading || themes.length === 0) return;
    if (draftThemeId != null) return;

    if (sessionReady && session?.graphic_theme_id) {
      const theme = themes.find((t) => Number(t.id) === Number(session.graphic_theme_id)) ?? themes[0];
      setDraftThemeId(theme.id);
      setDraftConfig(buildThemeConfig(theme, session.config));
      return;
    }

    if (!sessionLoading) {
      const theme = themes[0];
      setDraftThemeId(theme.id);
      setDraftConfig(buildThemeConfig(theme));
    }
  }, [draftThemeId, session, sessionLoading, sessionReady, themes, themesLoading]);

  const selectedTheme = useMemo(() => themes.find((t) => Number(t.id) === Number(draftThemeId)) ?? null, [draftThemeId, themes]);
  const schemaProperties = useMemo(() => themeSchemaProperties(selectedTheme), [selectedTheme]);
  const savedConfig = useMemo(
    () => (sessionReady && Number(session?.graphic_theme_id) === Number(draftThemeId) ? session.config : null),
    [draftThemeId, session?.config, session?.graphic_theme_id, sessionReady],
  );
  const configValid = isValidThemeConfig(selectedTheme, draftConfig);
  const isDirty =
    !sessionReady ||
    Number(session?.graphic_theme_id) !== Number(draftThemeId) ||
    !themeConfigsEqual(draftConfig, savedConfig ?? buildThemeConfig(selectedTheme), schemaProperties);

  const handleSelectTheme = useCallback(
    (themeId) => {
      const theme = themes.find((t) => Number(t.id) === Number(themeId));
      if (!theme) return;
      setDraftThemeId(theme.id);
      const keepSessionConfig = sessionReady && Number(session?.graphic_theme_id) === Number(theme.id);
      setDraftConfig(buildThemeConfig(theme, keepSessionConfig ? session.config : null));
    },
    [session?.config, session?.graphic_theme_id, sessionReady, themes],
  );

  const handleConfigChange = useCallback((key, value) => {
    setDraftConfig((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleSave = useCallback(async () => {
    if (!matchId || !draftThemeId || !selectedTheme || isSaving) return;
    if (!configValid) {
      toast.error('Check theme colors and options before saving.');
      return;
    }

    setIsSaving(true);
    try {
      await upsertSession({
        matchId,
        graphic_theme_id: draftThemeId,
        config: draftConfig,
      }).unwrap();
      toast.success(sessionReady ? 'Graphics settings saved.' : 'Overlay ready. Copy the URL into OBS.');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Could not save graphics settings. Please try again.'));
    } finally {
      setIsSaving(false);
    }
  }, [configValid, draftConfig, draftThemeId, isSaving, matchId, selectedTheme, sessionReady, toast, upsertSession]);

  const overlayUrl = sessionReady ? (session?.signed_overlay_url ?? '') : '';
  const expiresLabel = formatOverlayExpiry(session?.signed_overlay_expires_at);
  const expiringSoon = overlayExpiresSoon(session?.signed_overlay_expires_at);

  const handleCopyUrl = useCallback(async () => {
    try {
      const copied = await copyText(overlayUrl);
      if (copied) toast.success('Overlay URL copied');
      else toast.error('Could not copy URL');
    } catch {
      toast.error('Could not copy URL');
    }
  }, [overlayUrl, toast]);

  const handleConfirmRefresh = useCallback(async () => {
    if (!matchId) return;
    try {
      await refreshSignedUrl(matchId).unwrap();
      setConfirmRefresh(false);
      toast.success('New overlay URL ready. Copy it into OBS.');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Could not refresh overlay URL.'));
    }
  }, [matchId, refreshSignedUrl, toast]);

  const isBootstrapping = themesLoading || sessionLoading || draftThemeId == null;

  return (
    <>
      <DialogHeaderRow>
        <DialogTitle className={dialogPrimaryTitleClass}>Broadcast Graphics</DialogTitle>
      </DialogHeaderRow>

      <DialogScrollBody>
        {confirmRefresh ? (
          <FormStack>
            <p className={`${FORM_HELPER_TEXT_CLASS} leading-snug text-white`}>
              OBS will stop showing graphics until you paste the new URL. Continue?
            </p>
            <FormActions align="stack">
              <Button
                type="button"
                variant="orange"
                className="w-full cursor-pointer"
                onClick={handleConfirmRefresh}
                disabled={isRefreshing}
                loading={isRefreshing}
              >
                Refresh URL
              </Button>
              <Button
                type="button"
                variant="fixture"
                className="w-full cursor-pointer"
                onClick={() => setConfirmRefresh(false)}
                disabled={isRefreshing}
              >
                Cancel
              </Button>
            </FormActions>
          </FormStack>
        ) : isBootstrapping ? (
          <LoaderBlock label="Loading graphics" className="py-12" />
        ) : (
          <FormStack
            as="form"
            id={GRAPHICS_FORM_ID}
            onSubmit={(e) => {
              e.preventDefault();
              handleSave();
            }}
          >
            <FormField label="Theme" htmlFor="broadcast-theme">
              <Select
                value={String(draftThemeId)}
                onValueChange={(value) => handleSelectTheme(Number(value))}
                disabled={isSaving}
              >
                <SelectTrigger id="broadcast-theme" className={selectTriggerInputClass} aria-label="Theme">
                  <SelectValue placeholder="Select Theme" />
                </SelectTrigger>
                <SelectContent className={selectContentInputClass} viewportClassName={selectViewportInputClass}>
                  {themes.map((theme) => (
                    <SelectItem
                      key={theme.id}
                      value={String(theme.id)}
                      className={selectItemInputClass}
                      textClassName="!text-white"
                      indicatorClassName="!text-white"
                    >
                      {theme.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            {selectedTheme && schemaProperties.length > 0
              ? schemaProperties.map((prop) => {
                  const label = themePropertyLabel(prop, homeName, awayName);
                  const fieldId = `broadcast-theme-${prop.key}`;

                  if (prop.type === 'boolean') {
                    return (
                      <FormField key={prop.key} label={label} htmlFor={fieldId}>
                        <div className="flex items-center justify-between gap-3">
                          <p className={`${FORM_HELPER_TEXT_CLASS} min-w-0 leading-snug`}>
                            {prop.key === 'enableImages' ? 'Show player photos on the overlay when available.' : null}
                          </p>
                          <Switch
                            id={fieldId}
                            checked={Boolean(draftConfig[prop.key])}
                            onCheckedChange={(checked) => handleConfigChange(prop.key, checked)}
                            disabled={isSaving}
                            aria-label={label}
                          />
                        </div>
                      </FormField>
                    );
                  }

                  const colorValue =
                    typeof draftConfig[prop.key] === 'string' && /^#[0-9a-fA-F]{6}$/.test(draftConfig[prop.key])
                      ? draftConfig[prop.key]
                      : '#000000';

                  return (
                    <FormField key={prop.key} label={label} htmlFor={fieldId}>
                      <input
                        id={fieldId}
                        type="color"
                        value={colorValue}
                        disabled={isSaving}
                        onChange={(e) => handleConfigChange(prop.key, e.target.value)}
                        className="bg-surface h-12 w-full cursor-pointer rounded-[6px] border-0 p-1 disabled:cursor-not-allowed disabled:opacity-60"
                        aria-label={label}
                      />
                    </FormField>
                  );
                })
              : null}

            {sessionFailed ? (
              <p className="text-sm text-red-200">Could not load the overlay session. Try again in a moment.</p>
            ) : null}

            {sessionReady ? (
              <>
                <FormField label="Overlay URL" htmlFor="broadcast-overlay-url">
                  <p className={`${FORM_HELPER_TEXT_CLASS} leading-snug`}>
                    Add as a Browser Source in OBS (1920×1080 or 1280×720, transparent background).
                  </p>
                  <Input
                    id="broadcast-overlay-url"
                    readOnly
                    value={overlayUrl}
                    aria-label="Overlay URL"
                    className="font-mono text-[12px]"
                  />
                  {expiresLabel ? (
                    <p className={`${FORM_HELPER_TEXT_CLASS} ${expiringSoon ? 'text-brand' : ''}`}>
                      {expiringSoon ? 'Expires soon — ' : 'Expires '}
                      {expiresLabel}
                    </p>
                  ) : null}
                </FormField>
                <FormActions align="start">
                  <Button
                    type="button"
                    variant="orange"
                    className="w-full cursor-pointer sm:flex-1"
                    onClick={handleCopyUrl}
                    disabled={!overlayUrl}
                  >
                    Copy URL
                  </Button>
                  <Button
                    type="button"
                    variant="fixture"
                    className="w-full cursor-pointer sm:flex-1"
                    onClick={() => setConfirmRefresh(true)}
                    disabled={isRefreshing || !overlayUrl}
                  >
                    Refresh URL
                  </Button>
                </FormActions>
              </>
            ) : null}
          </FormStack>
        )}
      </DialogScrollBody>

      {!confirmRefresh && !isBootstrapping ? (
        <DialogSaveButton
          form={GRAPHICS_FORM_ID}
          type="submit"
          disabled={isSaving || draftThemeId == null || !configValid || (!isDirty && sessionReady)}
          loading={isSaving}
        >
          {sessionReady ? 'Save Settings' : 'Save & Create Overlay'}
        </DialogSaveButton>
      ) : null}
    </>
  );
}

export default BroadcastGraphicsDialog;
