import type { User } from 'src/app/services/users.service';

/** List row that may be a client-only fake (never POSTed to the API). */
export type PlayerListRow = User & { is_fake?: boolean };

export const FAKE_PLAYERS_COUNT = 7_000;

const FIRST_NAMES = [
  'Abbas',
  'Abdul',
  'Abdullah',
  'Abid',
  'Adil',
  'Adnan',
  'Aftab',
  'Ahmad',
  'Ahmed',
  'Ahsan',
  'Akbar',
  'Akram',
  'Alam',
  'Ali',
  'Amir',
  'Amjad',
  'Anas',
  'Anwar',
  'Aqib',
  'Arif',
  'Arsalan',
  'Asad',
  'Asghar',
  'Ashraf',
  'Asif',
  'Atif',
  'Ayan',
  'Azeem',
  'Azhar',
  'Babar',
  'Badar',
  'Basit',
  'Bilal',
  'Danish',
  'Daniyal',
  'Ehsan',
  'Fahad',
  'Faheem',
  'Faizan',
  'Faisal',
  'Farhan',
  'Farooq',
  'Fawad',
  'Furqan',
  'Ghulam',
  'Haider',
  'Hammad',
  'Hamza',
  'Haris',
  'Haroon',
  'Hasnain',
  'Hassan',
  'Hussain',
  'Ibrahim',
  'Iftikhar',
  'Ikram',
  'Imran',
  'Imtiaz',
  'Inam',
  'Iqbal',
  'Irfan',
  'Ismail',
  'Jameel',
  'Javed',
  'Jawad',
  'Jibran',
  'Junaid',
  'Kabir',
  'Kamran',
  'Kashif',
  'Khalid',
  'Khurram',
  'Latif',
  'Maaz',
  'Majid',
  'Mansoor',
  'Mehmood',
  'Moin',
  'Mubashir',
  'Mudassar',
  'Muhammad',
  'Muneeb',
  'Mushtaq',
  'Mustafa',
  'Nadeem',
  'Naeem',
  'Naseem',
  'Nasir',
  'Naveed',
  'Noman',
  'Omar',
  'Owais',
  'Qamar',
  'Qasim',
  'Rafay',
  'Rafiq',
  'Raheel',
  'Rashid',
  'Raza',
  'Rehan',
  'Rizwan',
  'Rohail',
  'Saad',
  'Saeed',
  'Sajid',
  'Sajjad',
  'Saleem',
  'Salman',
  'Sameer',
  'Sami',
  'Saqib',
  'Shafiq',
  'Shahbaz',
  'Shahid',
  'Shahzaib',
  'Shakeel',
  'Shan',
  'Shayan',
  'Sheraz',
  'Shoaib',
  'Sohail',
  'Suleman',
  'Taha',
  'Tahir',
  'Talha',
  'Tariq',
  'Ubaid',
  'Umar',
  'Usama',
  'Usman',
  'Wahab',
  'Waleed',
  'Waqar',
  'Waqas',
  'Yahya',
  'Yasir',
  'Yousuf',
  'Zain',
  'Zeeshan',
  'Zohaib',
  'Zubair',
] as const;

const LAST_NAMES = [
  'Abbasi',
  'Afridi',
  'Ahmad',
  'Ahmed',
  'Akhtar',
  'Akram',
  'Ali',
  'Ansari',
  'Anwar',
  'Arain',
  'Ashraf',
  'Aslam',
  'Awan',
  'Azam',
  'Baig',
  'Baloch',
  'Bari',
  'Bhatti',
  'Bhutto',
  'Bukhari',
  'Butt',
  'Chaudhry',
  'Cheema',
  'Chohan',
  'Dar',
  'Dogar',
  'Durrani',
  'Farooq',
  'Ghafoor',
  'Ghouri',
  'Gill',
  'Gilani',
  'Gul',
  'Hameed',
  'Hashmi',
  'Hayat',
  'Hussain',
  'Iqbal',
  'Janjua',
  'Jatoi',
  'Javed',
  'Jutt',
  'Kakar',
  'Karim',
  'Kashmiri',
  'Khalid',
  'Khan',
  'Khokhar',
  'Khoso',
  'Lashari',
  'Leghari',
  'Lodhi',
  'Mahmood',
  'Malik',
  'Manzoor',
  'Mehmood',
  'Memon',
  'Minhas',
  'Mir',
  'Mirza',
  'Mughal',
  'Nadeem',
  'Naqvi',
  'Nawaz',
  'Noor',
  'Paracha',
  'Pathan',
  'Pirzada',
  'Qadir',
  'Qureshi',
  'Rafique',
  'Rajpoot',
  'Rana',
  'Rashid',
  'Rauf',
  'Raza',
  'Rehman',
  'Rizvi',
  'Saeed',
  'Saleem',
  'Sandhu',
  'Shah',
  'Shaikh',
  'Sheikh',
  'Sherazi',
  'Siddiqui',
  'Sindhu',
  'Sultan',
  'Syed',
  'Tariq',
  'Toor',
  'Usmani',
  'Warraich',
  'Wattoo',
  'Yousaf',
  'Zafar',
  'Zahid',
  'Zaman',
  'Zia',
] as const;

const PLAYING_ROLES = ['Batsman', 'Bowler', 'All-rounder', 'Wicket-keeper'] as const;
const BOWLING_STYLES = ['Right-arm Fast', 'Left-arm Spin', 'Right-arm Medium'] as const;
const BATTING_STYLES = ['Right-hand Bat', 'Left-hand Bat'] as const;

const CITIES = [
  'Karachi',
  'Lahore',
  'Islamabad',
  'Rawalpindi',
  'Faisalabad',
  'Multan',
  'Peshawar',
  'Quetta',
  'Hyderabad',
  'Sialkot',
  'Murree',
  'Hasilpur',
  'Bahawalpur',
  'Abbottabad',
  'Gujranwala',
  'Gujrat',
  'Sargodha',
  'Sahiwal',
  'Okara',
  'Sheikhupura',
  'Jhelum',
  'Attock',
  'Mardan',
  'Swat',
  'Gilgit',
  'Skardu',
  'Sukkur',
  'Larkana',
  'Nawabshah',
  'Mirpur',
  'Muzaffarabad',
  'Dera Ghazi Khan',
  'Dera Ismail Khan',
  'Rahim Yar Khan',
  'Kasur',
  'Vehari',
  'Chiniot',
  'Jhang',
  'Mansehra',
  'Kohat',
] as const;

/** Jazz / Zong / Ufone / Telenor mobile codes. */
const PK_MOBILE_PREFIXES: string[] = [
  ...rangeCodes(300, 309),
  ...rangeCodes(310, 319),
  ...rangeCodes(320, 329),
  ...rangeCodes(330, 337),
  ...rangeCodes(340, 349),
];

export function isFakePlayer(row: PlayerListRow): boolean {
  return row.is_fake === true || row.id < 0;
}

function rangeCodes(from: number, to: number): string[] {
  const out: string[] = [];
  for (let i = from; i <= to; i++) out.push(String(i));
  return out;
}

function pick(n: number, salt: number, mod: number): number {
  return Math.abs((n * 2654435761 + salt * 40503) | 0) % mod;
}

function oneOf<T>(n: number, salt: number, items: readonly T[]): T {
  return items[pick(n, salt, items.length)];
}

function phoneFrom(n: number): string {
  return `+92${oneOf(n, 31, PK_MOBILE_PREFIXES)}${String(pick(n, 32, 10_000_000)).padStart(7, '0')}`;
}

/** No spaces. First / last / combo / trailing digits. */
function nicknameFrom(first: string, last: string, n: number): string {
  const d2 = String(10 + pick(n, 11, 90));
  const d3 = String(100 + pick(n, 12, 900));
  return oneOf(n, 13, [
    first,
    last,
    `${first}${last}`,
    `${first}${last[0]}`,
    `${first}${d3}`,
    `${last}${d2}`,
    `${first}${last[0]}${d2}`,
    `${first[0]}${last}`,
    `${first}${d2}${last[0]}`,
    `${last}${first[0]}${d2}`,
  ]).slice(0, 50);
}

/** Name-based Gmail: kamran.pk129, hussain.raza786, kamran_iqbal42, … */
function gmailFromName(first: string, last: string, n: number): string {
  const f = first.toLowerCase();
  const l = last.toLowerCase();
  const d2 = String(10 + pick(n, 1, 90));
  const d3 = String(100 + pick(n, 2, 900));
  const local = oneOf(n, 3, [
    `${f}.pk${d3}`,
    `${l}.${f}${d3}`,
    `${f}_${l}${d2}`,
    `${f}.${l}.${d2}`,
    `${f}${d3}${l}`,
    `${f}.${l}${d3}`,
    `${l}_${f}_${d2}`,
    `${f[0]}.${l}${d3}`,
    `${f}_pk${d3}`,
    `${l}.${f}.${d3}`,
  ]);
  return `${local}@gmail.com`;
}

/**
 * Client-only fake players (never written to DB).
 * Deterministic aside from last_active_at (anchored to Date.now() so "ago" stays fresh).
 * Order: newer first → oldest last (so after reals, oldest fakes sit at the bottom).
 */
export function generateFakePlayers(count = FAKE_PLAYERS_COUNT): PlayerListRow[] {
  const rows: PlayerListRow[] = new Array(count);
  const baseMs = Date.UTC(2020, 0, 1, 12, 0, 0);
  const nowMs = Date.now();

  for (let n = 1; n <= count; n++) {
    rows[n - 1] = buildFakePlayer(n, count, baseMs, nowMs);
  }

  return rows;
}

function buildFakePlayer(n: number, count: number, baseMs: number, nowMs: number): PlayerListRow {
  const createdIso = new Date(baseMs + (count - n) * 86_400_000).toISOString();
  const first = oneOf(n, 21, FIRST_NAMES);
  const last = oneOf(n, 22, LAST_NAMES);
  const unfinished = pick(n, 40, 100) < 40;

  let playingRole: string | null = oneOf(n, 24, PLAYING_ROLES);
  let bowlingStyle: string | null = oneOf(n, 25, BOWLING_STYLES);
  let battingStyle: string | null = oneOf(n, 26, BATTING_STYLES);
  let city: string | null = oneOf(n, 23, CITIES);
  let country: string | null = 'Pakistan';
  let email: string | null = pick(n, 5, 5) === 0 ? null : gmailFromName(first, last, n);

  if (unfinished) {
    const gap = pick(n, 42, 4);
    if (gap <= 1) {
      playingRole = null;
      bowlingStyle = null;
      battingStyle = null;
    } else if (gap === 2) {
      playingRole = null;
      bowlingStyle = null;
    } else {
      playingRole = null;
    }
    if (gap === 0) city = null;
    if (pick(n, 44, 100) < 25) country = null;
    if (pick(n, 41, 100) < 60) email = null;
  }

  return {
    id: -n,
    is_fake: true,
    name: `${first} ${last}`,
    nickname: nicknameFrom(first, last, n),
    email,
    phone: phoneFrom(n),
    date_of_birth: null,
    type: 'user',
    type_enum: 'user',
    status: 'Active',
    status_enum: 'active',
    playing_role: playingRole,
    playing_role_enum: playingRole ? playingRole.toLowerCase().replace(/\s+/g, '_') : null,
    bowling_style: bowlingStyle,
    batting_style: battingStyle,
    country,
    city,
    active_platform: null,
    active_platform_label: null,
    last_active_at:
      pick(n, 52, 10) === 0 ? null : new Date(nowMs - pick(n, 50, 45) * 86_400_000 - pick(n, 51, 86_400_000)).toISOString(),
    can_broadcast: false,
    is_official: false,
    created_at: createdIso,
    updated_at: createdIso,
  };
}

const FAKE_CHUNK = 500;

let moduleFakeCache: PlayerListRow[] | null = null;
let moduleFakeInflight: Promise<PlayerListRow[]> | null = null;

/** Module-level cache — survives navigation; builds in idle chunks so the UI stays responsive. */
export function ensureFakePlayersCached(count = FAKE_PLAYERS_COUNT): Promise<PlayerListRow[]> {
  if (moduleFakeCache) return Promise.resolve(moduleFakeCache);
  if (moduleFakeInflight) return moduleFakeInflight;

  moduleFakeInflight = new Promise((resolve) => {
    const rows: PlayerListRow[] = new Array(count);
    const baseMs = Date.UTC(2020, 0, 1, 12, 0, 0);
    const nowMs = Date.now();
    let n = 1;

    const step = () => {
      const end = Math.min(n + FAKE_CHUNK - 1, count);
      for (; n <= end; n++) {
        rows[n - 1] = buildFakePlayer(n, count, baseMs, nowMs);
      }
      if (n <= count) {
        setTimeout(step, 0);
        return;
      }
      moduleFakeCache = rows;
      moduleFakeInflight = null;
      resolve(rows);
    };

    setTimeout(step, 0);
  });

  return moduleFakeInflight;
}
