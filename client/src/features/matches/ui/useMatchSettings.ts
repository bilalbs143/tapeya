import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { getApiErrorMessage } from '@/shared/api/errors';
import { toast } from '@/shared/ui/toast';

import { useGetScoringFixtureQuery, useUpdateMatchAnalyticsSettingsMutation } from '../api/matchesApi';
import { matchSettingsBarSubtitle, type OfficialKey } from '../lib/matchSettings';
import { matchRoutes } from '../routes';

type PatchBody = {
  wagonWheelEnabled?: boolean | undefined;
  umpires?: string | null | undefined;
  scorers?: string | null | undefined;
  commentators?: string | null | undefined;
};

/** Wagon wheel + officials drafts; PATCH analytics-settings as you go. */
export function useMatchSettings(matchId: number, valid: boolean) {
  const navigate = useNavigate();
  const fixtureQuery = useGetScoringFixtureQuery(matchId, { skip: !valid });
  const [updateSettings, updateState] = useUpdateMatchAnalyticsSettingsMutation();

  const fixture = fixtureQuery.data;
  const readOnly = !fixture?.canOperate;
  const analytics = fixture?.analytics;

  const [wagonWheel, setWagonWheel] = useState(false);
  const [text, setText] = useState<Record<OfficialKey, string>>({
    umpires: '',
    scorers: '',
    commentators: '',
  });

  // Sync form from server analytics on load/refetch — render-time sync, not useEffect.
  const [prevAnalytics, setPrevAnalytics] = useState(analytics);
  if (analytics !== prevAnalytics) {
    setPrevAnalytics(analytics);
    if (analytics) {
      setWagonWheel(analytics.wagonWheelEnabled);
      setText({
        umpires: analytics.umpires,
        scorers: analytics.scorers,
        commentators: analytics.commentators,
      });
    }
  }

  const homeShort = fixture?.home?.short ?? 'HOME';
  const awayShort = fixture?.away?.short ?? 'AWAY';
  const barSubtitle = matchSettingsBarSubtitle(homeShort, awayShort);
  const backTo = matchRoutes.score(matchId);

  async function patch(body: PatchBody, okTitle: string) {
    try {
      await updateSettings({ matchId, ...body }).unwrap();
      toast({ title: okTitle, tone: 'success' });
    } catch (error) {
      toast({
        title: getApiErrorMessage(error, 'Could not save match settings.'),
        tone: 'error',
      });
      // Reseat from server on failure.
      void fixtureQuery.refetch();
    }
  }

  function onWagonChange(next: boolean) {
    if (readOnly) return;
    setWagonWheel(next);
    void patch({ wagonWheelEnabled: next }, 'Wagon wheel updated.');
  }

  function saveField(key: OfficialKey) {
    if (readOnly) return;
    const value = text[key];
    const server = analytics?.[key] ?? '';
    if (value.trim() === server.trim()) return;
    void patch({ [key]: value.trim() || null }, 'Officials updated.');
  }

  function setOfficialText(key: OfficialKey, value: string) {
    setText((prev) => ({ ...prev, [key]: value.slice(0, 2000) }));
  }

  function goBack() {
    navigate(backTo);
  }

  return {
    fixtureQuery,
    fixture,
    readOnly,
    wagonWheel,
    text,
    updateLoading: updateState.isLoading,
    barSubtitle,
    onWagonChange,
    saveField,
    setOfficialText,
    goBack,
  };
}
