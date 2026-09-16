import React, { useState, useMemo } from 'react';
import { Search, X, Check } from 'lucide-react';
import { COUNTRIES } from '../data/countries';
import { Country, Language } from '../types';
import { TRANSLATIONS } from '../data/translations';

interface CountrySelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCountry: Country;
  onSelectCountry: (country: Country) => void;
  language: Language;
}

export const CountrySelectorModal: React.FC<CountrySelectorModalProps> = ({
  isOpen,
  onClose,
  selectedCountry,
  onSelectCountry,
  language,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const t = TRANSLATIONS[language];

  const filteredCountries = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return COUNTRIES;

    return COUNTRIES.filter((country) => {
      const name = language === 'bn' ? country.nameBn.toLowerCase() : country.nameEn.toLowerCase();
      const altName = country.nameEn.toLowerCase();
      const dialCode = country.dialCode.replace(/\D/g, '');
      const code = country.code.toLowerCase();

      return (
        name.includes(q) ||
        altName.includes(q) ||
        country.dialCode.includes(q) ||
        dialCode.includes(q) ||
        code.includes(q)
      );
    });
  }, [searchQuery, language]);

  if (!isOpen) return null;

  return (
    <div
      id="country-selector-backdrop"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="country-selector-modal"
        className="w-full max-w-md bg-white dark:bg-gray-900 rounded-t-2xl sm:rounded-2xl shadow-xl flex flex-col max-h-[85vh] sm:max-h-[80vh] border border-gray-100 dark:border-gray-800 animate-in slide-in-from-bottom duration-250"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            {t.selectCountry}
          </h2>
          <button
            id="btn-close-country-modal"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search input */}
        <div className="p-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 pointer-events-none" />
            <input
              id="country-search-input"
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchCountry}
              className="w-full pl-9 pr-8 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-[var(--theme-color)] transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Country list */}
        <div id="country-list-scrollable" className="overflow-y-auto divide-y divide-gray-50 dark:divide-gray-800/60 flex-1 p-1">
          {filteredCountries.length === 0 ? (
            <div className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
              No matching countries found
            </div>
          ) : (
            filteredCountries.map((country) => {
              const isSelected = country.code === selectedCountry.code;
              const countryName = language === 'bn' ? country.nameBn : country.nameEn;

              return (
                <button
                  key={country.code}
                  id={`country-item-${country.code}`}
                  onClick={() => {
                    onSelectCountry(country);
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-3 text-left transition rounded-xl ${
                    isSelected
                      ? 'bg-[var(--theme-surface)] text-[var(--theme-text)] dark:text-white font-medium'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800/50 text-gray-800 dark:text-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl leading-none" role="img" aria-label={country.nameEn}>
                      {country.flag}
                    </span>
                    <div>
                      <div className="text-sm">
                        {countryName}
                      </div>
                      <div className="text-xs text-gray-400 dark:text-gray-500">
                        {country.nameEn !== countryName ? `${country.nameEn} • ` : ''}
                        Example: {country.example}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                      {country.dialCode}
                    </span>
                    {isSelected && (
                      <Check className="w-4 h-4 text-[var(--theme-color)]" />
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
