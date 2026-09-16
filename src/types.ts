export type ThemeMode = 'light' | 'dark' | 'system';

export type ThemeColor = 'whatsapp' | 'emerald' | 'teal' | 'forest';

export type Language = 'en' | 'bn';

export type ActionOption = 'manual' | 'scan_card' | 'scan_qr' | 'gallery';

export interface Country {
  code: string; // ISO 2-letter (e.g. 'BD')
  nameEn: string;
  nameBn: string;
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

export interface AppSettings {
  themeMode: ThemeMode;
  themeColor: ThemeColor;
  language: Language;
  defaultCountryCode: string; // e.g. 'BD'
  autoGenerateLink: boolean;
  waveAnimation: boolean;
  waveSpeed: 'calm' | 'natural' | 'slow';
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
