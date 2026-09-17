import React from 'react';
import { Settings } from 'lucide-react';
import { TRANSLATIONS } from '../data/translations';

interface HeaderProps {
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSettings }) => {
  return (
    <header
      id="app-header"
      className="w-full flex items-center justify-between px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-2xl border border-gray-200/90 bg-white/95 backdrop-blur-sm shadow-xs transition-colors"
    >
      <div className="flex items-center gap-2.5">
        {/* WhatsApp Direct Header Logo */}
        <img
          id="header-app-icon"
          src="/wpheader.png"
          alt="WhatsApp Direct Logo"
          referrerPolicy="no-referrer"
          className="w-9 h-9 object-contain rounded-xl shadow-xs flex-shrink-0 transition-transform active:scale-95"
        />

        {/* Title and small subtitle */}
        <div className="flex flex-col">
          <h1
            id="header-app-title"
            className="text-base font-semibold text-gray-900 tracking-tight leading-tight"
          >
            {TRANSLATIONS.appName}
          </h1>
          <span
            id="header-app-subtitle"
            className="text-[11px] font-normal text-gray-500 leading-none"
          >
            {TRANSLATIONS.subtitle}
          </span>
        </div>
      </div>

      {/* Settings icon */}
      <button
        id="btn-open-settings"
        onClick={onOpenSettings}
        aria-label={TRANSLATIONS.headerSettings}
        className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-600 hover:text-[var(--theme-color)] hover:bg-gray-100 transition-all active:scale-95 focus:outline-none cursor-pointer"
      >
        <Settings className="w-5 h-5 stroke-[1.8]" />
      </button>
    </header>
  );
};
