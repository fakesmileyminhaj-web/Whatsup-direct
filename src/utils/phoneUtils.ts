import { COUNTRIES, findCountryByDialCode, getCountryByCode } from '../data/countries';
import { PhoneValidationResult } from '../types';

/**
 * Normalizes user input or scanned text into a valid WhatsApp Click-to-Chat number.
 * WhatsApp Click-to-Chat format: https://wa.me/<number_without_plus_or_special_chars>
 */
export function normalizePhoneNumber(
  rawInput: string,
  selectedCountryCode: string
): PhoneValidationResult {
  const selectedCountry = getCountryByCode(selectedCountryCode);
  const selectedDialDigits = selectedCountry.dialCode.replace(/\D/g, ''); // e.g. '880'

  if (!rawInput || !rawInput.trim()) {
    return {
      isValid: false,
      cleanInput: '',
      internationalNumber: '',
      formattedDisplay: '',
      waUrl: '',
      errorMessage: undefined,
      hasCountryCode: false,
    };
  }

  let cleaned = rawInput.trim();

  // Check if input explicitly starts with '+'
  const hasPlus = cleaned.startsWith('+');
  // Check if input starts with international exit code '00'
  const hasDoubleZero = cleaned.startsWith('00');

  // Strip all non-digit characters except we know about plus / 00
  let digits = cleaned.replace(/\D/g, '');

  if (hasDoubleZero && digits.startsWith('00')) {
    digits = digits.substring(2);
  }

  if (digits.length === 0) {
    return {
      isValid: false,
      cleanInput: '',
      internationalNumber: '',
      formattedDisplay: '',
      waUrl: '',
      errorMessage: 'Please enter valid digits',
      hasCountryCode: false,
    };
  }

  let internationalDigits = '';
  let detectedHasCountryCode = false;

  if (hasPlus || hasDoubleZero) {
    // User provided an explicit international number like +88017... or +1202...
    internationalDigits = digits;
    detectedHasCountryCode = true;
  } else {
    // Check if digits already start with the selected country's dial code
    // (e.g. user typed 8801712345678 when +880 is selected)
    if (digits.startsWith(selectedDialDigits) && digits.length >= selectedDialDigits.length + selectedCountry.minLength - 1) {
      internationalDigits = digits;
      detectedHasCountryCode = true;
    } else {
      // Check if it matches any other known country dial code
      const matchingCountry = findCountryByDialCode(`+${digits}`);
      if (matchingCountry && digits.length >= matchingCountry.dialCode.length - 1 + matchingCountry.minLength) {
        // It starts with another valid country dial code
        internationalDigits = digits;
        detectedHasCountryCode = true;
      } else {
        // Treat as a national number for the selected country
        let localDigits = digits;
        // In many countries (like BD, UK, Australia), national numbers start with a trunk prefix '0' (e.g. 017... or 07...)
        if (localDigits.startsWith('0')) {
          localDigits = localDigits.substring(1);
        }
        internationalDigits = `${selectedDialDigits}${localDigits}`;
        detectedHasCountryCode = false;
      }
    }
  }

  // E.164 standards: International numbers are between 7 and 15 digits
  const minDigits = 7;
  const maxDigits = 15;

  let isValid = false;
  let errorMessage: string | undefined = undefined;

  if (internationalDigits.length < minDigits) {
    errorMessage = 'Number is too short';
  } else if (internationalDigits.length > maxDigits) {
    errorMessage = 'Number is too long';
  } else {
    // Check country specific bounds if matched
    const matchedCountry = findCountryByDialCode(`+${internationalDigits}`) || selectedCountry;
    const nationalDigitsCount = internationalDigits.length - (matchedCountry.dialCode.replace(/\D/g, '').length);
    
    if (nationalDigitsCount < matchedCountry.minLength - 1) {
      errorMessage = 'Incomplete phone number';
    } else {
      isValid = true;
    }
  }

  const waUrl = isValid ? `https://wa.me/${internationalDigits}` : '';
  const formattedDisplay = internationalDigits ? `+${internationalDigits}` : '';

  return {
    isValid,
    cleanInput: digits,
    internationalNumber: internationalDigits,
    formattedDisplay,
    waUrl,
    errorMessage,
    hasCountryCode: detectedHasCountryCode,
  };
}

/**
 * Extracts candidate phone numbers from OCR text of cards, papers, or gallery images.
 */
export function extractPhoneNumbersFromText(ocrText: string): string[] {
  if (!ocrText) return [];

  // Match patterns like:
  // +880 1712-345678
  // +1 (555) 123-4567
  // 01712-345678
  // (+880) 1712 345678
  // Tel: 01819202122
  // Mob: 9876543210
  const candidates: Set<string> = new Set();

  // Normalize common OCR confusions like letter O/o for 0, l/I for 1 in numbers
  const cleanedText = ocrText
    .replace(/[—–]/g, '-')
    .replace(/[\[\{]/g, '(')
    .replace(/[\]\}]/g, ')');

  // Regex pattern for phone numbers
  const phoneRegex = /(?:(?:\+|00)\d{1,4}[-.\s]?)?(?:\(?\d{1,5}\)?[-.\s]?){1,4}\d{3,6}/g;
  const matches = cleanedText.match(phoneRegex);

  if (matches) {
    for (const match of matches) {
      const candidate = match.trim();
      // Must contain at least 7 digits to be a phone number
      const digitCount = candidate.replace(/\D/g, '').length;
      if (digitCount >= 7 && digitCount <= 16) {
        // Strip leading/trailing punctuation
        const cleanCandidate = candidate.replace(/^[^\d+]+|[^\d]+$/g, '');
        if (cleanCandidate.length >= 7) {
          candidates.add(cleanCandidate);
        }
      }
    }
  }

  // Also match line-by-line for labels like Phone:, Mobile:, Cell:, Tel:, WhatsApp:
  const lines = cleanedText.split(/\r?\n/);
  const labelRegex = /(?:phone|mobile|cell|tel|mob|whatsapp|wa|ph)[\s.:]*([+\d\s().-]{7,25})/i;
  for (const line of lines) {
    const labelMatch = line.match(labelRegex);
    if (labelMatch && labelMatch[1]) {
      const candidate = labelMatch[1].trim();
      const digitCount = candidate.replace(/\D/g, '').length;
      if (digitCount >= 7 && digitCount <= 16) {
        const cleanCandidate = candidate.replace(/^[^\d+]+|[^\d]+$/g, '');
        if (cleanCandidate.length >= 7) {
          candidates.add(cleanCandidate);
        }
      }
    }
  }

  return Array.from(candidates);
}

/**
 * Parses QR code content to extract a WhatsApp link or phone number
 */
export function parseQrContent(content: string): { phoneNumber?: string; waUrl?: string; isWhatsApp: boolean; raw: string } {
  const trimmed = (content || '').trim();

  // Pattern: https://wa.me/123456789 or https://api.whatsapp.com/send?phone=123456789
  const waMeMatch = trimmed.match(/https?:\/\/(?:wa\.me|api\.whatsapp\.com\/send(?:\/|\?phone=))(\+?\d+)/i);
  if (waMeMatch && waMeMatch[1]) {
    const digits = waMeMatch[1].replace(/\D/g, '');
    return {
      phoneNumber: digits,
      waUrl: `https://wa.me/${digits}`,
      isWhatsApp: true,
      raw: trimmed,
    };
  }

  // Pattern: whatsapp://send?phone=123456789
  const waSchemeMatch = trimmed.match(/whatsapp:\/\/send\?phone=(\+?\d+)/i);
  if (waSchemeMatch && waSchemeMatch[1]) {
    const digits = waSchemeMatch[1].replace(/\D/g, '');
    return {
      phoneNumber: digits,
      waUrl: `https://wa.me/${digits}`,
      isWhatsApp: true,
      raw: trimmed,
    };
  }

  // Pattern: tel:+123456789
  const telMatch = trimmed.match(/tel:([+\d\s().-]+)/i);
  if (telMatch && telMatch[1]) {
    const digits = telMatch[1].replace(/\D/g, '');
    return {
      phoneNumber: digits,
      isWhatsApp: false,
      raw: trimmed,
    };
  }

  // Raw digits
  const digitOnly = trimmed.replace(/\D/g, '');
  if (digitOnly.length >= 7 && digitOnly.length <= 15) {
    return {
      phoneNumber: digitOnly,
      isWhatsApp: false,
      raw: trimmed,
    };
  }

  return {
    isWhatsApp: false,
    raw: trimmed,
  };
}
