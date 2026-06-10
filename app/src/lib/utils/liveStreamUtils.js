import { normaliseMatchStatus } from '@/lib/utils/scorecardUtils';

/**
 * YouTube thumbnail for a broadcast / video id (live or VOD).
 *
 * @param {string|null|undefined} embedId
 * @returns {string|null}
 */
export function youtubeStreamThumbnail(embedId) {
  if (!embedId?.trim()) {
    return null;
  }

  return `https://i.ytimg.com/vi/${encodeURIComponent(embedId.trim())}/hqdefault.jpg`;
}

/**
 * Normalise GET /live/matches rows for Live hub UI.
 *
 * @param {Array<object>} [matches]
 * @returns {Array<object>}
 */
export function normaliseLiveStreamMatches(matches) {
  return (matches ?? []).map((match) => {
    const home = match.home_team ?? {};
    const away = match.away_team ?? {};
    const embedId = match.stream?.embed_id ?? null;
    const thumbnailUrl = match.thumbnail_url?.trim() || youtubeStreamThumbnail(embedId);

    return {
      id: match.id,
      tournament_id: match.tournament_id,
      tournament_name: match.tournament?.name ?? '',
      status: normaliseMatchStatus(match.status || 'scheduled'),
      stream: match.stream ?? null,
      matchId: home.name && away.name ? `${home.name} vs ${away.name}` : `Match ${match.id}`,
      team1: {
        name: home.name || 'Home team',
        initial: (home.name || 'H').charAt(0).toUpperCase(),
        logo: home.logo ?? null,
      },
      team2: {
        name: away.name || 'Away team',
        initial: (away.name || 'A').charAt(0).toUpperCase(),
        logo: away.logo ?? null,
      },
      score1: null,
      score2: null,
      meta: {},
      thumbnail_url: thumbnailUrl,
    };
  });
}

/**
 * @param {number|string} matchId
 * @returns {string}
 */
export function liveBroadcastPath(matchId) {
  return `/live/broadcast/${matchId}`;
}

/**
 * @param {number|string} tournamentId
 * @param {number|string} matchId
 * @returns {string}
 */
export function liveMatchWatchPath(tournamentId, matchId) {
  return `/scorecard/${tournamentId}/match/${matchId}`;
}

/**
 * Resolve the iframe src for a YouTube stream.
 *
 * The backend (`YouTubeEmbedUrl::normalize`) is the canonical source — when
 * `embedUrl` is present it already contains the correct app params (controls=0,
 * autoplay=1, etc.). Use it directly rather than re-parsing and rebuilding.
 *
 * `embedId` is the fallback for cases where only the raw video ID is available
 * (e.g. a Reverb status update that carries the id but not the full URL).
 *
 * @param {string|null|undefined} embedUrl  Full normalized embed URL from API
 * @param {string|null|undefined} embedId   Bare YouTube video/broadcast ID
 * @returns {string|null}
 */
export function buildYoutubeEmbedUrl(embedUrl, embedId) {
  if (embedUrl?.trim()) return embedUrl.trim();

  if (!embedId?.trim()) return null;

  const params = new URLSearchParams({
    autoplay: '1',
    rel: '0',
    modestbranding: '1',
    controls: '0',
    fs: '0',
    disablekb: '1',
    playsinline: '1',
    iv_load_policy: '3',
    cc_load_policy: '0',
  });

  return `https://www.youtube.com/embed/${embedId.trim()}?${params.toString()}`;
}
