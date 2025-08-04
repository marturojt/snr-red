// Country codes and phone formats for international phone number input
export interface Country {
  code: string;
  name: string;
  dialCode: string;
  format: string;
  flag: string;
}

export const countries: Country[] = [
  { code: 'US', name: 'United States', dialCode: '+1', format: '(###) ###-####', flag: '🇺🇸' },
  { code: 'MX', name: 'Mexico', dialCode: '+52', format: '## #### ####', flag: '🇲🇽' },
  { code: 'CA', name: 'Canada', dialCode: '+1', format: '(###) ###-####', flag: '🇨🇦' },
  { code: 'GB', name: 'United Kingdom', dialCode: '+44', format: '#### ### ####', flag: '🇬🇧' },
  { code: 'ES', name: 'Spain', dialCode: '+34', format: '### ### ###', flag: '🇪🇸' },
  { code: 'FR', name: 'France', dialCode: '+33', format: '## ## ## ## ##', flag: '🇫🇷' },
  { code: 'DE', name: 'Germany', dialCode: '+49', format: '#### ########', flag: '🇩🇪' },
  { code: 'IT', name: 'Italy', dialCode: '+39', format: '### ### ####', flag: '🇮🇹' },
  { code: 'AR', name: 'Argentina', dialCode: '+54', format: '## #### ####', flag: '🇦🇷' },
  { code: 'BR', name: 'Brazil', dialCode: '+55', format: '## #####-####', flag: '🇧🇷' },
  { code: 'CL', name: 'Chile', dialCode: '+56', format: '# #### ####', flag: '🇨🇱' },
  { code: 'CO', name: 'Colombia', dialCode: '+57', format: '### ### ####', flag: '🇨🇴' },
  { code: 'PE', name: 'Peru', dialCode: '+51', format: '### ### ###', flag: '🇵🇪' },
  { code: 'AU', name: 'Australia', dialCode: '+61', format: '#### ### ###', flag: '🇦🇺' },
  { code: 'JP', name: 'Japan', dialCode: '+81', format: '##-####-####', flag: '🇯🇵' },
  { code: 'KR', name: 'South Korea', dialCode: '+82', format: '##-####-####', flag: '🇰🇷' },
  { code: 'CN', name: 'China', dialCode: '+86', format: '### #### ####', flag: '🇨🇳' },
  { code: 'IN', name: 'India', dialCode: '+91', format: '##### #####', flag: '🇮🇳' },
  { code: 'RU', name: 'Russia', dialCode: '+7', format: '### ###-##-##', flag: '🇷🇺' },
  { code: 'ZA', name: 'South Africa', dialCode: '+27', format: '## ### ####', flag: '🇿🇦' },
  { code: 'EG', name: 'Egypt', dialCode: '+20', format: '## #### ####', flag: '🇪🇬' },
  { code: 'NG', name: 'Nigeria', dialCode: '+234', format: '### ### ####', flag: '🇳🇬' },
  { code: 'TR', name: 'Turkey', dialCode: '+90', format: '### ### ## ##', flag: '🇹🇷' },
  { code: 'SA', name: 'Saudi Arabia', dialCode: '+966', format: '## ### ####', flag: '🇸🇦' },
  { code: 'AE', name: 'United Arab Emirates', dialCode: '+971', format: '## ### ####', flag: '🇦🇪' },
  { code: 'IL', name: 'Israel', dialCode: '+972', format: '##-###-####', flag: '🇮🇱' },
  { code: 'TH', name: 'Thailand', dialCode: '+66', format: '##-###-####', flag: '🇹🇭' },
  { code: 'SG', name: 'Singapore', dialCode: '+65', format: '#### ####', flag: '🇸🇬' },
  { code: 'MY', name: 'Malaysia', dialCode: '+60', format: '##-#### ####', flag: '🇲🇾' },
  { code: 'PH', name: 'Philippines', dialCode: '+63', format: '### ### ####', flag: '🇵🇭' },
  { code: 'ID', name: 'Indonesia', dialCode: '+62', format: '###-###-####', flag: '🇮🇩' },
  { code: 'VN', name: 'Vietnam', dialCode: '+84', format: '### ### ####', flag: '🇻🇳' },
  { code: 'BD', name: 'Bangladesh', dialCode: '+880', format: '####-######', flag: '🇧🇩' },
  { code: 'PK', name: 'Pakistan', dialCode: '+92', format: '### #######', flag: '🇵🇰' },
];

export const defaultCountry = countries.find(c => c.code === 'MX') || countries[0];

export function getCountryByCode(code: string): Country | undefined {
  return countries.find(c => c.code === code);
}

export function getCountryByDialCode(dialCode: string): Country | undefined {
  return countries.find(c => c.dialCode === dialCode);
}

export function formatPhoneNumber(phone: string, country: Country): string {
  // Remove all non-digits except +
  const cleaned = phone.replace(/[^\d]/g, '');
  
  // Apply country-specific format
  let formatted = country.dialCode + ' ';
  let mask = country.format;
  
  let digitIndex = 0;
  for (let i = 0; i < mask.length && digitIndex < cleaned.length; i++) {
    if (mask[i] === '#') {
      formatted += cleaned[digitIndex];
      digitIndex++;
    } else {
      formatted += mask[i];
    }
  }
  
  return formatted;
}

export function validatePhoneNumber(phone: string, country: Country): boolean {
  const cleaned = phone.replace(/[^\d]/g, '');
  const expectedLength = country.format.split('#').length - 1;
  
  return cleaned.length >= expectedLength - 2 && cleaned.length <= expectedLength + 2;
}
