import { useMemo, useState } from 'react';

import { AppSubpageHeader } from '@/components/AppSubpageHeader';
import { useDialog } from '@/context/DialogContext';
import { useToast } from '@/hooks/useToast';
import { getApiErrorMessage } from '@/lib/apiErrors';
import { FORM_SECTION_DIVIDER_CLASS } from '@/lib/constants/formLayout';
import { getMatchOversOptions, getPlayersPerSideOptions } from '@/lib/utils/scoringMappers';
import { QuickMatchSettingsFields } from '@/pages/quick-match/QuickMatchSettingsFields';
import { QuickMatchSidePanel, QuickMatchSideSummaryCard } from '@/pages/quick-match/QuickMatchSidePanel';
import { useGetEnumsQuery } from '@/store/api/enumApi';
import { useUpdateTossMutation } from '@/store/api/matchApi';
import {
  useAddQuickMatchPlayerMutation,
  useRemoveQuickMatchPlayerMutation,
  useUpdateQuickMatchMutation,
} from '@/store/api/quickMatchApi';
import { Button } from '@/ui/Button';
import { Container } from '@/ui/Container';
import { FormActions } from '@/ui/form/FormActions';
import { FormStack } from '@/ui/form/FormStack';

function scrollToSide(sideId) {
  document.getElementById(sideId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/**
 * Scheduled quick match resume: edit settings, add players, then toss.
 */
export function ResumeScheduledQuickMatch({ match, onBack, navigate }) {
  const { openDialog } = useDialog();
  const toast = useToast();
  const { data: enums = {} } = useGetEnumsQuery();
  const oversOptions = useMemo(() => getMatchOversOptions(enums.match_overs), [enums.match_overs]);
  const playersPerSideOptions = useMemo(() => getPlayersPerSideOptions(enums.players_per_side), [enums.players_per_side]);
  const formatOptions = useMemo(() => {
    const list = enums.cricket_format;
    if (!Array.isArray(list)) return [];
    return list.map((o) => ({ value: o.value, label: o.label ?? o.value }));
  }, [enums.cricket_format]);

  const [updateQuickMatch, { isLoading: isSaving }] = useUpdateQuickMatchMutation();
  const [addQuickMatchPlayer] = useAddQuickMatchPlayerMutation();
  const [removeQuickMatchPlayer] = useRemoveQuickMatchPlayerMutation();
  const [updateToss, { isLoading: isTossing }] = useUpdateTossMutation();

  const canOperate = Boolean(match.can_operate);
  const [cricketFormat, setCricketFormat] = useState(match.cricket_format ?? 'tape_ball');
  const [overs, setOvers] = useState(match.overs ?? 20);
  const [playersPerSide, setPlayersPerSide] = useState(match.players_per_side ?? 11);

  const home = match.home_team;
  const away = match.away_team;
  const homePlayers = home?.players ?? [];
  const awayPlayers = away?.players ?? [];
  const homeUserIds = homePlayers.map((p) => Number(p.id)).filter(Boolean);
  const awayUserIds = awayPlayers.map((p) => Number(p.id)).filter(Boolean);
  const busy = isSaving || isTossing;
  const pps = Number(playersPerSide) > 0 ? Number(playersPerSide) : 11;

  const buildSettingsBody = () => ({
    matchId: match.id,
    cricket_format: cricketFormat,
    overs: Number(overs),
    players_per_side: Number(playersPerSide),
  });

  const saveSettings = async ({ silent = false } = {}) => {
    try {
      await updateQuickMatch(buildSettingsBody()).unwrap();
      if (!silent) toast.success('Match settings saved.');
    } catch (err) {
      toast.error(getApiErrorMessage(err) ?? 'Could not save settings.');
      throw err;
    }
  };

  const addPlayerToSide = (team) => async (player) => {
    if (!team?.id) throw new Error('Missing team.');
    const currentCount = (team.players ?? []).length;
    if (currentCount >= pps) {
      const msg = `This side already has ${pps} players.`;
      toast.error(msg);
      throw new Error(msg);
    }
    try {
      const body = player.user_id ? { user_id: Number(player.user_id) } : { name: player.name, phone: player.phone };
      await addQuickMatchPlayer({
        matchId: match.id,
        teamId: team.id,
        ...body,
      }).unwrap();
      toast.success(`${player.name || 'Player'} added to ${team.name ?? 'side'}.`);
    } catch (err) {
      const msg = getApiErrorMessage(err) ?? 'Could not add player.';
      toast.error(msg);
      throw err;
    }
  };

  const changeSide = (side) => {
    const current = side === 'home' ? home : away;
    const other = side === 'home' ? away : home;
    const label = side === 'home' ? 'Home' : 'Away';

    const commitChange = async (body) => {
      try {
        await updateQuickMatch({ matchId: match.id, [side]: body }).unwrap();
        toast.success(`${label} team updated.`);
      } catch (err) {
        toast.error(getApiErrorMessage(err) ?? 'Could not change team.');
      }
    };

    openDialog('quickMatchWizardSetSide', {
      sideLabel: label,
      excludeTeamId: other?.id || null,
      initialMode: 'saved',
      initialName: current?.name ?? '',
      onSelectSaved: (team) => commitChange({ team_id: Number(team.id) }),
      onSelectNew: (teamName) => commitChange({ name: teamName }),
    });
  };

  const removePlayerFromSide = (team) => async (idx) => {
    if (!team?.id) return;
    const player = (team.players ?? [])[idx];
    const userId = player?.id != null ? Number(player.id) : null;
    if (userId == null) return;
    try {
      await removeQuickMatchPlayer({
        matchId: match.id,
        teamId: team.id,
        userId,
      }).unwrap();
      toast.success(`${player.name || player.nickname || 'Player'} removed.`);
    } catch (err) {
      toast.error(getApiErrorMessage(err) ?? 'Could not remove player.');
    }
  };

  const onToss = async () => {
    const n = Number(playersPerSide);
    if (homePlayers.length !== n || awayPlayers.length !== n) {
      toast.error(`Each side must have exactly ${n} players before toss. Add players, then try again.`);
      return;
    }
    try {
      await saveSettings({ silent: true });
    } catch {
      return;
    }
    openDialog('startMatchToss', {
      teamAName: home?.name ?? 'Home',
      teamBName: away?.name ?? 'Away',
      teamALogo: home?.logo ?? null,
      teamBLogo: away?.logo ?? null,
      onStartScoring: async ({ tossWinner, tossDecision }) => {
        try {
          // Toss endpoint promotes squad → XI for quick matches (same as create-with-toss).
          await updateToss({
            matchId: match.id,
            winning_team_id: tossWinner === 'A' ? Number(home.id) : Number(away.id),
            chose_to_bat_or_bowl: tossDecision,
          }).unwrap();
          navigate(`/organizer/scoring/match/${match.id}`);
        } catch (err) {
          toast.error(getApiErrorMessage(err) ?? 'Could not start match.');
          throw err;
        }
      },
    });
  };

  return (
    <div className="bg-black">
      <AppSubpageHeader title="Quick Match" onBack={onBack} titleClassName="truncate" />
      <Container>
        <FormStack className="pb-8">
          <p className="text-muted text-[13px]">Scheduled — edit settings or add players, then toss.</p>

          {canOperate ? (
            <>
              <QuickMatchSettingsFields
                cricketFormat={cricketFormat}
                overs={overs}
                playersPerSide={playersPerSide}
                formatOptions={formatOptions}
                onOpenBallType={() =>
                  openDialog('startMatchBallType', {
                    initialValue: cricketFormat,
                    options: formatOptions,
                    onSelect: (v) => setCricketFormat(v),
                  })
                }
                onOpenOvers={() =>
                  openDialog('startMatchOvers', {
                    initialOvers: overs,
                    options: oversOptions,
                    onChange: (v) => setOvers(v),
                  })
                }
                onOpenPlayersPerSide={() =>
                  openDialog('startMatchPlayersPerSide', {
                    initialPlayersPerSide: playersPerSide,
                    options: playersPerSideOptions,
                    onSelect: (val) => setPlayersPerSide(val),
                  })
                }
              />

              <Button type="button" variant="fixture" disabled={busy} onClick={() => saveSettings()}>
                {isSaving ? 'Saving…' : 'Save Settings'}
              </Button>
            </>
          ) : (
            <p className="text-muted text-[13px]">View only — you can’t edit this match.</p>
          )}

          <div className={`flex flex-col gap-6 ${FORM_SECTION_DIVIDER_CLASS}`}>
            <div className="flex items-stretch">
              <QuickMatchSideSummaryCard
                name={home?.name}
                playerCount={homePlayers.length}
                playersPerSide={playersPerSide}
                ariaLabel="Home"
                onPress={() => scrollToSide('qm-resume-home')}
              />
              <div className="relative z-10 -mx-3 flex shrink-0 items-center">
                <span className="bg-brand text-ink flex h-13 w-13 shrink-0 items-center justify-center rounded-full border-[8px] border-black text-[12px] font-bold tracking-wide uppercase">
                  VS
                </span>
              </div>
              <QuickMatchSideSummaryCard
                name={away?.name}
                playerCount={awayPlayers.length}
                playersPerSide={playersPerSide}
                ariaLabel="Away"
                onPress={() => scrollToSide('qm-resume-away')}
              />
            </div>

            {home?.name ? (
              <QuickMatchSidePanel
                id="qm-resume-home"
                label="Home"
                name={home.name}
                onChangeSide={canOperate ? () => changeSide('home') : undefined}
                players={homePlayers}
                playersPerSide={playersPerSide}
                canAddPlayers={canOperate && homePlayers.length < pps}
                onAddPlayer={addPlayerToSide(home)}
                onRemovePlayer={canOperate ? removePlayerFromSide(home) : undefined}
                otherSideUserIds={awayUserIds}
              />
            ) : null}

            {away?.name ? (
              <QuickMatchSidePanel
                id="qm-resume-away"
                label="Away"
                name={away.name}
                onChangeSide={canOperate ? () => changeSide('away') : undefined}
                players={awayPlayers}
                playersPerSide={playersPerSide}
                canAddPlayers={canOperate && awayPlayers.length < pps}
                onAddPlayer={addPlayerToSide(away)}
                onRemovePlayer={canOperate ? removePlayerFromSide(away) : undefined}
                otherSideUserIds={homeUserIds}
              />
            ) : null}
          </div>

          <FormActions align="stack">
            {canOperate ? (
              <Button type="button" variant="orange" disabled={busy} onClick={onToss}>
                {isTossing ? 'Starting…' : 'Toss & Start'}
              </Button>
            ) : null}
            <Button type="button" variant="fixture" onClick={() => navigate('/matches')}>
              Back to My Matches
            </Button>
          </FormActions>
        </FormStack>
      </Container>
    </div>
  );
}
