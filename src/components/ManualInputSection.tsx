import React, { useState } from 'react';
import { Phone, X, ExternalLink, Copy, Check, ChevronDown, AlertCircle } from 'lucide-react';
import { Country, PhoneValidationResult } from '../types';
import { TRANSLATIONS } from '../data/translations';

interface ManualInputSectionProps {
  country: Country;
  phoneNumber: string;
  onChangePhoneNumber: (value: string) => void;
  onClearPhoneNumber: () => void;
  onOpenCountryModal: () => void;
  validation: PhoneValidationResult;
  onOpenWhatsApp: () => void;
  onCopySuccess?: (msg: string) => void;
}

export const ManualInputSection: React.FC<ManualInputSectionProps> = ({
  country,
  phoneNumber,
  onChangePhoneNumber,
  onClearPhoneNumber,
  onOpenCountryModal,
  validation,
  onOpenWhatsApp,
  onCopySuccess,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    if (!validation.isValid || !validation.waUrl) return;

    const linkToCopy = validation.waUrl;

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(linkToCopy);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = linkToCopy;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      onCopySuccess?.(TRANSLATIONS.copiedLink);
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div id="manual-input-container" className="flex flex-col gap-3.5 w-full">
      {/* Country Selector Dropdown Button */}
      <button
        type="button"
        id="btn-country-dropdown"
        onClick={onOpenCountryModal}
        className="w-full flex items-center justify-between p-3 rounded-xl border border-gray-200 bg-white hover:border-[var(--theme-border)] text-left transition-all active:scale-[0.99] cursor-pointer shadow-xs"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <span
            className="text-2xl leading-none flex-shrink-0"
            role="img"
            aria-label={country.nameEn}
          >
            {country.flag}
          </span>
          <div className="flex flex-col min-w-0">
            <span className="text-xs text-gray-500 font-normal truncate">
              {TRANSLATIONS.selectCountry}
            </span>
            <span className="text-sm font-semibold text-gray-900 truncate">
              {country.nameEn} ({country.dialCode})
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
          placeholder="1642504030"
          className={`w-full pl-10 pr-10 py-3.5 bg-white border rounded-xl text-base font-medium text-gray-900 placeholder-gray-400 focus:outline-none transition-all shadow-xs ${
            phoneNumber && !validation.isValid && validation.errorMessage
              ? 'border-amber-400 focus:border-amber-500'
              : phoneNumber && validation.isValid
              ? 'border-[var(--theme-color)] focus:border-[var(--theme-color)]'
              : 'border-gray-200 focus:border-[var(--theme-color)]'
          }`}
        />

        {/* Clear X button */}
        {phoneNumber && (
          <button
            type="button"
            id="btn-clear-phone-number"
            onClick={onClearPhoneNumber}
            aria-label={TRANSLATIONS.clearInput}
            className="absolute right-3 w-6 h-6 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 flex items-center justify-center transition active:scale-90 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Validation status / hint message */}
      {phoneNumber ? (
        <div className="flex items-center gap-1.5 px-1 text-xs">
          {validation.isValid ? (
            <div className="flex items-center gap-1.5 text-emerald-600 font-medium">
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>
                {TRANSLATIONS.numberValid}:{' '}
                <span className="font-mono font-semibold">
                  {validation.formattedDisplay}
                </span>
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-amber-600">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{validation.errorMessage || TRANSLATIONS.invalidNumber}</span>
            </div>
          )}
        </div>
      ) : null}

      {/* Clean Copy Link Card (Copies the WhatsApp wa.me link to clipboard) */}
      {validation.isValid && validation.waUrl && (
        <button
          type="button"
          id="btn-copy-link-card"
          onClick={handleCopyLink}
          className="w-full py-3 px-4 rounded-xl border border-[var(--theme-border)] bg-[var(--theme-surface)] hover:opacity-90 text-[var(--theme-text)] font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition active:scale-[0.98] shadow-xs cursor-pointer animate-in fade-in"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
              <span>{TRANSLATIONS.copiedLink}</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 stroke-[2]" />
              <span>{TRANSLATIONS.copyLink}</span>
            </>
          )}
        </button>
      )}

      {/* Primary Action Button: Open in WhatsApp */}
      <button
        type="button"
        id="btn-open-in-whatsapp"
        onClick={onOpenWhatsApp}
        disabled={!validation.isValid}
        className={`w-full py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 text-base font-semibold text-white shadow-xs transition-all cursor-pointer ${
          validation.isValid
            ? 'bg-[var(--theme-color)] hover:opacity-95 active:scale-[0.98]'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-70'
        }`}
      >
        <ExternalLink className="w-5 h-5 stroke-[2.2]" />
        <span>{TRANSLATIONS.openInWhatsApp}</span>
      </button>
    </div>
  );
};
