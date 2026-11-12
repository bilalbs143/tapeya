/** Production API — `VerifyOtpRequest` is `size:4`. Do not “modernise” to 6. */
export const OTP_LENGTH = 4;
export const RESEND_SECONDS = 60;
export const NICK_MAX = 50;

export type CountryDialInfo = {
  code: string;
  dial: string;
  flag: string;
  name: string;
  /** National significant number example (no trunk 0, no dial code). */
  placeholder: string;
  /** Min national digits after stripping a leading 0. */
  nsnMin: number;
  /** Max national digits (input is capped here). */
  nsnMax: number;
};

/**
 * Dial codes for phone inputs — aligned with legacy `app/src/lib/phoneCodes.js`.
 * Pakistan stays first (default). US and Canada both use `+1` (picker keys on ISO code).
 * Omits microstates, tiny Pacific islands, overseas departments, and North Korea.
 * `nsnMin`/`nsnMax` are typical mobile lengths (no trunk 0).
 */
export const COUNTRIES: readonly CountryDialInfo[] = [
  { code: 'PK', dial: '+92', flag: '🇵🇰', name: 'Pakistan', placeholder: '300 1234567', nsnMin: 10, nsnMax: 10 },
  { code: 'AF', dial: '+93', flag: '🇦🇫', name: 'Afghanistan', placeholder: '70 123 4567', nsnMin: 9, nsnMax: 9 },
  { code: 'AL', dial: '+355', flag: '🇦🇱', name: 'Albania', placeholder: '67 212 3456', nsnMin: 9, nsnMax: 9 },
  { code: 'DZ', dial: '+213', flag: '🇩🇿', name: 'Algeria', placeholder: '551 23 45 67', nsnMin: 9, nsnMax: 9 },
  { code: 'AO', dial: '+244', flag: '🇦🇴', name: 'Angola', placeholder: '923 123 456', nsnMin: 9, nsnMax: 9 },
  { code: 'AR', dial: '+54', flag: '🇦🇷', name: 'Argentina', placeholder: '11 2345 6789', nsnMin: 10, nsnMax: 10 },
  { code: 'AM', dial: '+374', flag: '🇦🇲', name: 'Armenia', placeholder: '91 123456', nsnMin: 8, nsnMax: 8 },
  { code: 'AU', dial: '+61', flag: '🇦🇺', name: 'Australia', placeholder: '412 345 678', nsnMin: 9, nsnMax: 9 },
  { code: 'AT', dial: '+43', flag: '🇦🇹', name: 'Austria', placeholder: '664 1234567', nsnMin: 10, nsnMax: 13 },
  { code: 'AZ', dial: '+994', flag: '🇦🇿', name: 'Azerbaijan', placeholder: '40 123 45 67', nsnMin: 9, nsnMax: 9 },
  { code: 'BH', dial: '+973', flag: '🇧🇭', name: 'Bahrain', placeholder: '3600 1234', nsnMin: 8, nsnMax: 8 },
  { code: 'BD', dial: '+880', flag: '🇧🇩', name: 'Bangladesh', placeholder: '1712 345678', nsnMin: 10, nsnMax: 10 },
  { code: 'BY', dial: '+375', flag: '🇧🇾', name: 'Belarus', placeholder: '29 123 45 67', nsnMin: 9, nsnMax: 9 },
  { code: 'BE', dial: '+32', flag: '🇧🇪', name: 'Belgium', placeholder: '470 12 34 56', nsnMin: 9, nsnMax: 9 },
  { code: 'BJ', dial: '+229', flag: '🇧🇯', name: 'Benin', placeholder: '90 12 34 56', nsnMin: 8, nsnMax: 8 },
  { code: 'BG', dial: '+359', flag: '🇧🇬', name: 'Bulgaria', placeholder: '87 123 4567', nsnMin: 8, nsnMax: 9 },
  { code: 'BT', dial: '+975', flag: '🇧🇹', name: 'Bhutan', placeholder: '17 12 34 56', nsnMin: 8, nsnMax: 8 },
  { code: 'BO', dial: '+591', flag: '🇧🇴', name: 'Bolivia', placeholder: '712 34567', nsnMin: 8, nsnMax: 8 },
  {
    code: 'BA',
    dial: '+387',
    flag: '🇧🇦',
    name: 'Bosnia and Herzegovina',
    placeholder: '61 123 456',
    nsnMin: 8,
    nsnMax: 8,
  },
  { code: 'BW', dial: '+267', flag: '🇧🇼', name: 'Botswana', placeholder: '71 123 456', nsnMin: 8, nsnMax: 8 },
  { code: 'BR', dial: '+55', flag: '🇧🇷', name: 'Brazil', placeholder: '11 91234 5678', nsnMin: 10, nsnMax: 11 },
  { code: 'BN', dial: '+673', flag: '🇧🇳', name: 'Brunei', placeholder: '712 3456', nsnMin: 7, nsnMax: 7 },
  { code: 'BF', dial: '+226', flag: '🇧🇫', name: 'Burkina Faso', placeholder: '70 12 34 56', nsnMin: 8, nsnMax: 8 },
  { code: 'BI', dial: '+257', flag: '🇧🇮', name: 'Burundi', placeholder: '79 12 34 56', nsnMin: 8, nsnMax: 8 },
  { code: 'KH', dial: '+855', flag: '🇰🇭', name: 'Cambodia', placeholder: '91 234 567', nsnMin: 8, nsnMax: 9 },
  { code: 'CM', dial: '+237', flag: '🇨🇲', name: 'Cameroon', placeholder: '6 71 23 45 67', nsnMin: 9, nsnMax: 9 },
  { code: 'CA', dial: '+1', flag: '🇨🇦', name: 'Canada', placeholder: '416 555 0123', nsnMin: 10, nsnMax: 10 },
  { code: 'TD', dial: '+235', flag: '🇹🇩', name: 'Chad', placeholder: '63 01 23 45', nsnMin: 8, nsnMax: 8 },
  { code: 'CL', dial: '+56', flag: '🇨🇱', name: 'Chile', placeholder: '9 6123 4567', nsnMin: 9, nsnMax: 9 },
  { code: 'CN', dial: '+86', flag: '🇨🇳', name: 'China', placeholder: '131 2345 6789', nsnMin: 11, nsnMax: 11 },
  { code: 'CO', dial: '+57', flag: '🇨🇴', name: 'Colombia', placeholder: '321 1234567', nsnMin: 10, nsnMax: 10 },
  { code: 'CG', dial: '+242', flag: '🇨🇬', name: 'Congo', placeholder: '06 123 4567', nsnMin: 9, nsnMax: 9 },
  { code: 'CI', dial: '+225', flag: '🇨🇮', name: "Côte d'Ivoire", placeholder: '71 234 5678', nsnMin: 8, nsnMax: 10 },
  { code: 'HR', dial: '+385', flag: '🇭🇷', name: 'Croatia', placeholder: '91 234 5678', nsnMin: 9, nsnMax: 9 },
  { code: 'CU', dial: '+53', flag: '🇨🇺', name: 'Cuba', placeholder: '5 1234567', nsnMin: 8, nsnMax: 8 },
  { code: 'CY', dial: '+357', flag: '🇨🇾', name: 'Cyprus', placeholder: '96 123456', nsnMin: 8, nsnMax: 8 },
  { code: 'CZ', dial: '+420', flag: '🇨🇿', name: 'Czech Republic', placeholder: '601 123 456', nsnMin: 9, nsnMax: 9 },
  { code: 'DK', dial: '+45', flag: '🇩🇰', name: 'Denmark', placeholder: '20 12 34 56', nsnMin: 8, nsnMax: 8 },
  { code: 'DJ', dial: '+253', flag: '🇩🇯', name: 'Djibouti', placeholder: '77 12 34 56', nsnMin: 8, nsnMax: 8 },
  { code: 'CD', dial: '+243', flag: '🇨🇩', name: 'DR Congo', placeholder: '991 234 567', nsnMin: 9, nsnMax: 9 },
  { code: 'EC', dial: '+593', flag: '🇪🇨', name: 'Ecuador', placeholder: '99 123 4567', nsnMin: 9, nsnMax: 9 },
  { code: 'EG', dial: '+20', flag: '🇪🇬', name: 'Egypt', placeholder: '100 123 4567', nsnMin: 10, nsnMax: 10 },
  { code: 'EE', dial: '+372', flag: '🇪🇪', name: 'Estonia', placeholder: '5123 4567', nsnMin: 7, nsnMax: 8 },
  { code: 'SZ', dial: '+268', flag: '🇸🇿', name: 'Eswatini', placeholder: '7612 3456', nsnMin: 8, nsnMax: 8 },
  { code: 'ET', dial: '+251', flag: '🇪🇹', name: 'Ethiopia', placeholder: '91 123 4567', nsnMin: 9, nsnMax: 9 },
  { code: 'FJ', dial: '+679', flag: '🇫🇯', name: 'Fiji', placeholder: '701 2345', nsnMin: 7, nsnMax: 7 },
  { code: 'FI', dial: '+358', flag: '🇫🇮', name: 'Finland', placeholder: '41 2345678', nsnMin: 9, nsnMax: 10 },
  { code: 'FR', dial: '+33', flag: '🇫🇷', name: 'France', placeholder: '6 12 34 56 78', nsnMin: 9, nsnMax: 9 },
  { code: 'GA', dial: '+241', flag: '🇬🇦', name: 'Gabon', placeholder: '06 12 34 56', nsnMin: 7, nsnMax: 8 },
  { code: 'GM', dial: '+220', flag: '🇬🇲', name: 'Gambia', placeholder: '301 2345', nsnMin: 7, nsnMax: 7 },
  { code: 'GE', dial: '+995', flag: '🇬🇪', name: 'Georgia', placeholder: '555 12 34 56', nsnMin: 9, nsnMax: 9 },
  { code: 'DE', dial: '+49', flag: '🇩🇪', name: 'Germany', placeholder: '1512 3456789', nsnMin: 10, nsnMax: 11 },
  { code: 'GH', dial: '+233', flag: '🇬🇭', name: 'Ghana', placeholder: '24 123 4567', nsnMin: 9, nsnMax: 9 },
  { code: 'GR', dial: '+30', flag: '🇬🇷', name: 'Greece', placeholder: '691 234 5678', nsnMin: 10, nsnMax: 10 },
  { code: 'GN', dial: '+224', flag: '🇬🇳', name: 'Guinea', placeholder: '601 12 34 56', nsnMin: 9, nsnMax: 9 },
  { code: 'GY', dial: '+592', flag: '🇬🇾', name: 'Guyana', placeholder: '609 1234', nsnMin: 7, nsnMax: 7 },
  { code: 'HK', dial: '+852', flag: '🇭🇰', name: 'Hong Kong', placeholder: '5123 4567', nsnMin: 8, nsnMax: 8 },
  { code: 'HU', dial: '+36', flag: '🇭🇺', name: 'Hungary', placeholder: '20 123 4567', nsnMin: 9, nsnMax: 9 },
  { code: 'IS', dial: '+354', flag: '🇮🇸', name: 'Iceland', placeholder: '611 1234', nsnMin: 7, nsnMax: 7 },
  { code: 'IN', dial: '+91', flag: '🇮🇳', name: 'India', placeholder: '98765 43210', nsnMin: 10, nsnMax: 10 },
  { code: 'ID', dial: '+62', flag: '🇮🇩', name: 'Indonesia', placeholder: '812 3456 789', nsnMin: 9, nsnMax: 12 },
  { code: 'IR', dial: '+98', flag: '🇮🇷', name: 'Iran', placeholder: '912 345 6789', nsnMin: 10, nsnMax: 10 },
  { code: 'IQ', dial: '+964', flag: '🇮🇶', name: 'Iraq', placeholder: '790 123 4567', nsnMin: 10, nsnMax: 10 },
  { code: 'IE', dial: '+353', flag: '🇮🇪', name: 'Ireland', placeholder: '85 123 4567', nsnMin: 9, nsnMax: 9 },
  { code: 'IL', dial: '+972', flag: '🇮🇱', name: 'Israel', placeholder: '50 123 4567', nsnMin: 9, nsnMax: 9 },
  { code: 'IT', dial: '+39', flag: '🇮🇹', name: 'Italy', placeholder: '312 345 6789', nsnMin: 9, nsnMax: 10 },
  { code: 'JP', dial: '+81', flag: '🇯🇵', name: 'Japan', placeholder: '90 1234 5678', nsnMin: 10, nsnMax: 10 },
  { code: 'JO', dial: '+962', flag: '🇯🇴', name: 'Jordan', placeholder: '7 9012 3456', nsnMin: 9, nsnMax: 9 },
  { code: 'KE', dial: '+254', flag: '🇰🇪', name: 'Kenya', placeholder: '712 345678', nsnMin: 9, nsnMax: 9 },
  { code: 'XK', dial: '+383', flag: '🇽🇰', name: 'Kosovo', placeholder: '44 123 456', nsnMin: 8, nsnMax: 8 },
  { code: 'KW', dial: '+965', flag: '🇰🇼', name: 'Kuwait', placeholder: '5000 1234', nsnMin: 8, nsnMax: 8 },
  { code: 'KG', dial: '+996', flag: '🇰🇬', name: 'Kyrgyzstan', placeholder: '700 123 456', nsnMin: 9, nsnMax: 9 },
  { code: 'LA', dial: '+856', flag: '🇱🇦', name: 'Laos', placeholder: '20 23 123 456', nsnMin: 8, nsnMax: 10 },
  { code: 'LV', dial: '+371', flag: '🇱🇻', name: 'Latvia', placeholder: '21 234 567', nsnMin: 8, nsnMax: 8 },
  { code: 'LB', dial: '+961', flag: '🇱🇧', name: 'Lebanon', placeholder: '71 123 456', nsnMin: 8, nsnMax: 8 },
  { code: 'LS', dial: '+266', flag: '🇱🇸', name: 'Lesotho', placeholder: '5012 3456', nsnMin: 8, nsnMax: 8 },
  { code: 'LR', dial: '+231', flag: '🇱🇷', name: 'Liberia', placeholder: '77 012 3456', nsnMin: 7, nsnMax: 9 },
  { code: 'LY', dial: '+218', flag: '🇱🇾', name: 'Libya', placeholder: '91 2345678', nsnMin: 9, nsnMax: 10 },
  { code: 'LT', dial: '+370', flag: '🇱🇹', name: 'Lithuania', placeholder: '612 34567', nsnMin: 8, nsnMax: 8 },
  { code: 'LU', dial: '+352', flag: '🇱🇺', name: 'Luxembourg', placeholder: '628 123 456', nsnMin: 9, nsnMax: 9 },
  { code: 'MO', dial: '+853', flag: '🇲🇴', name: 'Macao', placeholder: '6612 3456', nsnMin: 8, nsnMax: 8 },
  { code: 'MG', dial: '+261', flag: '🇲🇬', name: 'Madagascar', placeholder: '32 12 345 67', nsnMin: 9, nsnMax: 9 },
  { code: 'MW', dial: '+265', flag: '🇲🇼', name: 'Malawi', placeholder: '991 23 45 67', nsnMin: 9, nsnMax: 9 },
  { code: 'MY', dial: '+60', flag: '🇲🇾', name: 'Malaysia', placeholder: '12 345 6789', nsnMin: 9, nsnMax: 10 },
  { code: 'MV', dial: '+960', flag: '🇲🇻', name: 'Maldives', placeholder: '771 2345', nsnMin: 7, nsnMax: 7 },
  { code: 'ML', dial: '+223', flag: '🇲🇱', name: 'Mali', placeholder: '65 01 23 45', nsnMin: 8, nsnMax: 8 },
  { code: 'MT', dial: '+356', flag: '🇲🇹', name: 'Malta', placeholder: '9696 1234', nsnMin: 8, nsnMax: 8 },
  { code: 'MR', dial: '+222', flag: '🇲🇷', name: 'Mauritania', placeholder: '22 12 34 56', nsnMin: 8, nsnMax: 8 },
  { code: 'MU', dial: '+230', flag: '🇲🇺', name: 'Mauritius', placeholder: '5251 2345', nsnMin: 8, nsnMax: 8 },
  { code: 'MX', dial: '+52', flag: '🇲🇽', name: 'Mexico', placeholder: '222 123 4567', nsnMin: 10, nsnMax: 10 },
  { code: 'MD', dial: '+373', flag: '🇲🇩', name: 'Moldova', placeholder: '621 12 345', nsnMin: 8, nsnMax: 8 },
  { code: 'MN', dial: '+976', flag: '🇲🇳', name: 'Mongolia', placeholder: '8812 3456', nsnMin: 8, nsnMax: 8 },
  { code: 'ME', dial: '+382', flag: '🇲🇪', name: 'Montenegro', placeholder: '67 622 901', nsnMin: 8, nsnMax: 8 },
  { code: 'MA', dial: '+212', flag: '🇲🇦', name: 'Morocco', placeholder: '650 123456', nsnMin: 9, nsnMax: 9 },
  { code: 'MZ', dial: '+258', flag: '🇲🇿', name: 'Mozambique', placeholder: '82 123 4567', nsnMin: 9, nsnMax: 9 },
  { code: 'MM', dial: '+95', flag: '🇲🇲', name: 'Myanmar', placeholder: '9 212 3456', nsnMin: 8, nsnMax: 10 },
  { code: 'NA', dial: '+264', flag: '🇳🇦', name: 'Namibia', placeholder: '81 123 4567', nsnMin: 9, nsnMax: 9 },
  { code: 'NP', dial: '+977', flag: '🇳🇵', name: 'Nepal', placeholder: '984 1234567', nsnMin: 10, nsnMax: 10 },
  { code: 'NL', dial: '+31', flag: '🇳🇱', name: 'Netherlands', placeholder: '6 12345678', nsnMin: 9, nsnMax: 9 },
  { code: 'NZ', dial: '+64', flag: '🇳🇿', name: 'New Zealand', placeholder: '21 123 4567', nsnMin: 8, nsnMax: 10 },
  { code: 'NE', dial: '+227', flag: '🇳🇪', name: 'Niger', placeholder: '93 12 34 56', nsnMin: 8, nsnMax: 8 },
  { code: 'NG', dial: '+234', flag: '🇳🇬', name: 'Nigeria', placeholder: '802 123 4567', nsnMin: 8, nsnMax: 10 },
  { code: 'MK', dial: '+389', flag: '🇲🇰', name: 'North Macedonia', placeholder: '72 123 456', nsnMin: 8, nsnMax: 8 },
  { code: 'NO', dial: '+47', flag: '🇳🇴', name: 'Norway', placeholder: '406 12 345', nsnMin: 8, nsnMax: 8 },
  { code: 'OM', dial: '+968', flag: '🇴🇲', name: 'Oman', placeholder: '9212 3456', nsnMin: 8, nsnMax: 8 },
  { code: 'PS', dial: '+970', flag: '🇵🇸', name: 'Palestine', placeholder: '59 123 4567', nsnMin: 9, nsnMax: 9 },
  { code: 'PG', dial: '+675', flag: '🇵🇬', name: 'Papua New Guinea', placeholder: '7012 3456', nsnMin: 8, nsnMax: 8 },
  { code: 'PY', dial: '+595', flag: '🇵🇾', name: 'Paraguay', placeholder: '961 456789', nsnMin: 9, nsnMax: 9 },
  { code: 'PE', dial: '+51', flag: '🇵🇪', name: 'Peru', placeholder: '912 345 678', nsnMin: 9, nsnMax: 9 },
  { code: 'PH', dial: '+63', flag: '🇵🇭', name: 'Philippines', placeholder: '917 123 4567', nsnMin: 10, nsnMax: 10 },
  { code: 'PL', dial: '+48', flag: '🇵🇱', name: 'Poland', placeholder: '512 345 678', nsnMin: 9, nsnMax: 9 },
  { code: 'PT', dial: '+351', flag: '🇵🇹', name: 'Portugal', placeholder: '912 345 678', nsnMin: 9, nsnMax: 9 },
  { code: 'QA', dial: '+974', flag: '🇶🇦', name: 'Qatar', placeholder: '3312 3456', nsnMin: 8, nsnMax: 8 },
  { code: 'RO', dial: '+40', flag: '🇷🇴', name: 'Romania', placeholder: '712 345 678', nsnMin: 9, nsnMax: 9 },
  { code: 'RU', dial: '+7', flag: '🇷🇺', name: 'Russia', placeholder: '912 345 67 89', nsnMin: 10, nsnMax: 10 },
  { code: 'RW', dial: '+250', flag: '🇷🇼', name: 'Rwanda', placeholder: '720 123 456', nsnMin: 9, nsnMax: 9 },
  { code: 'SA', dial: '+966', flag: '🇸🇦', name: 'Saudi Arabia', placeholder: '51 234 5678', nsnMin: 9, nsnMax: 9 },
  { code: 'SN', dial: '+221', flag: '🇸🇳', name: 'Senegal', placeholder: '70 123 45 67', nsnMin: 9, nsnMax: 9 },
  { code: 'RS', dial: '+381', flag: '🇷🇸', name: 'Serbia', placeholder: '60 1234567', nsnMin: 8, nsnMax: 9 },
  { code: 'SC', dial: '+248', flag: '🇸🇨', name: 'Seychelles', placeholder: '2 510 123', nsnMin: 7, nsnMax: 7 },
  { code: 'SL', dial: '+232', flag: '🇸🇱', name: 'Sierra Leone', placeholder: '25 123456', nsnMin: 8, nsnMax: 8 },
  { code: 'SG', dial: '+65', flag: '🇸🇬', name: 'Singapore', placeholder: '8123 4567', nsnMin: 8, nsnMax: 8 },
  { code: 'SK', dial: '+421', flag: '🇸🇰', name: 'Slovakia', placeholder: '912 123 456', nsnMin: 9, nsnMax: 9 },
  { code: 'SI', dial: '+386', flag: '🇸🇮', name: 'Slovenia', placeholder: '31 234 567', nsnMin: 8, nsnMax: 8 },
  { code: 'SO', dial: '+252', flag: '🇸🇴', name: 'Somalia', placeholder: '7 11234567', nsnMin: 8, nsnMax: 9 },
  { code: 'ZA', dial: '+27', flag: '🇿🇦', name: 'South Africa', placeholder: '82 123 4567', nsnMin: 9, nsnMax: 9 },
  { code: 'KR', dial: '+82', flag: '🇰🇷', name: 'South Korea', placeholder: '10 1234 5678', nsnMin: 9, nsnMax: 10 },
  { code: 'ES', dial: '+34', flag: '🇪🇸', name: 'Spain', placeholder: '612 34 56 78', nsnMin: 9, nsnMax: 9 },
  { code: 'LK', dial: '+94', flag: '🇱🇰', name: 'Sri Lanka', placeholder: '71 234 5678', nsnMin: 9, nsnMax: 9 },
  { code: 'SD', dial: '+249', flag: '🇸🇩', name: 'Sudan', placeholder: '91 123 4567', nsnMin: 9, nsnMax: 9 },
  { code: 'SR', dial: '+597', flag: '🇸🇷', name: 'Suriname', placeholder: '741 2345', nsnMin: 7, nsnMax: 7 },
  { code: 'SE', dial: '+46', flag: '🇸🇪', name: 'Sweden', placeholder: '70 123 45 67', nsnMin: 9, nsnMax: 9 },
  { code: 'CH', dial: '+41', flag: '🇨🇭', name: 'Switzerland', placeholder: '78 123 45 67', nsnMin: 9, nsnMax: 9 },
  { code: 'SY', dial: '+963', flag: '🇸🇾', name: 'Syria', placeholder: '944 567 890', nsnMin: 9, nsnMax: 9 },
  { code: 'TW', dial: '+886', flag: '🇹🇼', name: 'Taiwan', placeholder: '912 345 678', nsnMin: 9, nsnMax: 9 },
  { code: 'TJ', dial: '+992', flag: '🇹🇯', name: 'Tajikistan', placeholder: '917 12 3456', nsnMin: 9, nsnMax: 9 },
  { code: 'TZ', dial: '+255', flag: '🇹🇿', name: 'Tanzania', placeholder: '621 234 567', nsnMin: 9, nsnMax: 9 },
  { code: 'TH', dial: '+66', flag: '🇹🇭', name: 'Thailand', placeholder: '81 234 5678', nsnMin: 9, nsnMax: 9 },
  { code: 'TG', dial: '+228', flag: '🇹🇬', name: 'Togo', placeholder: '90 12 34 56', nsnMin: 8, nsnMax: 8 },
  { code: 'TN', dial: '+216', flag: '🇹🇳', name: 'Tunisia', placeholder: '20 123 456', nsnMin: 8, nsnMax: 8 },
  { code: 'TR', dial: '+90', flag: '🇹🇷', name: 'Turkey', placeholder: '501 234 5678', nsnMin: 10, nsnMax: 10 },
  { code: 'TM', dial: '+993', flag: '🇹🇲', name: 'Turkmenistan', placeholder: '66 123456', nsnMin: 8, nsnMax: 8 },
  { code: 'UG', dial: '+256', flag: '🇺🇬', name: 'Uganda', placeholder: '712 345678', nsnMin: 9, nsnMax: 9 },
  { code: 'UA', dial: '+380', flag: '🇺🇦', name: 'Ukraine', placeholder: '50 123 4567', nsnMin: 9, nsnMax: 9 },
  {
    code: 'AE',
    dial: '+971',
    flag: '🇦🇪',
    name: 'United Arab Emirates',
    placeholder: '50 123 4567',
    nsnMin: 9,
    nsnMax: 9,
  },
  { code: 'GB', dial: '+44', flag: '🇬🇧', name: 'United Kingdom', placeholder: '7400 123456', nsnMin: 10, nsnMax: 10 },
  { code: 'US', dial: '+1', flag: '🇺🇸', name: 'United States', placeholder: '201 555 0123', nsnMin: 10, nsnMax: 10 },
  { code: 'UY', dial: '+598', flag: '🇺🇾', name: 'Uruguay', placeholder: '94 123 456', nsnMin: 8, nsnMax: 8 },
  { code: 'UZ', dial: '+998', flag: '🇺🇿', name: 'Uzbekistan', placeholder: '90 123 45 67', nsnMin: 9, nsnMax: 9 },
  { code: 'VE', dial: '+58', flag: '🇻🇪', name: 'Venezuela', placeholder: '412 1234567', nsnMin: 10, nsnMax: 10 },
  { code: 'VN', dial: '+84', flag: '🇻🇳', name: 'Vietnam', placeholder: '91 234 56 78', nsnMin: 9, nsnMax: 10 },
  { code: 'YE', dial: '+967', flag: '🇾🇪', name: 'Yemen', placeholder: '712 345 678', nsnMin: 9, nsnMax: 9 },
  { code: 'ZM', dial: '+260', flag: '🇿🇲', name: 'Zambia', placeholder: '95 1234567', nsnMin: 9, nsnMax: 9 },
  { code: 'ZW', dial: '+263', flag: '🇿🇼', name: 'Zimbabwe', placeholder: '71 234 5678', nsnMin: 9, nsnMax: 9 },
] as const;

function requireCountry(code: string): CountryDialInfo {
  const found = COUNTRIES.find((c) => c.code === code);
  if (!found) throw new Error(`Missing dial country ${code}`);
  return found;
}

const DEFAULT_COUNTRY = requireCountry('PK');
/** Prefer US when resolving a shared NANP `+1` dial. */
const NANP_PREFERRED = requireCountry('US');

/** Default ISO country — Pakistan. */
export const DEFAULT_COUNTRY_CODE = DEFAULT_COUNTRY.code;

/** Default dial — Pakistan. */
export const DEFAULT_DIAL = DEFAULT_COUNTRY.dial;

export type CountryDial = (typeof COUNTRIES)[number]['dial'];
export type CountryCode = (typeof COUNTRIES)[number]['code'];

export function countryByCode(code: string): CountryDialInfo {
  return COUNTRIES.find((c) => c.code === code) ?? DEFAULT_COUNTRY;
}

/** Dial → country. Shared dials (NANP `+1`) resolve to the US entry. */
export function countryByDial(dial: string): CountryDialInfo {
  if (dial === NANP_PREFERRED.dial) return NANP_PREFERRED;
  return COUNTRIES.find((c) => c.dial === dial) ?? DEFAULT_COUNTRY;
}
