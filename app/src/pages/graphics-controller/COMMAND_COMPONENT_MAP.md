# Graphic commands → overlay components

Keep this table aligned with:

- **Commands:** `api/app/Enums/Broadcast/GraphicCommandKeyEnum.php` (105 keys)
- **Routing:** `app/src/pages/graphics-controller/graphicRegistry.js` → `KEY_TO_FILE`
- **Theme:** `app/src/pages/graphics-controller/theme1/*.jsx`

When you add or rename commands, update this file manually (or regenerate the table from those sources).

---

## Summary

| Metric                                |                         Count |
| ------------------------------------- | ----------------------------: |
| Command keys (enum)                   |                           105 |
| Registry entries                      |                           105 |
| Unique component filenames (non-null) |                            56 |
| Intentional no-overlay keys           | 2 (`LT_EMPTY`, `ADD_CAPTION`) |

---

## Special cases

### No lazy-loaded component

| Command       | Registry value | Notes                                                         |
| ------------- | -------------- | ------------------------------------------------------------- |
| `LT_EMPTY`    | `null`         | Clears the overlay (transparent).                             |
| `ADD_CAPTION` | `null`         | Backoffice-only; opens caption UI; never sent to the overlay. |

### Shared module (not a `command_key` target)

| File                          | Role                                                                                            |
| ----------------------------- | ----------------------------------------------------------------------------------------------- |
| `theme1/ScoreboardHeader.jsx` | Imported by other graphics (e.g. `ballChipClass`, layout helpers). Not listed in `KEY_TO_FILE`. |

---

## Full map: `command_key` → `theme1` component

| command_key              | theme1 component            | API command type       | Label (backoffice)  |
| ------------------------ | --------------------------- | ---------------------- | ------------------- |
| `ADD_CAPTION`            | _(no overlay)_              | CAPTION                | Add Caption         |
| `AT_STAGE`               | `AtThisStage.jsx`           | LOWER_THIRD            | At Stage            |
| `BATSMAN_MATCH_FS`       | `BatsmanCurrentStats.jsx`   | PLAYER_BATSMAN         | Match FS            |
| `BATSMAN_MATCH_LT`       | `BatsmanCurrentStats.jsx`   | PLAYER_BATSMAN         | Match LT            |
| `BATSMAN_NAME_FS`        | `PlayerIntro.jsx`           | PLAYER_BATSMAN         | Name FS             |
| `BATSMAN_NAME_LT`        | `PlayerIntro.jsx`           | PLAYER_BATSMAN         | Name LT             |
| `BATSMAN_TOURNAMENT_FS`  | `BatsmanCareerStats.jsx`    | PLAYER_BATSMAN         | Tournament FS       |
| `BATSMAN_TOURNAMENT_LT`  | `BatsmanCareerStats.jsx`    | PLAYER_BATSMAN         | Tournament LT       |
| `BATTING_SQUAD`          | `BatsmanInningsStats.jsx`   | FULL_SCREEN            | Batting Squad       |
| `BATTING_SUMMARY`        | `BatsmanInningsStats.jsx`   | FULL_SCREEN            | Batting Summary     |
| `BOWLER_MATCH_FS`        | `BowlerCurrentStats.jsx`    | PLAYER_BOWLER          | Match FS            |
| `BOWLER_MATCH_LT`        | `BowlerCurrentStats.jsx`    | PLAYER_BOWLER          | Match LT            |
| `BOWLER_NAME_FS`         | `PlayerIntro.jsx`           | PLAYER_BOWLER          | Name FS             |
| `BOWLER_NAME_LT`         | `PlayerIntro.jsx`           | PLAYER_BOWLER          | Name LT             |
| `BOWLER_TOURNAMENT_FS`   | `BowlerCareerStats.jsx`     | PLAYER_BOWLER          | Tournament FS       |
| `BOWLER_TOURNAMENT_LT`   | `BowlerCareerStats.jsx`     | PLAYER_BOWLER          | Tournament LT       |
| `BOWLING_SQUAD`          | `BowlerCareerStats.jsx`     | FULL_SCREEN            | Bowling Squad       |
| `BOWLING_SUMMARY`        | `BowlerCareerStats.jsx`     | FULL_SCREEN            | Bowling Summary     |
| `CURRENT_PARTNERSHIP`    | `CurrentPartnership.jsx`    | LOWER_THIRD            | Current Partnership |
| `CURRENT_PARTNERSHIP_FS` | `CurrentPartnership.jsx`    | FULL_SCREEN            | Curr Partnership    |
| `CUSTOM`                 | `GraphicTextCard.jsx`       | CAPTION                | Custom Caption      |
| `DECISION_PENDING`       | `DecisionPending.jsx`       | LOWER_THIRD            | Decision Pending    |
| `DOWNLOAD_PLATFORM`      | `RowTextBanner.jsx`         | LOWER_THIRD            | Download App        |
| `DRINKS`                 | `TeaBreak.jsx`              | BREAK                  | Drinks              |
| `FDR`                    | `TargetNeeded.jsx`          | LOWER_THIRD            | FDR                 |
| `FIFTY`                  | `Fifty.jsx`                 | TRANSITION             | Fifty               |
| `FIFTY_UP`               | `FiftyRow.jsx`              | LOWER_THIRD            | 50 Up               |
| `FOLLOW_PLATFORM`        | `RowTextBanner.jsx`         | LOWER_THIRD            | Follow              |
| `FOUR`                   | `Four.jsx`                  | TRANSITION             | Four                |
| `FST_DECISION`           | `DecisionPendingRow.jsx`    | FULL_SCREEN_TRANSITION | Decision            |
| `FST_FIFTY`              | `FiftyRow.jsx`              | FULL_SCREEN_TRANSITION | 50                  |
| `FST_FOUR`               | `FourRow.jsx`               | FULL_SCREEN_TRANSITION | 4                   |
| `FST_HUNDRED`            | `HundredRow.jsx`            | FULL_SCREEN_TRANSITION | 100                 |
| `FST_NO_BALL`            | `NoBallRow.jsx`             | FULL_SCREEN_TRANSITION | No Ball             |
| `FST_NOT_OUT`            | `NotOutRow.jsx`             | FULL_SCREEN_TRANSITION | Not Out             |
| `FST_OUT`                | `Out.jsx`                   | FULL_SCREEN_TRANSITION | Out                 |
| `FST_REPLAY`             | `ReplayRow.jsx`             | FULL_SCREEN_TRANSITION | Replay              |
| `FST_SIX`                | `SixRow.jsx`                | FULL_SCREEN_TRANSITION | 6                   |
| `FST_WIDE`               | `WideRow.jsx`               | FULL_SCREEN_TRANSITION | Wide                |
| `HIGHEST_FOURS`          | `HighestRuns.jsx`           | TOURNAMENT             | Highest Fours       |
| `HIGHEST_RUNS`           | `HighestRuns.jsx`           | TOURNAMENT             | Highest Runs        |
| `HIGHEST_SIXES`          | `HighestRuns.jsx`           | TOURNAMENT             | Highest Sixes       |
| `HIGHEST_WICKETS`        | `HighestWickets.jsx`        | TOURNAMENT             | Highest Wickets     |
| `HUNDRED`                | `Hundred.jsx`               | TRANSITION             | Hundred             |
| `HUNDRED_UP`             | `HundredRow.jsx`            | LOWER_THIRD            | 100 Up              |
| `INNING_FIGURES`         | `BatsmanInningsStats.jsx`   | FULL_SCREEN            | Inning Figures      |
| `INNINGS_BREAK`          | `InningsBreak.jsx`          | BREAK                  | Innings Break       |
| `INTRO_LT`               | `TournamentIntro.jsx`       | LOWER_THIRD            | Intro LT            |
| `LAST_12_BALLS`          | `LastBalls.jsx`             | LOWER_THIRD            | Last 12 Balls       |
| `LAST_30_BALLS`          | `LastBalls.jsx`             | LOWER_THIRD            | Last 30 Balls       |
| `LAST_WICKET`            | `FallofWickets.jsx`         | LOWER_THIRD            | Last Wicket         |
| `LAST_WICKET_FS`         | `FallofWickets.jsx`         | FULL_SCREEN            | Last Wicket         |
| `LT_DEFAULT`             | `StatsDefault.jsx`          | LOWER_THIRD            | Default             |
| `LT_EMPTY`               | _(no overlay)_              | LOWER_THIRD            | Empty               |
| `LT_FOUR`                | `Four.jsx`                  | LOWER_THIRD            | 4                   |
| `LT_NO_BALL`             | `NoBall.jsx`                | LOWER_THIRD            | No-Ball             |
| `LT_NOT_OUT`             | `NotOut.jsx`                | LOWER_THIRD            | Not Out             |
| `LT_OUT`                 | `Out.jsx`                   | LOWER_THIRD            | Out                 |
| `LT_REPLAY`              | `ReplayRow.jsx`             | LOWER_THIRD            | Replay              |
| `LT_SIX`                 | `Six.jsx`                   | LOWER_THIRD            | 6                   |
| `LT_WIDE`                | `Wide.jsx`                  | LOWER_THIRD            | Wide                |
| `LUNCH_BREAK`            | `TeaBreak.jsx`              | BREAK                  | Lunch Break         |
| `MANHATTAN`              | `ScoreComparisonBar.jsx`    | CHART                  | Manhattan           |
| `MATCH_INFO`             | `TournamentStart.jsx`       | FULL_SCREEN            | Match Info          |
| `MATCH_SUMMARY`          | `CricketMatchSummary.jsx`   | LOWER_THIRD            | Match Summary       |
| `MATCH_SUMMARY_FS`       | `TournamentOver.jsx`        | FULL_SCREEN            | Match Summary       |
| `MINI_SCORECARD`         | `MatchSummary.jsx`          | LOWER_THIRD            | Mini Scorecard      |
| `MOM`                    | `PlayerIntro.jsx`           | FULL_SCREEN            | MOM                 |
| `NEED_TARGET`            | `TargetNeeded.jsx`          | LOWER_THIRD            | Need / Target       |
| `NEED_TARGET_FS`         | `TargetNeeded.jsx`          | FULL_SCREEN            | Need / Target       |
| `NEXT_MATCH`             | `TournamentStart.jsx`       | FULL_SCREEN            | Next Match          |
| `PARTNERSHIP_LIST`       | `CurrentPartnership.jsx`    | FULL_SCREEN            | Partnership List    |
| `PLAYING_11`             | `PlayingXI.jsx`             | FULL_SCREEN            | Playing 11          |
| `PLAYING_ELEVEN_AWAY`    | `PlayingXI.jsx`             | FULL_SCREEN            | Playing 11 (Away)   |
| `PLAYING_ELEVEN_HOME`    | `PlayingXI.jsx`             | FULL_SCREEN            | Playing 11 (Home)   |
| `POINT_TABLE`            | `TournamentOverview.jsx`    | TOURNAMENT             | Points Table        |
| `PREVIOUS_OVER`          | `PreviousOrder.jsx`         | LOWER_THIRD            | Previous Over       |
| `RAIN`                   | `TeaBreak.jsx`              | BREAK                  | Rain                |
| `RAIN_STOPPED`           | `TeaBreak.jsx`              | BREAK                  | Rain Stopped        |
| `REPLAY`                 | `Replay.jsx`                | TRANSITION             | Replay              |
| `RESULT_LT`              | `ResultIntro.jsx`           | LOWER_THIRD            | Result LT           |
| `RUN_RATE`               | `RunRate.jsx`               | LOWER_THIRD            | Run Rate            |
| `RUN_RATE_CHART`         | `RunRateChart.jsx`          | CHART                  | Run Rate            |
| `SCORECARD_FULL`         | `TournamentStart.jsx`       | FULL_SCREEN            | Full Scorecard      |
| `SELECT_DRAW`            | `TournamentOverview.jsx`    | TOURNAMENT             | Select Draw         |
| `SIX`                    | `Six.jsx`                   | TRANSITION             | Six                 |
| `STRATEGIC_TIMEOUT`      | `TeaBreak.jsx`              | BREAK                  | Strategic Timeout   |
| `TEA_BREAK`              | `TeaBreak.jsx`              | BREAK                  | Tea Break           |
| `THIS_MATCH`             | `TournamentStart.jsx`       | FULL_SCREEN            | This Match          |
| `THIS_OVER`              | `LastBalls.jsx`             | LOWER_THIRD            | This Over           |
| `TOP_BATTER`             | `HighestRuns.jsx`           | FULL_SCREEN            | Top Batter          |
| `TOP_BOWLER`             | `HighestWickets.jsx`        | FULL_SCREEN            | Top Bowler          |
| `TOSS_LT`                | `Toss.jsx`                  | LOWER_THIRD            | Toss LT             |
| `TOUR_FIFTIES`           | `PlayerTournamentStats.jsx` | TOUR_HITS              |                     |
| `TOUR_FOURS`             | `PlayerTournamentStats.jsx` | TOUR_HITS              |                     |
| `TOUR_HUNDREDS`          | `PlayerTournamentStats.jsx` | TOUR_HITS              |                     |
| `TOUR_RUNS`              | `PlayerTournamentStats.jsx` | TOUR_HITS              | Runs                |
| `TOUR_SIXES`             | `PlayerTournamentStats.jsx` | TOUR_HITS              |                     |
| `TOUR_WICKETS`           | `PlayerTournamentStats.jsx` | TOUR_HITS              | Wickets             |
| `TOURNAMENT_NAME`        | `TournamentOverview.jsx`    | LOWER_THIRD            | Tournament Name     |
| `WICKET`                 | `WicketRow.jsx`             | TRANSITION             | Wicket              |
| `WIN_PREDICTION`         | `WinPredictor.jsx`          | LOWER_THIRD            | Win Prediction      |
| `WORM`                   | `ScoreComparison.jsx`       | CHART                  | Worm Chart          |
