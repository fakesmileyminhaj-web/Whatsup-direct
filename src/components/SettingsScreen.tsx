import React, { useState } from 'react';
import {
  ArrowLeft,
  Moon,
  Sun,
  Monitor,
  Palette,
  Globe,
  Sliders,
  History,
  Trash2,
  ExternalLink,
  ShieldCheck,
  Camera,
  Info,
  Check,
  Smartphone,
  CheckCircle2,
} from 'lucide-react';
import { AppSettings, Language, RecentNumber, ThemeColor, ThemeMode } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { COUNTRIES } from '../data/countries';
import { SOCIAL_LINKS } from './Footer';

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
  const t = TRANSLATIONS[settings.language];
  const [showClearHistoryConfirm, setShowClearHistoryConfirm] = useState(false);
  const [showClearAllDataConfirm, setShowClearAllDataConfirm] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showApkGuide, setShowApkGuide] = useState(false);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setStatusNotice(msg);
    setTimeout(() => setStatusNotice(null), 3000);
  };

  const themeColors: Array<{ id: ThemeColor; name: string; hex: string }> = [
    { id: 'whatsapp', name: t.colorWhatsApp, hex: '#25D366' },
    { id: 'emerald', name: t.colorEmerald, hex: '#10B981' },
    { id: 'teal', name: t.colorTeal, hex: '#0D9488' },
    { id: 'forest', name: t.colorForest, hex: '#15803D' },
  ];

  return (
    <div id="settings-screen" className="min-h-screen w-full flex flex-col bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors pb-16">
      {/* Compact Header with Back Button */}
      <header className="sticky top-0 z-20 flex items-center gap-3 px-4 py-3 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-100 dark:border-gray-800">
        <button
          id="btn-settings-back"
          onClick={onBack}
          aria-label="Back to main"
          className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition active:scale-95"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-base font-semibold text-gray-900 dark:text-white">
          {t.settings}
        </h1>
      </header>

      {/* Floating Status Toast */}
      {statusNotice && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-4 py-2 rounded-xl text-xs font-medium shadow-lg animate-in fade-in slide-in-from-top-2">
          {statusNotice}
        </div>
      )}

      {/* Settings Sections Container */}
      <div className="w-full max-w-lg mx-auto p-4 flex flex-col gap-6">
        
        {/* 1. APPEARANCE */}
        <section id="section-appearance" className="flex flex-col gap-2.5">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 px-1">
            {t.appearance}
          </h2>

          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-3.5 flex flex-col gap-4 shadow-xs">
            {/* Theme Mode Toggles */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                {t.themeMode}
              </span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { mode: 'light' as ThemeMode, label: t.lightMode, icon: Sun },
                  { mode: 'dark' as ThemeMode, label: t.darkMode, icon: Moon },
                  { mode: 'system' as ThemeMode, label: t.systemDefault, icon: Monitor },
                ].map(({ mode, label, icon: Icon }) => (
                  <button
                    key={mode}
                    id={`theme-mode-${mode}`}
                    onClick={() => onUpdateSettings({ themeMode: mode })}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-medium transition active:scale-95 ${
                      settings.themeMode === mode
                        ? 'border-[var(--theme-color)] bg-[var(--theme-surface)] text-[var(--theme-text)] dark:text-white'
                        : 'border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4 mb-1" />
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Theme Color Palette */}
            <div className="flex flex-col gap-2 pt-2 border-t border-gray-100 dark:border-gray-800/80">
              <div className="flex items-center gap-1.5 text-xs font-medium text-gray-700 dark:text-gray-300">
                <Palette className="w-3.5 h-3.5 text-gray-400" />
                <span>{t.themeColor}</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {themeColors.map((color) => {
                  const isSelected = settings.themeColor === color.id;
                  return (
                    <button
                      key={color.id}
                      id={`theme-color-${color.id}`}
                      onClick={() => onUpdateSettings({ themeColor: color.id })}
                      className={`flex items-center gap-2 p-2 rounded-xl border text-xs font-medium transition active:scale-95 ${
                        isSelected
                          ? 'border-[var(--theme-color)] bg-[var(--theme-surface)] text-gray-900 dark:text-white'
                          : 'border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-gray-300'
                      }`}
                    >
                      <span
                        className="w-4 h-4 rounded-full flex-shrink-0 shadow-xs"
                        style={{ backgroundColor: color.hex }}
                      />
                      <span className="truncate">{color.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* 2. LANGUAGE */}
        <section id="section-language" className="flex flex-col gap-2.5">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 px-1">
            {t.language}
          </h2>

          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-2 grid grid-cols-2 gap-2 shadow-xs">
            {[
              { code: 'en' as Language, label: 'English', sub: 'Default' },
              { code: 'bn' as Language, label: 'বাংলা', sub: 'Bengali' },
            ].map((lang) => (
              <button
                key={lang.code}
                id={`lang-btn-${lang.code}`}
                onClick={() => onUpdateSettings({ language: lang.code })}
                className={`flex items-center justify-between p-3 rounded-xl border text-left transition active:scale-98 ${
                  settings.language === lang.code
                    ? 'border-[var(--theme-color)] bg-[var(--theme-surface)] text-[var(--theme-text)] dark:text-white'
                    : 'border-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <div>
                  <div className="text-sm font-semibold">{lang.label}</div>
                  <div className="text-[11px] text-gray-400">{lang.sub}</div>
                </div>
                {settings.language === lang.code && (
                  <Check className="w-4 h-4 text-[var(--theme-color)]" />
                )}
              </button>
            ))}
          </div>
        </section>

        {/* 3. APP PREFERENCES */}
        <section id="section-app-preferences" className="flex flex-col gap-2.5">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 px-1">
            {t.appPreferences}
          </h2>

          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 divide-y divide-gray-100 dark:divide-gray-800/80 shadow-xs">
            {/* Default Country Code */}
            <div className="p-3.5 flex items-center justify-between gap-3">
              <div className="flex flex-col">
                <span className="text-xs font-medium text-gray-900 dark:text-white">
                  {t.defaultCountry}
                </span>
                <span className="text-[11px] text-gray-500 dark:text-gray-400">
                  Select your primary region for quick input
                </span>
              </div>
              <select
                id="select-default-country"
                value={settings.defaultCountryCode}
                onChange={(e) => onUpdateSettings({ defaultCountryCode: e.target.value })}
                className="px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs font-medium text-gray-900 dark:text-white focus:border-[var(--theme-color)] focus:outline-none"
              >
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.nameEn} ({c.dialCode})
                  </option>
                ))}
              </select>
            </div>

            {/* Auto WhatsApp Link Generation Toggle */}
            <div className="p-3.5 flex items-center justify-between gap-3">
              <div className="flex flex-col">
                <span className="text-xs font-medium text-gray-900 dark:text-white">
                  {t.autoGenerateLink}
                </span>
                <span className="text-[11px] text-gray-500 dark:text-gray-400">
                  {t.autoGenerateDesc}
                </span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={settings.autoGenerateLink}
                onClick={() => onUpdateSettings({ autoGenerateLink: !settings.autoGenerateLink })}
                className={`w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${
                  settings.autoGenerateLink ? 'bg-[var(--theme-color)]' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                    settings.autoGenerateLink ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Wave Animation Toggle */}
            <div className="p-3.5 flex items-center justify-between gap-3">
              <div className="flex flex-col">
                <span className="text-xs font-medium text-gray-900 dark:text-white">
                  {t.waveAnimation}
                </span>
                <span className="text-[11px] text-gray-500 dark:text-gray-400">
                  {t.waveAnimationDesc}
                </span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={settings.waveAnimation}
                onClick={() => onUpdateSettings({ waveAnimation: !settings.waveAnimation })}
                className={`w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${
                  settings.waveAnimation ? 'bg-[var(--theme-color)]' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                    settings.waveAnimation ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Wave Speed Setting (if Wave is on) */}
            {settings.waveAnimation && (
              <div className="p-3.5 flex items-center justify-between gap-3 bg-gray-50/50 dark:bg-gray-800/30">
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-gray-900 dark:text-white">
                    {t.waveSpeed}
                  </span>
                  <span className="text-[11px] text-gray-500 dark:text-gray-400">
                    Adjust subtle rhythm cycle
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {(['slow', 'natural', 'calm'] as const).map((spd) => (
                    <button
                      key={spd}
                      onClick={() => onUpdateSettings({ waveSpeed: spd })}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition ${
                        settings.waveSpeed === spd
                          ? 'bg-[var(--theme-color)] text-white'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
                      }`}
                    >
                      {spd === 'slow' ? t.speedSlow : spd === 'natural' ? t.speedNatural : t.speedCalm}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* 4. RECENT NUMBERS HISTORY */}
        <section id="section-recent-numbers" className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              {t.recentNumbers}
            </h2>
            {settings.historyEnabled && recentNumbers.length > 0 && (
              <button
                type="button"
                onClick={() => setShowClearHistoryConfirm(true)}
                className="text-[11px] text-rose-500 hover:text-rose-600 font-medium transition flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                <span>{t.clearAllHistory}</span>
              </button>
            )}
          </div>

          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-3.5 flex flex-col gap-3 shadow-xs">
            {/* History Toggle */}
            <div className="flex items-center justify-between gap-3 pb-2 border-b border-gray-100 dark:border-gray-800">
              <div className="flex flex-col">
                <span className="text-xs font-medium text-gray-900 dark:text-white">
                  {t.historyToggle}
                </span>
                <span className="text-[11px] text-gray-500 dark:text-gray-400">
                  {t.historyDesc}
                </span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={settings.historyEnabled}
                onClick={() => onUpdateSettings({ historyEnabled: !settings.historyEnabled })}
                className={`w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${
                  settings.historyEnabled ? 'bg-[var(--theme-color)]' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                    settings.historyEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Recent Numbers List */}
            {settings.historyEnabled ? (
              recentNumbers.length === 0 ? (
                <div className="py-4 text-center text-xs text-gray-400 dark:text-gray-500">
                  {t.noRecentNumbers}
                </div>
              ) : (
                <div className="flex flex-col gap-2 max-h-56 overflow-y-auto">
                  {recentNumbers.map((item) => {
                    const dateStr = new Date(item.timestamp).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    });

                    return (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700/60 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-semibold text-gray-900 dark:text-white">
                            +{item.internationalNumber}
                          </span>
                          <span className="text-[10px] text-gray-400">
                            {dateStr}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => onOpenRecentNumber(item.waUrl)}
                            className="px-2.5 py-1 rounded-md bg-[var(--theme-color)] text-white text-[11px] font-medium flex items-center gap-1 hover:opacity-95 transition"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>Chat</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteRecentItem(item.id)}
                            className="p-1 text-gray-400 hover:text-rose-500 transition"
                            title={t.deleteItem}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            ) : (
              <div className="py-2 text-center text-xs text-gray-400">
                History is currently disabled.
              </div>
            )}
          </div>
        </section>

        {/* 5. SCANNER & PERMISSIONS */}
        <section id="section-scanner-settings" className="flex flex-col gap-2.5">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 px-1">
            {t.scannerSettings}
          </h2>

          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-3.5 flex flex-col gap-3 shadow-xs">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-gray-900 dark:text-white">
                  {t.ocrPrivacyTitle}
                </span>
                <span className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed mt-0.5">
                  {t.ocrPrivacyDesc}
                </span>
              </div>
            </div>

            <div className="divide-y divide-gray-100 dark:divide-gray-800/80 pt-1">
              <div className="py-2 flex items-center justify-between text-xs">
                <span className="text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-gray-400" />
                  {t.cameraStatus}
                </span>
                <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                  {t.cameraStatusPrompt}
                </span>
              </div>
              <div className="py-2 flex items-center justify-between text-xs">
                <span className="text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-gray-400" />
                  {t.galleryStatus}
                </span>
                <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                  {t.galleryStatusAvailable}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* 6. PRIVACY & RESET */}
        <section id="section-privacy-reset" className="flex flex-col gap-2.5">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 px-1">
            {t.privacyPermissions}
          </h2>

          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-3.5 flex flex-col gap-3 shadow-xs">
            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
              {t.localStorageOnly}
            </p>

            <button
              type="button"
              onClick={() => setShowClearAllDataConfirm(true)}
              className="w-full py-2.5 px-3 rounded-xl border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs font-medium hover:bg-rose-50 dark:hover:bg-rose-950/30 transition text-center active:scale-98"
            >
              {t.clearAllData}
            </button>
          </div>
        </section>

        {/* 7. ABOUT APP */}
        <section id="section-about-app" className="flex flex-col gap-2.5">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 px-1">
            {t.aboutApp}
          </h2>

          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 flex flex-col gap-3 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
              <div>
                <div className="text-sm font-bold text-gray-900 dark:text-white">
                  WhatsApp Direct
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {t.developer}
                </div>
              </div>
              <div className="text-right">
                <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                  v1.0.0
                </span>
                <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">
                  {t.buildStatus}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setShowPrivacyPolicy(true)}
                className="py-2 px-2.5 rounded-xl border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 text-center font-medium transition"
              >
                {t.privacyPolicy}
              </button>
              <button
                type="button"
                onClick={() => setShowTerms(true)}
                className="py-2 px-2.5 rounded-xl border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 text-center font-medium transition"
              >
                {t.termsOfUse}
              </button>
              <button
                type="button"
                onClick={() => setShowApkGuide(true)}
                className="py-2 px-2.5 rounded-xl bg-[var(--theme-surface)] text-[var(--theme-text)] dark:text-white border border-[var(--theme-border)] text-center font-semibold transition flex items-center justify-center gap-1"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>APK Guide</span>
              </button>
            </div>

            {/* Developer Social Links in About section as requested */}
            <div className="pt-2 border-t border-gray-100 dark:border-gray-800/80 flex flex-col gap-1.5">
              <span className="text-[11px] font-medium text-gray-400">
                Developer Profiles:
              </span>
              <div className="flex items-center gap-3">
                {SOCIAL_LINKS.map((s) => (
                  <a
                    key={s.id}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[var(--theme-color)] hover:underline flex items-center gap-1"
                  >
                    <span>{s.name}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>

      </div>

      {/* CONFIRMATION MODAL: Clear History */}
      {showClearHistoryConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-sm bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-xl border border-gray-100 dark:border-gray-800 flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              {t.clearAllHistory}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              {t.confirmClearHistory}
            </p>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowClearHistoryConfirm(false)}
                className="flex-1 py-2 px-3 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-700 dark:text-gray-300"
              >
                {t.cancel}
              </button>
              <button
                type="button"
                onClick={() => {
                  onClearHistory();
                  setShowClearHistoryConfirm(false);
                  showToast(t.historyCleared);
                }}
                className="flex-1 py-2 px-3 rounded-xl bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 transition"
              >
                {t.clearAllHistory}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL: Clear All Data */}
      {showClearAllDataConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-sm bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-xl border border-gray-100 dark:border-gray-800 flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              {t.clearAllData}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              {t.confirmClearAllData}
            </p>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowClearAllDataConfirm(false)}
                className="flex-1 py-2 px-3 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-700 dark:text-gray-300"
              >
                {t.cancel}
              </button>
              <button
                type="button"
                onClick={() => {
                  onClearAllData();
                  setShowClearAllDataConfirm(false);
                  showToast(t.allDataCleared);
                }}
                className="flex-1 py-2 px-3 rounded-xl bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 transition"
              >
                Reset All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Privacy Policy */}
      {showPrivacyPolicy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-xl border border-gray-100 dark:border-gray-800 flex flex-col gap-3 max-h-[80vh] overflow-y-auto">
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              Privacy Policy
            </h3>
            <div className="text-xs text-gray-600 dark:text-gray-300 space-y-2 leading-relaxed">
              <p>
                <strong>WhatsApp Direct</strong> by SmileyMinhaj is engineered with an absolute privacy-first architecture.
              </p>
              <p>
                • <strong>Zero Data Transmission:</strong> None of the phone numbers, visiting cards, images, or QR codes you process are ever transmitted to our or third-party servers.
              </p>
              <p>
                • <strong>On-Device Machine Learning:</strong> All OCR optical text scanning and QR code extraction operations run 100% locally inside your client environment.
              </p>
              <p>
                • <strong>Local-Only Storage:</strong> Your preferences and recent numbers history are stored strictly on your device using localStorage and can be purged at any time.
              </p>
              <p>
                • <strong>No Contacts Access:</strong> The app never asks for or reads your address book or device contacts list.
              </p>
            </div>
            <button
              onClick={() => setShowPrivacyPolicy(false)}
              className="mt-2 w-full py-2.5 rounded-xl bg-[var(--theme-color)] text-white text-xs font-semibold"
            >
              {t.close}
            </button>
          </div>
        </div>
      )}

      {/* MODAL: Terms of Use */}
      {showTerms && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-xl border border-gray-100 dark:border-gray-800 flex flex-col gap-3 max-h-[80vh] overflow-y-auto">
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              Terms of Use
            </h3>
            <div className="text-xs text-gray-600 dark:text-gray-300 space-y-2 leading-relaxed">
              <p>
                <strong>WhatsApp Direct</strong> provides a convenient utility to trigger WhatsApp Click-to-Chat URLs (https://wa.me) directly without requiring phone numbers to be saved into local phone address books.
              </p>
              <p>
                • WhatsApp Direct is not affiliated, associated, authorized, endorsed by, or in any way officially connected with WhatsApp LLC or Meta Platforms, Inc.
              </p>
              <p>
                • The user remains solely responsible for the messages sent and recipient phone numbers entered. The app does not automate message sending.
              </p>
            </div>
            <button
              onClick={() => setShowTerms(false)}
              className="mt-2 w-full py-2.5 rounded-xl bg-[var(--theme-color)] text-white text-xs font-semibold"
            >
              {t.close}
            </button>
          </div>
        </div>
      )}

      {/* MODAL: Android APK Build Guide */}
      {showApkGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-xl border border-gray-100 dark:border-gray-800 flex flex-col gap-3 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <Smartphone className="w-5 h-5" />
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  Android APK Packaging Guide
                </h3>
              </div>
              <button
                onClick={() => setShowApkGuide(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-gray-600 dark:text-gray-300 space-y-3 leading-relaxed">
              <p>
                <strong>WhatsApp Direct</strong> is built as a complete, installable, Android-ready Progressive Web Application that compiles directly into an APK using industry-standard tools:
              </p>

              <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-xl space-y-1.5 font-mono text-[11px]">
                <div className="font-sans font-semibold text-gray-900 dark:text-white text-xs">
                  Method 1: Google Bubblewrap (Fastest Trusted Web Activity APK)
                </div>
                <p className="font-sans text-gray-500">Run in your terminal:</p>
                <div className="text-[var(--theme-color)]">npm i -g @bubblewrap/cli</div>
                <div className="text-[var(--theme-color)]">bubblewrap init --manifest=https://&lt;your-app-url&gt;/manifest.json</div>
                <div className="text-[var(--theme-color)]">bubblewrap build</div>
                <p className="font-sans text-gray-500 text-[10px]">Output: Generates release/debug APK &amp; Android App Bundle (AAB) for Google Play.</p>
              </div>

              <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-xl space-y-1.5 font-mono text-[11px]">
                <div className="font-sans font-semibold text-gray-900 dark:text-white text-xs">
                  Method 2: Capacitor / Android Studio
                </div>
                <div className="text-[var(--theme-color)]">npm i @capacitor/core @capacitor/cli @capacitor/android</div>
                <div className="text-[var(--theme-color)]">npx cap init "WhatsApp Direct" com.smileyminhaj.wadirect</div>
                <div className="text-[var(--theme-color)]">npm run build &amp;&amp; npx cap add android</div>
                <div className="text-[var(--theme-color)]">npx cap open android</div>
                <p className="font-sans text-gray-500 text-[10px]">Build APK directly in Android Studio via Build &gt; Build APK(s).</p>
              </div>

              <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-xl space-y-1.5 font-mono text-[11px]">
                <div className="font-sans font-semibold text-gray-900 dark:text-white text-xs">
                  Method 3: Direct Chrome / Android Home Screen Install (Instant PWA)
                </div>
                <p className="font-sans text-gray-500">
                  Open the app in Google Chrome on Android, tap the ⋮ menu and select <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>. It runs standalone in full-screen mode with the custom WhatsApp Direct icon.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowApkGuide(false)}
              className="mt-1 w-full py-2.5 rounded-xl bg-[var(--theme-color)] text-white text-xs font-semibold"
            >
              {t.close}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
