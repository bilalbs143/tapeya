import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { shareLink } from '@/shared/native/share';
import { toast } from '@/shared/ui/toast';

import {
  useDislikeTournamentMutation,
  useLikeTournamentMutation,
  useShareTournamentMutation,
} from '../api/tournamentsApi';
import {
  publicTournamentCountsLine,
  publicTournamentPlaceLine,
  type PublicTournamentTab,
  publicTournamentTabFromSearch,
} from '../lib/publicTournament';
import type { Tournament, TournamentReaction } from '../model/schemas';
import { tournamentRoutes } from '../tournamentPaths';

/** Reactions, share, and tab search params for the public tournament hub. */
export function usePublicTournament(tournament: Tournament) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = useMemo(() => publicTournamentTabFromSearch(searchParams), [searchParams]);
  const teamParam = searchParams.get('team');

  const [likes, setLikes] = useState(tournament.likesCount);
  const [dislikes, setDislikes] = useState(tournament.dislikesCount);
  const [shares, setShares] = useState(tournament.sharesCount);
  const [myReaction, setMyReaction] = useState<TournamentReaction | null>(tournament.myReaction);

  const [likeTournament, { isLoading: liking }] = useLikeTournamentMutation();
  const [dislikeTournament, { isLoading: disliking }] = useDislikeTournamentMutation();
  const [shareTournament, { isLoading: sharing }] = useShareTournamentMutation();
  const reacting = liking || disliking || sharing;

  function setTab(next: PublicTournamentTab, teamId?: number) {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('tab', next);
    if (next === 'squads' && teamId != null) {
      nextParams.set('team', String(teamId));
    } else if (next !== 'squads') {
      nextParams.delete('team');
    }
    setSearchParams(nextParams, { replace: true });
  }

  function applyReactionCounts(result: {
    likesCount: number;
    dislikesCount: number;
    sharesCount: number;
    myReaction?: TournamentReaction | null;
  }) {
    setLikes(result.likesCount);
    setDislikes(result.dislikesCount);
    setShares(result.sharesCount);
    if ('myReaction' in result) setMyReaction(result.myReaction ?? null);
  }

  async function handleLike() {
    if (reacting) return;
    try {
      const result = await likeTournament(tournament.id).unwrap();
      applyReactionCounts(result);
    } catch {
      /* ignore */
    }
  }

  async function handleDislike() {
    if (reacting) return;
    try {
      const result = await dislikeTournament(tournament.id).unwrap();
      applyReactionCounts(result);
    } catch {
      /* ignore */
    }
  }

  async function handleShare() {
    if (reacting) return;
    const url = `${window.location.origin}${tournamentRoutes.public(tournament.id)}`;
    const channel = await shareLink({ title: tournament.name, url });
    if (channel === 'cancelled') return;
    if (channel === 'copied') toast({ title: 'Link Copied', tone: 'success' });
    try {
      const result = await shareTournament(tournament.id).unwrap();
      setLikes(result.likesCount);
      setDislikes(result.dislikesCount);
      setShares(result.sharesCount);
    } catch {
      /* ignore */
    }
  }

  const place = publicTournamentPlaceLine(tournament);
  const counts = publicTournamentCountsLine(tournament);
  const interestSlug = tournament.interestCampaignSlug;

  return {
    navigate,
    tournament,
    tab,
    teamParam,
    setTab,
    likes,
    dislikes,
    shares,
    myReaction,
    reacting,
    handleLike,
    handleDislike,
    handleShare,
    place,
    counts,
    interestSlug,
  };
}
