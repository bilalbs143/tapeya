/**
 * Detailed match data for ScorecardStatusDetails page - replace with API later.
 * Keyed by match id from MOCK_MATCHES.
 */

// Live match details (matches id: 2 TSL, id: 5 KTPL)
// Over-by-over: each over has runs/wickets for that over and running total
const OVERS_MOCK = [
  { over: 1, team1: { runs: 10, wickets: 0 }, team2: { runs: 5, wickets: 0 } },
  { over: 2, team1: { runs: 10, wickets: 0 }, team2: { runs: 5, wickets: 0 } },
  { over: 3, team1: { runs: 10, wickets: 0 }, team2: { runs: 5, wickets: 0 } },
  { over: 4, team1: { runs: 10, wickets: 0 }, team2: { runs: 5, wickets: 0 } },
  { over: 5, team1: { runs: 10, wickets: 0 }, team2: { runs: 5, wickets: 0 } },
];

const PLAYING_XI_2 = {
  team1: [
    { name: 'Aaron George', role: 'Top-order Batter' },
    { name: 'Sam Curran', role: 'Allrounder' },
    { name: 'Harry Brook', role: 'Middle-order Batter' },
    { name: 'Brooke Halliday', role: 'Bowler' },
    { name: 'Lauren Down', role: 'Batter' },
    { name: 'Bella Armstrong', role: 'Batter' },
    { name: 'Alex Carey', role: 'Wicketkeeper' },
    { name: 'Imad Wasim', role: 'Allrounder' },
    { name: 'Shaheen Afridi', role: 'Bowler' },
    { name: 'Mohammad Amir', role: 'Bowler' },
    { name: 'Shan Masood', role: 'Top-order Batter' },
    { name: 'Asif Ali', role: 'Bowler' },
    { name: 'Khurram Manzoor', role: 'Bowler' },
    { name: 'Anwar Ali', role: 'Allrounder' },
    { name: 'Sohail Khan', role: 'Allrounder' },
  ],
  team2: [
    { name: 'Hamza Zahoor', role: 'Wicketkeeper' },
    { name: 'Aiden Markram', role: 'Top-order Batter' },
    { name: 'Andre Russell', role: 'Allrounder' },
    { name: 'David Warner', role: 'Batter' },
    { name: 'Glenn Maxwell', role: 'Allrounder' },
    { name: 'Dasun Shanaka', role: 'Bowler' },
    { name: 'Adil Rashid', role: 'Bowler' },
    { name: 'Babar Azam', role: 'Top-order Batter' },
    { name: 'Mohammad Rizwan', role: 'Wicketkeeper' },
    { name: 'Shadab Khan', role: 'Allrounder' },
    { name: 'Hasan Ali', role: 'Bowler' },
    { name: 'Faheem Ashraf', role: 'Allrounder' },
    { name: 'Haris Rauf', role: 'Bowler' },
    { name: 'Usman Qadir', role: 'Bowler' },
    { name: 'Iftikhar Ahmed', role: 'Allrounder' },
  ],
};

const LIVE_DETAILS_2 = {
  crr: '6.55',
  rrr: '9.90',
  winProb: { team1: 16.44, team2: 83.56 },
  batters: [
    { name: 'Harry Brook', r: 2, b: 3, fours: 6, sixes: 1, sr: '4.00' },
    { name: 'Sam Curran', r: 1, b: 2, fours: 3, sixes: 1, sr: '4.00' },
  ],
  bowlers: [
    { name: 'Dasun Shanaka', o: 2, m: 3, r: 6, w: 1 },
    { name: 'Adil Rashid', o: 1, m: 2, r: 3, w: 1 },
  ],
  partnership: '2 Runs, 2 B (RR: 6)',
  teams: [
    {
      name: 'Karachi Kids',
      batting: [
        { name: 'Harry Brook', dismissal: 'not out', r: 2, b: 3, fours: 6, sixes: 1, sr: '4.00' },
        { name: 'Sam Curran', dismissal: 'not out', r: 1, b: 2, fours: 3, sixes: 1, sr: '4.00' },
      ],
      extras: { runs: 0, detail: '-' },
      total: { score: '234/7', summary: '50 Ov (RR: 4.68)' },
    },
    {
      name: 'Rawalpindi Royals',
      batting: [
        { name: 'Harry Brook', dismissal: 'not out', r: 2, b: 3, fours: 6, sixes: 1, sr: '4.00' },
        { name: 'Sam Curran', dismissal: 'not out', r: 1, b: 2, fours: 3, sixes: 1, sr: '4.00' },
      ],
      extras: { runs: 0, detail: '-' },
      total: { score: '27/1', summary: '4.4 Ov (RR: 6.55, T:235)' },
    },
  ],
  playingXI: PLAYING_XI_2,
  overs: OVERS_MOCK,
};

const LIVE_DETAILS_5 = {
  crr: '7.80',
  rrr: '8.50',
  winProb: { team1: 42.0, team2: 58.0 },
  batters: [
    { name: 'David Warner', r: 34, b: 22, fours: 4, sixes: 2, sr: '154.5' },
    { name: 'Glenn Maxwell', r: 18, b: 14, fours: 1, sixes: 1, sr: '128.6' },
  ],
  bowlers: [
    { name: 'Andre Russell', o: 3, m: 0, r: 24, w: 2 },
    { name: 'Ben Stokes', o: 2, m: 0, r: 18, w: 1 },
  ],
  partnership: '38 Runs, 24 B (RR: 9.5)',
  teams: [
    {
      name: 'Karachi Kids',
      batting: [
        { name: 'David Warner', dismissal: 'not out', r: 34, b: 22, fours: 4, sixes: 2, sr: '154.5' },
        { name: 'Glenn Maxwell', dismissal: 'not out', r: 18, b: 14, fours: 1, sixes: 1, sr: '128.6' },
      ],
      extras: { runs: 0, detail: '-' },
      total: { score: '156/3', summary: '12 Ov (RR: 13.00)' },
    },
    {
      name: 'Rawalpindi Royals',
      batting: [
        { name: 'David Warner', dismissal: 'not out', r: 34, b: 22, fours: 4, sixes: 2, sr: '154.5' },
        { name: 'Glenn Maxwell', dismissal: 'not out', r: 18, b: 14, fours: 1, sixes: 1, sr: '128.6' },
      ],
      extras: { runs: 0, detail: '-' },
      total: { score: '89/2', summary: '12 Ov (RR: 7.42, T:157)' },
    },
  ],
  playingXI: PLAYING_XI_2,
  overs: OVERS_MOCK,
};

// Live match details (match id: 7 DPL)
const LIVE_DETAILS_7 = {
  crr: '7.80',
  rrr: '7.00',
  winProb: { team1: 72.0, team2: 28.0 },
  batters: [
    { name: 'Alex Carey', r: 45, b: 32, fours: 5, sixes: 2, sr: '140.6' },
    { name: 'Aiden Markram', r: 22, b: 18, fours: 2, sixes: 1, sr: '122.2' },
  ],
  bowlers: [
    { name: 'Sam Curran', o: 3, m: 0, r: 22, w: 2 },
    { name: 'Brooke Halliday', o: 2, m: 0, r: 15, w: 1 },
  ],
  partnership: '52 Runs, 38 B (RR: 8.2)',
  teams: [
    {
      name: 'Karachi Kids',
      batting: [
        { name: 'Alex Carey', dismissal: 'not out', r: 45, b: 32, fours: 5, sixes: 2, sr: '140.6' },
        { name: 'Aiden Markram', dismissal: 'not out', r: 22, b: 18, fours: 2, sixes: 1, sr: '122.2' },
      ],
      extras: { runs: 0, detail: '-' },
      total: { score: '112/4', summary: '10 Ov (RR: 11.20)' },
    },
    {
      name: 'Rawalpindi Royals',
      batting: [
        { name: 'Alex Carey', dismissal: 'not out', r: 45, b: 32, fours: 5, sixes: 2, sr: '140.6' },
        { name: 'Aiden Markram', dismissal: 'not out', r: 22, b: 18, fours: 2, sixes: 1, sr: '122.2' },
      ],
      extras: { runs: 0, detail: '-' },
      total: { score: '78/3', summary: '10 Ov (RR: 7.80, T:113)' },
    },
  ],
  playingXI: PLAYING_XI_2,
  overs: OVERS_MOCK,
};

// Result match details (matches id: 3 DPL, id: 6 DMT)
const RESULT_DETAILS_3 = {
  resultText: 'Rawalpindi Royals won by 29 runs.',
  resultHighlight: '29 runs',
  teams: [
    {
      name: 'Karachi Kids',
      batting: [
        { name: 'Harry Brook', dismissal: 'c Burns b Jetly', r: 2, b: 3, fours: 6, sixes: 6, sr: '6.00' },
        { name: 'Sam Curran', dismissal: 'st \u2020McFadyen b Simmons', r: 1, b: 2, fours: 3, sixes: 3, sr: '3.00' },
        { name: 'Brooke Halliday', dismissal: 'b Jetlys', r: 1, b: 2, fours: 3, sixes: 3, sr: '3.00' },
        { name: 'Lauren Down', dismissal: 'b Kerr', r: 1, b: 2, fours: 3, sixes: 3, sr: '3.00' },
        { name: 'Bella Armstrong', dismissal: 'not out', r: 1, b: 2, fours: 3, sixes: 3, sr: '3.00' },
      ],
      extras: { runs: 4, detail: 'w 4' },
      total: { score: '146/5', summary: '20 Ov (RR: 7.30, 86 Mins)' },
    },
    {
      name: 'Rawalpindi Royals',
      batting: [
        { name: 'Alex Carey', dismissal: 'b Stokes', r: 45, b: 32, fours: 5, sixes: 2, sr: '140.6' },
        { name: 'Aiden Markram', dismissal: 'not out', r: 67, b: 44, fours: 6, sixes: 3, sr: '152.3' },
        { name: 'Andre Russell', dismissal: 'c Brook b Curran', r: 18, b: 10, fours: 1, sixes: 2, sr: '180.0' },
        { name: 'David Warner', dismissal: 'b Halliday', r: 12, b: 9, fours: 2, sixes: 0, sr: '133.3' },
        { name: 'Glenn Maxwell', dismissal: 'not out', r: 8, b: 5, fours: 1, sixes: 0, sr: '160.0' },
      ],
      extras: { runs: 3, detail: 'w 3' },
      total: { score: '175/3', summary: '19.2 Ov (RR: 9.05, 72 Mins)' },
    },
  ],
  playingXI: PLAYING_XI_2,
  overs: OVERS_MOCK,
};

const RESULT_DETAILS_6 = {
  resultText: 'Rawalpindi Royals won by 5 wickets.',
  resultHighlight: '5 wickets',
  teams: [
    {
      name: 'Karachi Kids',
      batting: [
        { name: 'Harry Brook', dismissal: 'c Carey b Russell', r: 52, b: 38, fours: 6, sixes: 2, sr: '136.8' },
        { name: 'Sam Curran', dismissal: 'b Maxwell', r: 34, b: 28, fours: 3, sixes: 1, sr: '121.4' },
        { name: 'Brooke Halliday', dismissal: 'run out (Warner)', r: 28, b: 22, fours: 2, sixes: 1, sr: '127.3' },
        { name: 'Lauren Down', dismissal: 'c Markram b Stokes', r: 44, b: 30, fours: 4, sixes: 2, sr: '146.7' },
        { name: 'Bella Armstrong', dismissal: 'not out', r: 28, b: 18, fours: 3, sixes: 0, sr: '155.6' },
      ],
      extras: { runs: 12, detail: 'b 2, lb 4, w 6' },
      total: { score: '198/9', summary: '20 Ov (RR: 9.90, 95 Mins)' },
    },
    {
      name: 'Rawalpindi Royals',
      batting: [
        { name: 'Alex Carey', dismissal: 'b Armstrong', r: 48, b: 35, fours: 4, sixes: 2, sr: '137.1' },
        { name: 'Aiden Markram', dismissal: 'not out', r: 78, b: 48, fours: 7, sixes: 4, sr: '162.5' },
        { name: 'Andre Russell', dismissal: 'c Brook b Curran', r: 32, b: 18, fours: 2, sixes: 3, sr: '177.8' },
        { name: 'David Warner', dismissal: 'b Down', r: 14, b: 11, fours: 1, sixes: 1, sr: '127.3' },
        { name: 'Glenn Maxwell', dismissal: 'not out', r: 22, b: 14, fours: 2, sixes: 1, sr: '157.1' },
      ],
      extras: { runs: 8, detail: 'lb 2, w 6' },
      total: { score: '202/5', summary: '18.2 Ov (RR: 11.02, 88 Mins)' },
    },
  ],
  playingXI: PLAYING_XI_2,
  overs: OVERS_MOCK,
};

// Upcoming matches: only playing XI available (no scorecard yet)
const UPCOMING_DETAILS = { playingXI: PLAYING_XI_2 };

export const MOCK_MATCH_DETAILS = {
  1: UPCOMING_DETAILS,
  2: LIVE_DETAILS_2,
  3: RESULT_DETAILS_3,
  4: UPCOMING_DETAILS,
  5: LIVE_DETAILS_5,
  6: RESULT_DETAILS_6,
  7: LIVE_DETAILS_7,
};
