import React, { useState, useMemo } from 'react';
import { Search, X, Check } from 'lucide-react';
import { COUNTRIES } from '../data/countries';
import { Country } from '../types';
import { TRANSLATIONS } from '../data/translations';

interface CountrySelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCountry: Country;
  onSelectCountry: (country: Country) => void;
}

export const CountrySelectorModal: React.FC<CountrySelectorModalProps> = ({
  isOpen,
  onClose,
  selectedCountry,
  onSelectCountry,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCountries = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return COUNTRIES;

    return COUNTRIES.filter((country) => {
      const name = country.nameEn.toLowerCase();
      const dialDigits = country.dialCode.replace(/\D/g, '');
      const code = country.code.toLowerCase();

      return (
        name.includes(q) ||
        country.dialCode.includes(q) ||
        dialDigits.includes(q) ||
        code.includes(q)
      );
    });
  }, [searchQuery]);

  if (!isOpen) return null;

  return (
    <div
      id="country-selector-backdrop"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="country-selector-modal"
        className="w-full max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-xl flex flex-col max-h-[85vh] sm:max-h-[80vh] border border-gray-100 animate-in slide-in-from-bottom duration-250"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">
            {TRANSLATIONS.selectCountry}
          </h2>
          <button
            id="btn-close-country-modal"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition active:scale-90 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search input */}
        <div className="p-3 border-b border-gray-100">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 pointer-events-none" />
            <input
              id="input-search-country"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={TRANSLATIONS.searchCountry}
              autoFocus
              className="w-full pl-9 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[var(--theme-color)] transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Country list */}
        <div
          id="country-list-container"
          className="flex-1 overflow-y-auto divide-y divide-gray-50 p-1"
        >
          {filteredCountries.length === 0 ? (
            <div className="p-8 text-center text-xs text-gray-400">
              No matching countries found
            </div>
          ) : (
            filteredCountries.map((country) => {
              const isSelected = selectedCountry.code === country.code;
              return (
                <button
                  key={country.code}
                  id={`country-option-${country.code}`}
                  onClick={() => {
                    onSelectCountry(country);
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left transition active:scale-[0.99] cursor-pointer ${
                    isSelected
                      ? 'bg-[var(--theme-surface)] text-gray-900'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xl leading-none flex-shrink-0">
                      {country.flag}
                    </span>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs sm:text-sm font-medium truncate">
                        {country.nameEn}
                      </span>
                      <span className="text-[11px] text-gray-400 font-mono">
                        {country.code}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs font-mono font-semibold text-gray-600">
                      {country.dialCode}
                    </span>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-[var(--theme-color)] text-white flex items-center justify-center">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
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
