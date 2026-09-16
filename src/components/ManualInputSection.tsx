import React, { useState } from 'react';
import { Phone, X, ExternalLink, Copy, Check, ChevronDown, AlertCircle } from 'lucide-react';
import { Country, Language, PhoneValidationResult } from '../types';
import { TRANSLATIONS } from '../data/translations';

interface ManualInputSectionProps {
  country: Country;
  phoneNumber: string;
  onChangePhoneNumber: (value: string) => void;
  onClearPhoneNumber: () => void;
  onOpenCountryModal: () => void;
  validation: PhoneValidationResult;
  autoGenerateLink: boolean;
  onOpenWhatsApp: () => void;
  language: Language;
}

export const ManualInputSection: React.FC<ManualInputSectionProps> = ({
  country,
  phoneNumber,
  onChangePhoneNumber,
  onClearPhoneNumber,
  onOpenCountryModal,
  validation,
  autoGenerateLink,
  onOpenWhatsApp,
  language,
}) => {
  const [copied, setCopied] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const t = TRANSLATIONS[language];

  const handleCopy = async () => {
    if (!validation.isValid || !validation.waUrl) return;

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(validation.waUrl);
      } else {
        // Fallback
        const textarea = document.createElement('textarea');
        textarea.value = validation.waUrl;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setCopyFeedback(t.copied);
      setTimeout(() => {
        setCopied(false);
        setCopyFeedback(null);
      }, 2500);
    } catch {
      setCopyFeedback(t.copyFailed);
      setTimeout(() => setCopyFeedback(null), 2500);
    }
  };

  const countryName = language === 'bn' ? country.nameBn : country.nameEn;

  return (
    <div id="manual-input-container" className="flex flex-col gap-3.5 w-full">
      {/* Country Selector Dropdown Button */}
      <button
        type="button"
        id="btn-country-dropdown"
        onClick={onOpenCountryModal}
        className="w-full flex items-center justify-between p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800/80 hover:border-[var(--theme-border)] text-left transition-all active:scale-[0.99] cursor-pointer shadow-xs"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="text-2xl leading-none flex-shrink-0" role="img" aria-label={country.nameEn}>
            {country.flag}
          </span>
          <div className="flex flex-col min-w-0">
            <span className="text-xs text-gray-500 dark:text-gray-400 font-normal truncate">
              {t.selectCountry}
            </span>
            <span className="text-sm font-semibold text-gray-900 dark:text-white truncate">
              {countryName} ({country.dialCode})
            </span>
          </div>
        </div>
        <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0 ml-2" />
      </button>

      {/* Phone Number Input Field */}
      <div className="relative flex items-center w-full">
        <div className="absolute left-3.5 text-gray-400 flex items-center pointer-events-none">
          <Phone className="w-4 h-4" />
        </div>

        <input
          id="phone-number-input"
          type="tel"
          inputMode="tel"
          value={phoneNumber}
          onChange={(e) => onChangePhoneNumber(e.target.value)}
          placeholder={`${country.example} (${t.phoneNumberPlaceholder})`}
          className={`w-full pl-10 pr-10 py-3.5 bg-white dark:bg-gray-800 border rounded-xl text-base font-medium text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none transition-all shadow-xs ${
            phoneNumber && !validation.isValid && validation.errorMessage
              ? 'border-amber-400 dark:border-amber-500/70 focus:border-amber-500'
              : phoneNumber && validation.isValid
              ? 'border-[var(--theme-color)] focus:border-[var(--theme-color)]'
              : 'border-gray-200 dark:border-gray-800 focus:border-[var(--theme-color)]'
          }`}
        />

        {/* Clear X button */}
        {phoneNumber && (
          <button
            type="button"
            id="btn-clear-phone-number"
            onClick={onClearPhoneNumber}
            aria-label={t.clearInput}
            className="absolute right-3 w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center justify-center transition active:scale-90"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Validation status / hint message */}
      {phoneNumber ? (
        <div className="flex items-center gap-1.5 px-1 text-xs">
          {validation.isValid ? (
            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>
                {t.numberValid}: <span className="font-mono">{validation.formattedDisplay}</span>
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{validation.errorMessage || t.invalidNumber}</span>
            </div>
          )}
        </div>
      ) : null}

      {/* Automatic WhatsApp Link Preview Card (if enabled and valid) */}
      {autoGenerateLink && validation.isValid && validation.waUrl ? (
        <div
          id="wa-link-preview-card"
          className="flex flex-col gap-2 p-3 rounded-xl border border-[var(--theme-border)] bg-[var(--theme-surface)] text-gray-800 dark:text-gray-200 transition-all animate-in fade-in duration-200"
        >
          <div className="flex items-center justify-between text-xs font-semibold text-[var(--theme-text)] dark:text-white">
            <span className="flex items-center gap-1.5">
              <ExternalLink className="w-3.5 h-3.5" />
              {t.whatsappLink}
            </span>
            {copyFeedback && (
              <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 animate-in fade-in">
                {copyFeedback}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between gap-2 bg-white/80 dark:bg-gray-900/80 px-3 py-2 rounded-lg border border-gray-100 dark:border-gray-800 font-mono text-xs text-gray-700 dark:text-gray-300 break-all select-all">
            <span className="truncate">{validation.waUrl}</span>
            <button
              type="button"
              id="btn-copy-wa-link"
              onClick={handleCopy}
              title={t.copyLink}
              className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-[11px] font-sans font-medium transition active:scale-95 flex-shrink-0"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-500" />
                  <span>{t.copied}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>{t.copyLink}</span>
                </>
              )}
            </button>
          </div>
        </div>
      ) : null}

      {/* Primary Action Button: Open in WhatsApp */}
      <button
        type="button"
        id="btn-open-in-whatsapp"
        onClick={onOpenWhatsApp}
        disabled={!validation.isValid}
        className={`w-full py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 text-base font-semibold text-white shadow-sm transition-all cursor-pointer ${
          validation.isValid
            ? 'bg-[var(--theme-color)] hover:opacity-95 active:scale-[0.98]'
            : 'bg-gray-300 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed opacity-70'
        }`}
      >
        <ExternalLink className="w-5 h-5 stroke-[2.2]" />
        <span>{t.openInWhatsApp}</span>
      </button>
    </div>
  );
};
