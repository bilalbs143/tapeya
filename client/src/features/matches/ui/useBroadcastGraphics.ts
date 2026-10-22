import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { getApiErrorMessage, isNotFoundError } from '@/shared/api/errors';
import { confirm } from '@/shared/dialogs/helpers';
import { toast } from '@/shared/ui/toast';

import {
  useGetGraphicSessionQuery,
  useGetGraphicThemesQuery,
  useGetScoringFixtureQuery,
  useRefreshGraphicSignedUrlMutation,
  useUpsertGraphicSessionMutation,
} from '../api/matchesApi';
import {
  buildThemeConfig,
  copyText,
  formatOverlayExpiry,
  GRAPHIC_ACCENT_FALLBACK,
  type GraphicTheme,
  isValidThemeConfig,
  overlayExpiresSoon,
  themeAccentColor,
  themeConfigsEqual,
  themeSchemaProperties,
} from '../lib/broadcastGraphics';
import { matchRoutes } from '../routes';

/** Graphic session draft, save/copy/regenerate — for MatchBroadcastGraphicsPage. */
export function useBroadcastGraphics(matchId: number, valid: boolean) {
  const navigate = useNavigate();

  const fixtureQuery = useGetScoringFixtureQuery(matchId, { skip: !valid });
  const themesQuery = useGetGraphicThemesQuery(undefined, { skip: !valid });
  const sessionQuery = useGetGraphicSessionQuery(matchId, { skip: !valid });
  const [upsertSession, upsertState] = useUpsertGraphicSessionMutation();
  const [refreshUrl, refreshState] = useRefreshGraphicSignedUrlMutation();

  const fixture = fixtureQuery.data;
  const themes = useMemo(() => themesQuery.data ?? [], [themesQuery.data]);
  const sessionMissing = isNotFoundError(sessionQuery.error);
  const sessionFailed = Boolean(sessionQuery.error) && !sessionMissing;
  const session = sessionMissing ? undefined : sessionQuery.data;
  const sessionReady = Boolean(session);
  const readOnly = !fixture?.canOperate;

  /** null = follow server/theme list; set once the operator edits. */
  const [draft, setDraft] = useState<{
    themeId: number;
    config: Record<string, unknown>;
  } | null>(null);

  const seeded = useMemo(() => {
    if (themesQuery.isLoading || sessionQuery.isLoading || themes.length === 0) return null;
    const fromSession = sessionReady ? themes.find((t) => t.id === session?.graphicThemeId) : undefined;
    const theme = fromSession ?? themes[0];
    if (!theme) return null;
    return {
      themeId: theme.id,
      config: buildThemeConfig(theme, fromSession ? (session?.config ?? null) : null),
    };
  }, [session?.config, session?.graphicThemeId, sessionQuery.isLoading, sessionReady, themes, themesQuery.isLoading]);

  const active = draft ?? seeded;
  const draftThemeId = active?.themeId ?? null;
  const draftConfig = active?.config ?? {};

  const selectedTheme = useMemo(() => themes.find((t) => t.id === draftThemeId) ?? null, [draftThemeId, themes]);
  const schemaProperties = useMemo(() => themeSchemaProperties(selectedTheme), [selectedTheme]);
  const savedConfig = useMemo(() => {
    if (!sessionReady || session?.graphicThemeId !== draftThemeId) return null;
    return session?.config ?? null;
  }, [draftThemeId, session?.config, session?.graphicThemeId, sessionReady]);

  const configValid = isValidThemeConfig(selectedTheme, draftConfig);
  const isDirty =
    !sessionReady ||
    session?.graphicThemeId !== draftThemeId ||
    !themeConfigsEqual(draftConfig, savedConfig ?? buildThemeConfig(selectedTheme), schemaProperties);

  const homeName = fixture?.home?.name ?? 'Home';
  const awayName = fixture?.away?.name ?? 'Away';
  const homeShort = fixture?.home?.short ?? 'HOME';
  const awayShort = fixture?.away?.short ?? 'AWAY';

  const selectTheme = useCallback(
    (theme: GraphicTheme) => {
      if (readOnly) return;
      const keep = sessionReady && session?.graphicThemeId === theme.id;
      setDraft({
        themeId: theme.id,
        config: buildThemeConfig(theme, keep ? (session?.config ?? null) : null),
      });
    },
    [readOnly, session?.config, session?.graphicThemeId, sessionReady]
  );

  function patchConfig(key: string, value: unknown) {
    if (readOnly || draftThemeId == null) return;
    setDraft({
      themeId: draftThemeId,
      config: { ...draftConfig, [key]: value },
    });
  }

  async function handleSave() {
    if (readOnly || !draftThemeId || !selectedTheme || !configValid) return;
    try {
      await upsertSession({
        matchId,
        graphicThemeId: draftThemeId,
        config: draftConfig,
      }).unwrap();
      setDraft(null);
      toast({
        title: sessionReady ? 'Graphics settings saved.' : 'Overlay ready. Copy the URL into OBS.',
        tone: 'success',
      });
    } catch (error) {
      toast({
        title: getApiErrorMessage(error, 'Could not save graphics settings.'),
        tone: 'error',
      });
    }
  }

  async function handleCopy() {
    const url = session?.signedOverlayUrl ?? '';
    try {
      const ok = await copyText(url);
      toast({
        title: ok ? 'Overlay URL copied.' : 'Could not copy URL.',
        tone: ok ? 'success' : 'error',
      });
    } catch {
      toast({ title: 'Could Not Copy URL', tone: 'error' });
    }
  }

  async function handleRegenerate() {
    if (readOnly || !sessionReady) return;
    const ok = await confirm({
      title: 'Regenerate the Overlay URL?',
      message:
        'The current link stops working immediately. Any stream already using it — OBS, vMix, a second operator — will show a blank overlay until someone pastes the new URL. Mid-broadcast, that is dead air on the scoreboard.',
      confirmLabel: 'Regenerate',
      cancelLabel: 'Keep Current',
      tone: 'danger',
    });
    if (!ok) return;
    try {
      await refreshUrl(matchId).unwrap();
      toast({ title: 'New overlay URL ready. Copy it into OBS.', tone: 'success' });
    } catch (error) {
      toast({
        title: getApiErrorMessage(error, 'Could not refresh overlay URL.'),
        tone: 'error',
      });
    }
  }

  const bootstrapping =
    fixtureQuery.isLoading || themesQuery.isLoading || sessionQuery.isLoading || draftThemeId == null;

  const overlayUrl = session?.signedOverlayUrl ?? '';
  const expiresLabel = formatOverlayExpiry(session?.signedOverlayExpiresAt);
  const expiringSoon = overlayExpiresSoon(session?.signedOverlayExpiresAt);
  const firstColorKey = schemaProperties.find((p) => p.type === 'color')?.key;
  const previewBar =
    firstColorKey && typeof draftConfig[firstColorKey] === 'string'
      ? String(draftConfig[firstColorKey])
      : selectedTheme
        ? themeAccentColor(selectedTheme)
        : GRAPHIC_ACCENT_FALLBACK;

  function goBack() {
    navigate(matchRoutes.score(matchId));
  }

  return {
    matchId,
    navigate,
    goBack,
    fixtureQuery,
    themesQuery,
    fixture,
    themes,
    sessionReady,
    sessionFailed,
    readOnly,
    draftThemeId,
    draftConfig,
    selectedTheme,
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
  };
}
