import React, { useState, useRef } from 'react';
import {
  ArrowLeft,
  Palette,
  Sliders,
  History,
  Trash2,
  ExternalLink,
  ShieldCheck,
  Check,
  CheckCircle2,
  Mail,
  Linkedin,
  Instagram,
  Facebook,
} from 'lucide-react';
import { AppSettings, RecentNumber, ThemeColor } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { COUNTRIES } from '../data/countries';
import { SOCIAL_PROFILES } from '../data/socialProfiles';

interface SettingsScreenProps {
  settings: AppSettings;
  onUpdateSettings: (updater: Partial<AppSettings>) => void;
  recentNumbers: RecentNumber[];
  onOpenRecentNumber: (waUrl: string) => void;
  onClearHistory: () => void;
  onDeleteRecentItem: (id: string) => void;
  onClearAllData: () => void;
  onBack: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  settings,
  onUpdateSettings,
  recentNumbers,
  onOpenRecentNumber,
  onClearHistory,
  onDeleteRecentItem,
  onClearAllData,
  onBack,
}) => {
  const [showClearHistoryConfirm, setShowClearHistoryConfirm] = useState(false);
  const [showClearAllDataConfirm, setShowClearAllDataConfirm] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  const customColorInputRef = useRef<HTMLInputElement | null>(null);

  const showToast = (msg: string) => {
    setStatusNotice(msg);
    setTimeout(() => setStatusNotice(null), 3000);
  };

  const handleSelectThemeColor = (colorId: ThemeColor) => {
    if (colorId === 'custom') {
      const customHex = settings.customColorHex || '#EF4444';
      onUpdateSettings({
        themeColor: 'custom',
        customColorHex: customHex,
      });
      // Trigger color picker
      setTimeout(() => {
        customColorInputRef.current?.click();
      }, 50);
    } else {
      onUpdateSettings({ themeColor: colorId });
    }
  };

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const hex = e.target.value;
    onUpdateSettings({
      themeColor: 'custom',
      customColorHex: hex,
    });
  };

  // Map social IDs to Lucide components
  const getSocialIcon = (id: string) => {
    switch (id) {
      case 'facebook':
        return Facebook;
      case 'instagram':
        return Instagram;
      case 'linkedin':
        return Linkedin;
      case 'gmail':
        return Mail;
      default:
        return ExternalLink;
    }
  };

  return (
    <div
      id="settings-screen"
      className="min-h-screen w-full flex flex-col text-gray-900 transition-colors pb-12"
      style={{ backgroundColor: 'var(--theme-bg)' }}
    >
      {/* Compact Header with Back Button */}
      <header className="sticky top-0 z-20 flex items-center gap-3 px-4 py-3 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-2xs">
        <button
          id="btn-settings-back"
          onClick={onBack}
          aria-label="Back to main"
          className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-600 hover:bg-gray-100 transition active:scale-95 cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-base font-semibold text-gray-900">
          {TRANSLATIONS.settings}
        </h1>
      </header>

      {/* Floating Status Toast */}
      {statusNotice && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white px-4 py-2 rounded-xl text-xs font-medium shadow-lg animate-in fade-in slide-in-from-top-2">
          {statusNotice}
        </div>
      )}

      {/* Settings Container */}
      <div className="w-full max-w-lg mx-auto p-4 flex flex-col gap-6 flex-1">
        {/* 1. THEME COLOR SELECTION (EXACTLY 3 OPTIONS: WhatsApp Green, Dark Purple, Custom) */}
        <section id="section-appearance" className="flex flex-col gap-2.5">
          <div className="flex items-center gap-2 px-1 text-xs font-semibold uppercase tracking-wider text-gray-500">
            <Palette className="w-3.5 h-3.5" />
            <span>{TRANSLATIONS.appearance}</span>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4 flex flex-col gap-3 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-700">
                {TRANSLATIONS.themeColor}
              </span>
              {settings.themeColor === 'custom' && (
                <span className="text-[11px] font-mono text-gray-500">
                  {settings.customColorHex || '#EF4444'}
                </span>
              )}
            </div>

            {/* Hidden native color input for custom picker */}
            <input
              ref={customColorInputRef}
              type="color"
              value={settings.customColorHex || '#EF4444'}
              onChange={handleCustomColorChange}
              className="hidden"
            />

            {/* Exactly 3 Theme Options */}
            <div className="grid grid-cols-3 gap-2.5">
              {/* Option 1: WhatsApp Green */}
              <button
                type="button"
                id="theme-color-whatsapp"
                onClick={() => handleSelectThemeColor('whatsapp')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition active:scale-95 cursor-pointer ${
                  settings.themeColor === 'whatsapp'
                    ? 'border-[#25D366] bg-[#25D366]/10 text-gray-900 shadow-xs'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                <div className="w-7 h-7 rounded-full bg-[#25D366] flex items-center justify-center text-white shadow-xs">
                  {settings.themeColor === 'whatsapp' && (
                    <Check className="w-4 h-4 stroke-[3]" />
                  )}
                </div>
                <span className="text-xs font-medium text-center leading-tight">
                  {TRANSLATIONS.colorWhatsApp}
                </span>
              </button>

              {/* Option 2: Dark Purple */}
              <button
                type="button"
                id="theme-color-purple"
                onClick={() => handleSelectThemeColor('purple')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition active:scale-95 cursor-pointer ${
                  settings.themeColor === 'purple'
                    ? 'border-[#6B21A8] bg-[#6B21A8]/10 text-gray-900 shadow-xs'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                <div className="w-7 h-7 rounded-full bg-[#6B21A8] flex items-center justify-center text-white shadow-xs">
                  {settings.themeColor === 'purple' && (
                    <Check className="w-4 h-4 stroke-[3]" />
                  )}
                </div>
                <span className="text-xs font-medium text-center leading-tight">
                  {TRANSLATIONS.colorPurple}
                </span>
              </button>

              {/* Option 3: Custom Color */}
              <button
                type="button"
                id="theme-color-custom"
                onClick={() => handleSelectThemeColor('custom')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition active:scale-95 cursor-pointer relative ${
                  settings.themeColor === 'custom'
                    ? 'border-[var(--theme-color)] bg-[var(--theme-surface)] text-gray-900 shadow-xs'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-white shadow-xs"
                  style={{
                    backgroundColor: settings.customColorHex || '#EF4444',
                  }}
                >
                  {settings.themeColor === 'custom' && (
                    <Check className="w-4 h-4 stroke-[3]" />
                  )}
                </div>
                <span className="text-xs font-medium text-center leading-tight">
                  {TRANSLATIONS.colorCustom}
                </span>
              </button>
            </div>

            {/* Custom Color Button helper if custom is active */}
            {settings.themeColor === 'custom' && (
              <button
                type="button"
                onClick={() => customColorInputRef.current?.click()}
                className="w-full py-2 px-3 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 text-xs font-medium text-gray-700 flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <div
                  className="w-3.5 h-3.5 rounded-full border border-gray-300"
                  style={{ backgroundColor: settings.customColorHex || '#EF4444' }}
                />
                <span>Change Custom Color</span>
              </button>
            )}
          </div>
        </section>

        {/* 2. APP PREFERENCES */}
        <section id="section-preferences" className="flex flex-col gap-2.5">
          <div className="flex items-center gap-2 px-1 text-xs font-semibold uppercase tracking-wider text-gray-500">
            <Sliders className="w-3.5 h-3.5" />
            <span>{TRANSLATIONS.appPreferences}</span>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4 flex flex-col gap-4 shadow-xs">
            {/* Default Country */}
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-xs font-medium text-gray-800">
                  {TRANSLATIONS.defaultCountry}
                </span>
                <span className="text-[11px] text-gray-400">
                  Preselected country when opening app
                </span>
              </div>
              <select
                id="select-default-country"
                value={settings.defaultCountryCode}
                onChange={(e) =>
                  onUpdateSettings({ defaultCountryCode: e.target.value })
                }
                className="px-2.5 py-1.5 rounded-xl border border-gray-200 bg-gray-50 text-xs font-medium text-gray-800 focus:outline-none focus:border-[var(--theme-color)]"
              >
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.nameEn} ({c.dialCode})
                  </option>
                ))}
              </select>
            </div>

            {/* Bottom Wave Animation Toggle */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <div className="flex flex-col">
                <span className="text-xs font-medium text-gray-800">
                  {TRANSLATIONS.waveAnimation}
                </span>
                <span className="text-[11px] text-gray-400">
                  {TRANSLATIONS.waveAnimationDesc}
                </span>
              </div>
              <button
                type="button"
                id="toggle-wave-animation"
                onClick={() =>
                  onUpdateSettings({ waveAnimation: !settings.waveAnimation })
                }
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  settings.waveAnimation
                    ? 'bg-[var(--theme-color)]'
                    : 'bg-gray-300'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform absolute top-0.5 ${
                    settings.waveAnimation ? 'left-5.5' : 'left-0.5'
                  }`}
                />
              </button>
            </div>

            {/* Wave Speed Selector */}
            {settings.waveAnimation && (
              <div className="flex items-center justify-between pl-2">
                <span className="text-xs text-gray-600">
                  {TRANSLATIONS.waveSpeed}
                </span>
                <div className="flex items-center gap-1.5">
                  {(
                    [
                      { id: 'calm', label: TRANSLATIONS.speedCalm },
                      { id: 'natural', label: TRANSLATIONS.speedNatural },
                      { id: 'slow', label: TRANSLATIONS.speedSlow },
                    ] as const
                  ).map((spd) => (
                    <button
                      key={spd.id}
                      type="button"
                      onClick={() => onUpdateSettings({ waveSpeed: spd.id })}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition cursor-pointer ${
                        settings.waveSpeed === spd.id
                          ? 'bg-[var(--theme-color)] text-white shadow-xs'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {spd.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* 3. RECENT NUMBERS */}
        <section id="section-history" className="flex flex-col gap-2.5">
          <div className="flex items-center gap-2 px-1 text-xs font-semibold uppercase tracking-wider text-gray-500">
            <History className="w-3.5 h-3.5" />
            <span>{TRANSLATIONS.recentNumbers}</span>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4 flex flex-col gap-3 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-xs font-medium text-gray-800">
                  {TRANSLATIONS.historyToggle}
                </span>
                <span className="text-[11px] text-gray-400">
                  {TRANSLATIONS.historyDesc}
                </span>
              </div>
              <button
                type="button"
                id="toggle-save-history"
                onClick={() =>
                  onUpdateSettings({ historyEnabled: !settings.historyEnabled })
                }
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  settings.historyEnabled
                    ? 'bg-[var(--theme-color)]'
                    : 'bg-gray-300'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform absolute top-0.5 ${
                    settings.historyEnabled ? 'left-5.5' : 'left-0.5'
                  }`}
                />
              </button>
            </div>

            {settings.historyEnabled && (
              <>
                {recentNumbers.length === 0 ? (
                  <div className="py-4 text-center text-xs text-gray-400">
                    {TRANSLATIONS.noRecentNumbers}
                  </div>
                ) : (
                  <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto">
                    {recentNumbers.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-2 rounded-xl bg-gray-50 hover:bg-gray-100 transition"
                      >
                        <button
                          type="button"
                          onClick={() => onOpenRecentNumber(item.waUrl)}
                          className="flex items-center gap-2 text-left min-w-0 cursor-pointer"
                        >
                          <span className="text-xs font-mono font-semibold text-gray-800">
                            {item.internationalNumber}
                          </span>
                          <ExternalLink className="w-3 h-3 text-gray-400" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteRecentItem(item.id)}
                          aria-label="Remove number"
                          className="p-1 text-gray-400 hover:text-red-500 transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {recentNumbers.length > 0 && (
                  <div className="pt-2 border-t border-gray-100 flex justify-end">
                    {showClearHistoryConfirm ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-red-600">Delete all?</span>
                        <button
                          type="button"
                          onClick={() => {
                            onClearHistory();
                            setShowClearHistoryConfirm(false);
                            showToast(TRANSLATIONS.historyCleared);
                          }}
                          className="px-2.5 py-1 bg-red-600 text-white rounded-lg text-xs font-medium cursor-pointer"
                        >
                          Yes
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowClearHistoryConfirm(false)}
                          className="px-2.5 py-1 bg-gray-200 text-gray-700 rounded-lg text-xs font-medium cursor-pointer"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowClearHistoryConfirm(true)}
                        className="text-xs text-red-500 hover:text-red-600 font-medium cursor-pointer"
                      >
                        {TRANSLATIONS.clearAllHistory}
                      </button>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        {/* 4. PRIVACY & STORAGE */}
        <section id="section-privacy" className="flex flex-col gap-2.5">
          <div className="flex items-center gap-2 px-1 text-xs font-semibold uppercase tracking-wider text-gray-500">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{TRANSLATIONS.privacyPermissions}</span>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4 flex flex-col gap-3 shadow-xs">
            <div className="flex items-start gap-2 text-xs text-gray-600 leading-relaxed">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <span>{TRANSLATIONS.localStorageOnly}</span>
            </div>

            <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={() => setShowPrivacyPolicy(true)}
                className="text-[var(--theme-text)] hover:underline font-medium cursor-pointer"
              >
                {TRANSLATIONS.privacyPolicy}
              </button>
              <button
                type="button"
                onClick={() => setShowTerms(true)}
                className="text-[var(--theme-text)] hover:underline font-medium cursor-pointer"
              >
                {TRANSLATIONS.termsOfUse}
              </button>
            </div>

            {/* Reset All Data */}
            <div className="pt-2 border-t border-gray-100">
              {showClearAllDataConfirm ? (
                <div className="flex items-center justify-between bg-red-50 p-2.5 rounded-xl">
                  <span className="text-xs text-red-700">Reset all app settings?</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        onClearAllData();
                        setShowClearAllDataConfirm(false);
                        showToast(TRANSLATIONS.allDataCleared);
                      }}
                      className="px-3 py-1 bg-red-600 text-white rounded-lg text-xs font-semibold cursor-pointer"
                    >
                      Confirm
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowClearAllDataConfirm(false)}
                      className="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg text-xs font-medium cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  id="btn-clear-all-data"
                  onClick={() => setShowClearAllDataConfirm(true)}
                  className="w-full py-2 px-3 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-medium transition cursor-pointer text-center"
                >
                  {TRANSLATIONS.clearAllData}
                </button>
              )}
            </div>
          </div>
        </section>

        {/* 5. DEVELOPER SECTION (AT THE VERY BOTTOM OF SETTINGS SCREEN) */}
        {/* Requirement:
            The bottom section should contain:
            Developed by
            SmileyMinhaj
            Below it, show only these small social icons:
            - Facebook
            - Instagram
            - LinkedIn
            - Gmail
            Requirements:
            - Icons must be small.
            - Icons should be positioned close together.
            - Do NOT display the smileyminhaj username underneath.
            - Do NOT display social platform names.
            - Do NOT use official Facebook/Instagram/LinkedIn/Gmail brand colors.
            - All icons must use the CURRENT selected app theme color.
            - Icons must remain clickable.
            - Each icon must link to the corresponding SmileyMinhaj account/profile.
        */}
        <div
          id="settings-developer-footer"
          className="mt-6 pt-4 border-t border-gray-200 flex flex-col items-center justify-center text-center gap-2"
        >
          <div className="flex flex-col items-center leading-tight">
            <span className="text-[11px] text-gray-500 font-normal">
              Developed by
            </span>
            <span className="text-xs font-semibold text-gray-800">
              SmileyMinhaj
            </span>
          </div>

          {/* Small theme-colored social icons close together */}
          <div
            id="settings-social-icons-group"
            className="flex items-center justify-center gap-3 mt-0.5"
          >
            {SOCIAL_PROFILES.map((profile) => {
              const Icon = getSocialIcon(profile.id);
              return (
                <a
                  key={profile.id}
                  id={`settings-social-${profile.id}`}
                  href={profile.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={profile.name}
                  className="w-7 h-7 rounded-lg bg-[var(--theme-surface)] text-[var(--theme-color)] hover:bg-[var(--theme-color)] hover:text-white flex items-center justify-center transition-all active:scale-90 cursor-pointer shadow-2xs"
                >
                  <Icon className="w-3.5 h-3.5 stroke-[2] fill-none" />
                </a>
              );
            })}
          </div>
        </div>
      </div>

      {/* MODAL: Privacy Policy */}
      {showPrivacyPolicy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-2xl p-5 shadow-xl border border-gray-100 flex flex-col gap-3 max-h-[80vh] overflow-y-auto">
            <h3 className="text-base font-bold text-gray-900">
              Privacy Policy
            </h3>
            <div className="text-xs text-gray-600 space-y-2 leading-relaxed">
              <p>
                <strong>WhatsApp Direct</strong> is engineered with a strict privacy-first architecture.
              </p>
              <p>
                • <strong>Zero Data Transmission:</strong> None of the phone numbers, visiting cards, images, or QR codes you process are ever transmitted to any remote servers.
              </p>
              <p>
                • <strong>On-Device Processing:</strong> All OCR optical text recognition and QR code extraction operations run 100% locally on your device.
              </p>
              <p>
                • <strong>Local-Only Storage:</strong> Your preferences and recent numbers history are stored strictly on your device using localStorage and can be wiped at any time.
              </p>
              <p>
                • <strong>No Contacts Access:</strong> The app never asks for or reads your address book or device contacts list.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowPrivacyPolicy(false)}
              className="mt-2 w-full py-2.5 rounded-xl bg-[var(--theme-color)] text-white text-xs font-semibold cursor-pointer"
            >
              {TRANSLATIONS.close}
            </button>
          </div>
        </div>
      )}

      {/* MODAL: Terms of Use */}
      {showTerms && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-2xl p-5 shadow-xl border border-gray-100 flex flex-col gap-3 max-h-[80vh] overflow-y-auto">
            <h3 className="text-base font-bold text-gray-900">
              Terms of Use
            </h3>
            <div className="text-xs text-gray-600 space-y-2 leading-relaxed">
              <p>
                <strong>WhatsApp Direct</strong> provides a convenient utility to trigger WhatsApp Click-to-Chat URLs (https://wa.me) directly without requiring phone numbers to be saved into local phone address books.
              </p>
              <p>
                • WhatsApp Direct is not affiliated, associated, authorized, endorsed by, or in any way officially connected with WhatsApp LLC or Meta Platforms, Inc.
              </p>
              <p>
                • The user remains solely responsible for the messages sent and recipient phone numbers entered. The app does not automate message sending; the user always sends manually within WhatsApp.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowTerms(false)}
              className="mt-2 w-full py-2.5 rounded-xl bg-[var(--theme-color)] text-white text-xs font-semibold cursor-pointer"
            >
              {TRANSLATIONS.close}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
