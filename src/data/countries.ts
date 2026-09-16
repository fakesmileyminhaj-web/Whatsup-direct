import { Country } from '../types';

export const COUNTRIES: Country[] = [
  { code: 'BD', nameEn: 'Bangladesh', nameBn: 'বাংলাদেশ', dialCode: '+880', flag: '🇧🇩', example: '1712345678', minLength: 9, maxLength: 11 },
  { code: 'IN', nameEn: 'India', nameBn: 'ভারত', dialCode: '+91', flag: '🇮🇳', example: '9876543210', minLength: 10, maxLength: 10 },
  { code: 'US', nameEn: 'United States', nameBn: 'যুক্তরাষ্ট্র', dialCode: '+1', flag: '🇺🇸', example: '2025550123', minLength: 10, maxLength: 10 },
  { code: 'GB', nameEn: 'United Kingdom', nameBn: 'যুক্তরাজ্য', dialCode: '+44', flag: '🇬🇧', example: '7911123456', minLength: 10, maxLength: 10 },
  { code: 'AE', nameEn: 'United Arab Emirates', nameBn: 'সংযুক্ত আরব আমিরাত', dialCode: '+971', flag: '🇦🇪', example: '501234567', minLength: 9, maxLength: 9 },
  { code: 'SA', nameEn: 'Saudi Arabia', nameBn: 'সৌদি আরব', dialCode: '+966', flag: '🇸🇦', example: '501234567', minLength: 9, maxLength: 9 },
  { code: 'PK', nameEn: 'Pakistan', nameBn: 'পাকিস্তান', dialCode: '+92', flag: '🇵🇰', example: '3001234567', minLength: 10, maxLength: 10 },
  { code: 'CA', nameEn: 'Canada', nameBn: 'কানাডা', dialCode: '+1', flag: '🇨🇦', example: '4165550199', minLength: 10, maxLength: 10 },
  { code: 'AU', nameEn: 'Australia', nameBn: 'অস্ট্রেলিয়া', dialCode: '+61', flag: '🇦🇺', example: '412345678', minLength: 9, maxLength: 9 },
  { code: 'MY', nameEn: 'Malaysia', nameBn: 'মালয়েশিয়া', dialCode: '+60', flag: '🇲🇾', example: '123456789', minLength: 9, maxLength: 10 },
  { code: 'SG', nameEn: 'Singapore', nameBn: 'সিঙ্গাপুর', dialCode: '+65', flag: '🇸🇬', example: '81234567', minLength: 8, maxLength: 8 },
  { code: 'QA', nameEn: 'Qatar', nameBn: 'কাতার', dialCode: '+974', flag: '🇶🇦', example: '33123456', minLength: 8, maxLength: 8 },
  { code: 'KW', nameEn: 'Kuwait', nameBn: 'কুয়েত', dialCode: '+965', flag: '🇰🇼', example: '51234567', minLength: 8, maxLength: 8 },
  { code: 'OM', nameEn: 'Oman', nameBn: 'ওমান', dialCode: '+968', flag: '🇴🇲', example: '91234567', minLength: 8, maxLength: 8 },
  { code: 'BH', nameEn: 'Bahrain', nameBn: 'বাহরাইন', dialCode: '+973', flag: '🇧🇭', example: '36001234', minLength: 8, maxLength: 8 },
  { code: 'DE', nameEn: 'Germany', nameBn: 'জার্মানি', dialCode: '+49', flag: '🇩🇪', example: '15123456789', minLength: 10, maxLength: 11 },
  { code: 'FR', nameEn: 'France', nameBn: 'ফ্রান্স', dialCode: '+33', flag: '🇫🇷', example: '612345678', minLength: 9, maxLength: 9 },
  { code: 'IT', nameEn: 'Italy', nameBn: 'ইতালি', dialCode: '+39', flag: '🇮🇹', example: '3123456789', minLength: 9, maxLength: 10 },
  { code: 'ES', nameEn: 'Spain', nameBn: 'স্পেন', dialCode: '+34', flag: '🇪🇸', example: '612345678', minLength: 9, maxLength: 9 },
  { code: 'TR', nameEn: 'Turkey', nameBn: 'তুরস্ক', dialCode: '+90', flag: '🇹🇷', example: '5321234567', minLength: 10, maxLength: 10 },
  { code: 'EG', nameEn: 'Egypt', nameBn: 'মিশর', dialCode: '+20', flag: '🇪🇬', example: '1001234567', minLength: 10, maxLength: 10 },
  { code: 'ZA', nameEn: 'South Africa', nameBn: 'দক্ষিণ আফ্রিকা', dialCode: '+27', flag: '🇿🇦', example: '821234567', minLength: 9, maxLength: 9 },
  { code: 'NG', nameEn: 'Nigeria', nameBn: 'নাইজেরিয়া', dialCode: '+234', flag: '🇳🇬', example: '8021234567', minLength: 10, maxLength: 10 },
  { code: 'ID', nameEn: 'Indonesia', nameBn: 'ইন্দোনেশিয়া', dialCode: '+62', flag: '🇮🇩', example: '8123456789', minLength: 9, maxLength: 12 },
  { code: 'PH', nameEn: 'Philippines', nameBn: 'ফিলিপাইন', dialCode: '+63', flag: '🇵🇭', example: '9171234567', minLength: 10, maxLength: 10 },
  { code: 'JP', nameEn: 'Japan', nameBn: 'জাপান', dialCode: '+81', flag: '🇯🇵', example: '9012345678', minLength: 10, maxLength: 10 },
  { code: 'KR', nameEn: 'South Korea', nameBn: 'দক্ষিণ কোরিয়া', dialCode: '+82', flag: '🇰🇷', example: '1012345678', minLength: 9, maxLength: 10 },
  { code: 'NP', nameEn: 'Nepal', nameBn: 'নেপাল', dialCode: '+977', flag: '🇳🇵', example: '9841234567', minLength: 10, maxLength: 10 },
  { code: 'LK', nameEn: 'Sri Lanka', nameBn: 'শ্রীলঙ্কা', dialCode: '+94', flag: '🇱🇰', example: '712345678', minLength: 9, maxLength: 9 },
  { code: 'BR', nameEn: 'Brazil', nameBn: 'ব্রাজিল', dialCode: '+55', flag: '🇧🇷', example: '11987654321', minLength: 10, maxLength: 11 },
  { code: 'MX', nameEn: 'Mexico', nameBn: 'মেক্সিকো', dialCode: '+52', flag: '🇲🇽', example: '5512345678', minLength: 10, maxLength: 10 },
  { code: 'RU', nameEn: 'Russia', nameBn: 'রাশিয়া', dialCode: '+7', flag: '🇷🇺', example: '9123456789', minLength: 10, maxLength: 10 },
  { code: 'CN', nameEn: 'China', nameBn: 'চীন', dialCode: '+86', flag: '🇨🇳', example: '13800138000', minLength: 11, maxLength: 11 },
  { code: 'NL', nameEn: 'Netherlands', nameBn: 'নেদারল্যান্ডস', dialCode: '+31', flag: '🇳🇱', example: '612345678', minLength: 9, maxLength: 9 },
  { code: 'SE', nameEn: 'Sweden', nameBn: 'সুইডেন', dialCode: '+46', flag: '🇸🇪', example: '701234567', minLength: 9, maxLength: 9 },
  { code: 'CH', nameEn: 'Switzerland', nameBn: 'সুইজারল্যান্ড', dialCode: '+41', flag: '🇨🇭', example: '791234567', minLength: 9, maxLength: 9 },
  { code: 'IE', nameEn: 'Ireland', nameBn: 'আয়ারল্যান্ড', dialCode: '+353', flag: '🇮🇪', example: '851234567', minLength: 9, maxLength: 9 },
  { code: 'NZ', nameEn: 'New Zealand', nameBn: 'নিউজিল্যান্ড', dialCode: '+64', flag: '🇳🇿', example: '211234567', minLength: 8, maxLength: 10 },
  { code: 'TH', nameEn: 'Thailand', nameBn: 'থাইল্যান্ড', dialCode: '+66', flag: '🇹🇭', example: '812345678', minLength: 9, maxLength: 9 },
  { code: 'VN', nameEn: 'Vietnam', nameBn: 'ভিয়েতনাম', dialCode: '+84', flag: '🇻🇳', example: '912345678', minLength: 9, maxLength: 10 },
  { code: 'KE', nameEn: 'Kenya', nameBn: 'কেনিয়া', dialCode: '+254', flag: '🇰🇪', example: '712345678', minLength: 9, maxLength: 9 },
  { code: 'GH', nameEn: 'Ghana', nameBn: 'ঘানা', dialCode: '+233', flag: '🇬🇭', example: '241234567', minLength: 9, maxLength: 9 },
  { code: 'JO', nameEn: 'Jordan', nameBn: 'জর্ডান', dialCode: '+962', flag: '🇯🇴', example: '791234567', minLength: 9, maxLength: 9 },
  { code: 'LB', nameEn: 'Lebanon', nameBn: 'লেবানন', dialCode: '+961', flag: '🇱🇧', example: '70123456', minLength: 8, maxLength: 8 },
  { code: 'IQ', nameEn: 'Iraq', nameBn: 'ইরাক', dialCode: '+964', flag: '🇮🇶', example: '7801234567', minLength: 10, maxLength: 10 },
  { code: 'DZ', nameEn: 'Algeria', nameBn: 'আলজেরিয়া', dialCode: '+213', flag: '🇩🇿', example: '551234567', minLength: 9, maxLength: 9 },
  { code: 'MA', nameEn: 'Morocco', nameBn: 'মরক্কো', dialCode: '+212', flag: '🇲🇦', example: '612345678', minLength: 9, maxLength: 9 }
];

export const DEFAULT_COUNTRY_CODE = 'BD';

export function getCountryByCode(code: string): Country {
  const found = COUNTRIES.find((c) => c.code === code);
  return found || COUNTRIES[0];
}

export function findCountryByDialCode(dialCode: string): Country | undefined {
  const cleanDial = dialCode.startsWith('+') ? dialCode : `+${dialCode}`;
  // Find matching country (longest dialCode first to disambiguate e.g. +1 vs +1242)
  const sorted = [...COUNTRIES].sort((a, b) => b.dialCode.length - a.dialCode.length);
  return sorted.find((c) => cleanDial.startsWith(c.dialCode));
}
