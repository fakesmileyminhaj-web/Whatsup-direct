import React from 'react';
import { Settings, MessageCircle } from 'lucide-react';
import { TRANSLATIONS } from '../data/translations';

interface HeaderProps {
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSettings }) => {
  return (
    <header
      id="app-header"
      className="w-full flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white/95 backdrop-blur-sm sticky top-0 z-30 transition-colors"
    >
      <div className="flex items-center gap-2.5">
        {/* Minimal WhatsApp-style icon */}
        <div
          id="header-app-icon"
          className="w-9 h-9 rounded-xl bg-[var(--theme-color)] flex items-center justify-center text-white shadow-xs flex-shrink-0 transition-transform active:scale-95"
        >
          <MessageCircle className="w-5 h-5 fill-current stroke-white stroke-[1.5]" />
        </div>

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
