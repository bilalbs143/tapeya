/**
 * Dial code → ISO 3166-1 alpha-2.
 * Exported so phoneMetadata.js can build the country picker list without duplicating data.
 */
export const DIAL_TO_COUNTRY = {
  963: 'SY',
  964: 'IQ',
  965: 'KW',
  966: 'SA',
  967: 'YE',
  968: 'OM',
  970: 'PS',
  971: 'AE',
  972: 'IL',
  973: 'BH',
  974: 'QA',
  975: 'BT',
  976: 'MN',
  977: 'NP',
  992: 'TJ',
  993: 'TM',
  994: 'AZ',
  995: 'GE',
  996: 'KG',
  998: 'UZ',
  880: 'BD',
  886: 'TW',
  855: 'KH',
  856: 'LA',
  852: 'HK',
  853: 'MO',
  850: 'KP',
  213: 'DZ',
  212: 'MA',
  216: 'TN',
  218: 'LY',
  220: 'GM',
  221: 'SN',
  222: 'MR',
  223: 'ML',
  224: 'GN',
  225: 'CI',
  226: 'BF',
  227: 'NE',
  228: 'TG',
  229: 'BJ',
  230: 'MU',
  231: 'LR',
  232: 'SL',
  233: 'GH',
  234: 'NG',
  235: 'TD',
  236: 'CF',
  237: 'CM',
  238: 'CV',
  239: 'ST',
  240: 'GQ',
  241: 'GA',
  242: 'CG',
  243: 'CD',
  244: 'AO',
  245: 'GW',
  248: 'SC',
  249: 'SD',
  250: 'RW',
  251: 'ET',
  252: 'SO',
  253: 'DJ',
  254: 'KE',
  255: 'TZ',
  256: 'UG',
  257: 'BI',
  258: 'MZ',
  260: 'ZM',
  261: 'MG',
  263: 'ZW',
  264: 'NA',
  265: 'MW',
  266: 'LS',
  267: 'BW',
  268: 'SZ',
  269: 'KM',
  351: 'PT',
  352: 'LU',
  353: 'IE',
  354: 'IS',
  355: 'AL',
  356: 'MT',
  357: 'CY',
  358: 'FI',
  359: 'BG',
  370: 'LT',
  371: 'LV',
  372: 'EE',
  373: 'MD',
  374: 'AM',
  375: 'BY',
  376: 'AD',
  377: 'MC',
  378: 'SM',
  380: 'UA',
  381: 'RS',
  382: 'ME',
  383: 'XK',
  385: 'HR',
  386: 'SI',
  387: 'BA',
  389: 'MK',
  420: 'CZ',
  421: 'SK',
  423: 'LI',
  591: 'BO',
  592: 'GY',
  593: 'EC',
  594: 'GF',
  595: 'PY',
  596: 'MQ',
  597: 'SR',
  598: 'UY',
  599: 'CW',
  673: 'BN',
  674: 'NR',
  675: 'PG',
  676: 'TO',
  677: 'SB',
  678: 'VU',
  679: 'FJ',
  685: 'WS',
  686: 'KI',
  687: 'NC',
  688: 'TV',
  689: 'PF',
  691: 'FM',
  692: 'MH',
  960: 'MV',
  961: 'LB',
  962: 'JO',
  93: 'AF',
  94: 'LK',
  95: 'MM',
  98: 'IR',
  20: 'EG',
  27: 'ZA',
  30: 'GR',
  31: 'NL',
  32: 'BE',
  33: 'FR',
  34: 'ES',
  36: 'HU',
  39: 'IT',
  40: 'RO',
  41: 'CH',
  43: 'AT',
  44: 'GB',
  45: 'DK',
  46: 'SE',
  47: 'NO',
  48: 'PL',
  49: 'DE',
  51: 'PE',
  52: 'MX',
  53: 'CU',
  54: 'AR',
  55: 'BR',
  56: 'CL',
  57: 'CO',
  58: 'VE',
  60: 'MY',
  61: 'AU',
  62: 'ID',
  63: 'PH',
  64: 'NZ',
  65: 'SG',
  66: 'TH',
  81: 'JP',
  82: 'KR',
  84: 'VN',
  86: 'CN',
  90: 'TR',
  91: 'IN',
  92: 'PK',
  7: 'RU',
  1: 'US',
};

const DIAL_ENTRIES = Object.entries(DIAL_TO_COUNTRY).sort(
  (a, b) => b[0].length - a[0].length,
);

export function getCountryFromDialDigits(digits) {
  if (!digits || typeof digits !== 'string') return null;
  const d = digits.replace(/\D/g, '');
  for (const [code, country] of DIAL_ENTRIES) {
    if (d.startsWith(code)) return country;
  }
  return null;
}

export function getFlagEmoji(iso) {
  if (!iso || iso.length !== 2) return '';
  return [...iso.toUpperCase()]
    .map((c) => String.fromCodePoint(0x1f1e6 - 65 + c.charCodeAt(0)))
    .join('');
}

/**
 * Split an E.164 value into its country dial code and subscriber number.
 * Uses longest-match against DIAL_ENTRIES so "+923216516130" → { dialCode: "92", subscriber: "3216516130" }.
 * Falls back to dialCode "92" (Pakistan) when no code matches — safe default for the app's primary market.
 *
 * @param {string} value E.164 string (e.g. "+923216516130") or partial (e.g. "+92")
 * @returns {{ dialCode: string, subscriber: string }}
 */
export function parseE164Phone(value) {
  const digits = String(value || '').replace(/\D/g, '');
  if (!digits) return { dialCode: '92', subscriber: '' };

  for (const [code] of DIAL_ENTRIES) {
    if (digits.startsWith(code)) {
      return { dialCode: code, subscriber: digits.slice(code.length) };
    }
  }

  return { dialCode: '92', subscriber: digits };
}

/**
 * Normalize a raw phone input to E.164 format.
 *
 * Strips non-digit characters, then uses the known dial-code table (longest
 * match first) to locate the country code. If the subscriber portion starts
 * with a trunk zero — the common mistake of entering "+920321…" instead of
 * "+92321…" — that zero is removed.
 *
 * @param {string} value Raw phone string (e.g. "+9203216516130", "009203216516130")
 * @returns {string} Normalized E.164 string starting with "+"
 */
export function normalizePhoneE164(value) {
  if (!value) return '';
  const digits = String(value).replace(/\D/g, '');
  if (!digits) return '+';

  for (const [code] of DIAL_ENTRIES) {
    if (digits.startsWith(code)) {
      const subscriber = digits.slice(code.length);
      if (subscriber.startsWith('0')) {
        return `+${code}${subscriber.slice(1)}`;
      }
      return `+${digits}`;
    }
  }

  // No matching country code — strip non-digits only.
  return `+${digits}`;
}
