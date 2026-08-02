/**
 * @typedef {Object} ThemeTokens
 * @property {string} homeBgColor
 * @property {string} awayBgColor
 * @property {string} [homeTextColor] Optional; themes may omit (fall back to theme CSS `--text`)
 * @property {string} [awayTextColor] Optional; themes may omit
 * @property {string} [textColor] Optional primary overlay text override for `--text`
 * @property {boolean} enableImages
 */

/**
 * @typedef {Object} GraphicTeam
 * @property {number|null} id
 * @property {string} name
 * @property {string} shortCode
 * @property {string} abbrevDisplay
 * @property {string|null} logoUrl
 */

/**
 * @typedef {Object} GraphicBatter
 * @property {number|string|null} id
 * @property {string} name
 * @property {number} runs
 * @property {number} balls
 * @property {number} fours
 * @property {number} sixes
 * @property {number} ones
 * @property {number} twos
 * @property {number} threes
 * @property {number} dots
 * @property {boolean} onStrike
 * @property {boolean} isDismissed
 * @property {string|null} imageUrl
 */

/**
 * @typedef {Object} GraphicLiveBowler
 * @property {string} name
 * @property {string} figures
 * @property {string} overs
 * @property {number|null} userId
 * @property {number|null} teamId
 * @property {number|null} runsConceded
 * @property {number|null} ballsBowled
 * @property {number|null} dots
 * @property {number|null} wickets
 * @property {number|null} economy
 * @property {number|null} extrasConceded
 * @property {string|null} imageUrl
 */

/**
 * @typedef {Object} GraphicOfficialsLine
 * @property {string} text
 * @property {string[]} lines
 */

/**
 * @typedef {Object} GraphicOfficials
 * @property {GraphicOfficialsLine} umpires
 * @property {GraphicOfficialsLine} scorers
 * @property {GraphicOfficialsLine} commentators
 */

/**
 * @typedef {Object} GraphicDelivery
 * @property {string} displayToken
 * @property {string} chipType
 * @property {boolean} isFreeHit
 * @property {number} runsTotal
 * @property {number} overNumber
 * @property {number} ballInOver
 * @property {boolean} isLegal
 */

/**
 * @typedef {Object} GraphicBallSummary
 * @property {number} dots
 * @property {number} fours
 * @property {number} sixes
 * @property {number} wickets
 * @property {number} runs
 * @property {GraphicDelivery[]} deliveries
 */

/**
 * @typedef {Object} GraphicWinProbability
 * @property {number} home
 * @property {number} away
 */

/**
 * @typedef {Object} GraphicAtStageMirrorBowler
 * @property {string} name
 * @property {string} figures
 * @property {string} overs
 * @property {string|null} imageUrl
 */

/**
 * @typedef {Object} GraphicAtStageMirror
 * @property {'home'|'away'} battingTeam
 * @property {string} score
 * @property {string} overs
 * @property {GraphicBatter[]} batters
 * @property {GraphicAtStageMirrorBowler} bowler
 * @property {GraphicDelivery[]} currentOverDeliveries
 * @property {string} inningsLabel
 */

/**
 * @typedef {Object} GraphicMatchSnapshot
 * @property {string} status
 * @property {number|null} homeTeamId
 * @property {number|null} awayTeamId
 * @property {string} homeTeamName
 * @property {string} awayTeamName
 * @property {string} homeTeamShortCode
 * @property {string} awayTeamShortCode
 * @property {string|null} homeTeamLogoUrl
 * @property {string|null} awayTeamLogoUrl
 * @property {'home'|'away'|null} tossWinnerSide
 * @property {'bat'|'bowl'|null} choseToBatOrBowl
 * @property {string|null} resultSummary
 * @property {string|null} winningTeam
 * @property {boolean} isCompleted
 * @property {number|null} playerOfMatchUserId
 * @property {string|null} playerOfMatchName
 * @property {string} number
 * @property {string} venue
 * @property {string} venueDisplayLine
 * @property {number|null} maxOversPerInnings
 * @property {number} playersPerSide
 * @property {GraphicOfficials} officials
 */

/**
 * @typedef {Object} GraphicTournamentAggregates
 * @property {number} totalRuns
 * @property {number} totalFours
 * @property {number} totalSixes
 * @property {number} totalFifties
 * @property {number} totalCenturies
 * @property {number} totalWickets
 */

/**
 * @typedef {Object} GraphicTournamentSnapshot
 * @property {string} name
 * @property {string} shortCode
 * @property {string|null} logoUrl
 * @property {GraphicTournamentAggregates} aggregates
 */

/**
 * @typedef {GraphicTeam & { score: string, overs: string, wickets: number|null, extras: number, fours: number, sixes: number }} GraphicBattingTeamLine
 */

/**
 * @typedef {Object} GraphicLiveSnapshot
 * @property {1|2} inningsNumber
 * @property {'home'|'away'} battingTeamSide
 * @property {GraphicBattingTeamLine} battingTeam
 * @property {GraphicTeam} bowlingTeam
 * @property {GraphicBatter[]} batters
 * @property {GraphicLiveBowler} bowler
 * @property {GraphicDelivery[]} currentOverDeliveries
 * @property {{ runs: number, balls: number }} partnership
 * @property {unknown[]} partnershipHistory
 * @property {unknown[]} battingOrder
 * @property {unknown[]} bowlers
 * @property {number|null} wicketsRemaining
 * @property {number|string|null} target
 * @property {number|null} runsToWin
 * @property {number|null} ballsRemaining
 * @property {string} currentRR
 * @property {string} requiredRR
 * @property {number|string|null} projectedScore
 * @property {GraphicWinProbability|null} winProbability
 * @property {unknown[]} fallOfWickets
 * @property {{ runs: number, wickets: number }} previousOver
 * @property {GraphicBallSummary} last12Balls
 * @property {GraphicBallSummary} last30Balls
 * @property {GraphicBallSummary} thisOver
 * @property {Record<string, any>[]} inningsChart Raw per-over/per-innings chart entries — shape varies (overs_breakdown, phase_stats, over_buckets), see `_shared/chartSeries.js`
 * @property {GraphicAtStageMirror|null} atStageMirror
 * @property {{ runs: Record<string, any>[], fours: Record<string, any>[], sixes: Record<string, any>[], wickets: Record<string, any>[], matchRuns: Record<string, any>[], matchWickets: Record<string, any>[] }} leaderboards
 * @property {unknown[]} inningsSummaries
 * @property {unknown[]} standings
 * @property {unknown[]} squadHome
 * @property {unknown[]} squadAway
 * @property {boolean} wagonWheelEnabled
 * @property {{ type: string, shotDirection: unknown, runs: number, strikerId: number|null }[]} wagonWheelBalls
 */

/**
 * @typedef {Object} GraphicSessionSnapshot
 * @property {string|null} commandKey
 * @property {number|string|null} commandId
 * @property {string|null} commandType
 * @property {string|null} displayMode
 * @property {Record<string, unknown>|null} payload
 * @property {string} themeSlug
 * @property {string} contextHash
 * @property {ThemeTokens} config
 * @property {GraphicMatchSnapshot} match
 * @property {GraphicTournamentSnapshot} tournament
 * @property {GraphicLiveSnapshot} live
 * @property {Record<string, unknown>|null} nextMatchFixture
 */

/**
 * @typedef {Object} GraphicRenderPlan
 * @property {string} commandKey
 * @property {string|null} commandType
 * @property {number|string|null} commandId
 * @property {string} contextHash
 * @property {string|null} displayMode
 * @property {string} themeSlug
 * @property {ThemeTokens} tokens
 * @property {Record<string, unknown>} componentProps
 */

/**
 * @typedef {Object} GraphicProcessorContext
 * @property {GraphicSessionSnapshot} snapshot
 */

/**
 * A processor may return `null` (no plan — overlay stays blank) or an empty/populated
 * props object (clear, animation, or normal render respectively). See
 * `GraphicCommandProcessor.js` / `ARCHITECTURE.md` §3 "Processor return semantics".
 *
 * @callback GraphicProcessor
 * @param {GraphicSessionSnapshot} snapshot
 * @returns {Record<string, unknown> | null}
 */

export {};
