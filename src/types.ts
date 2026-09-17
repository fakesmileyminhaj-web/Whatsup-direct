export type ThemeColor = 'whatsapp' | 'purple' | 'custom';

export type ActionOption = 'manual' | 'scan' | 'gallery';

export interface Country {
  code: string; // ISO 2-letter (e.g. 'BD')
  nameEn: string;
  nameBn?: string;
  dialCode: string; // e.g. '+880'
  flag: string; // emoji flag
  example: string;
  minLength: number;
  maxLength: number;
}

export interface RecentNumber {
  id: string;
  countryCode: string;
  countryDialCode: string;
  phoneNumber: string;
  internationalNumber: string;
  waUrl: string;
  timestamp: number;
}

export type ParticleSpeedSetting = '3s' | '6s' | 'custom';

export interface AppSettings {
  themeColor: ThemeColor;
  customColorHex?: string;
  defaultCountryCode: string; // e.g. 'BD'
  autoGenerateLink: boolean;
  particleBackground: boolean;
  particleSpeed: ParticleSpeedSetting;
  customParticleDuration?: number;
  historyEnabled: boolean;
}

export interface PhoneValidationResult {
  isValid: boolean;
  cleanInput: string;
  internationalNumber: string;
  formattedDisplay: string;
  waUrl: string;
  errorMessage?: string;
  hasCountryCode: boolean;
}
