import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Header } from './components/Header';
import { ActionCards } from './components/ActionCards';
import { ManualInputSection } from './components/ManualInputSection';
import { CountrySelectorModal } from './components/CountrySelectorModal';
import { ScannerModal } from './components/ScannerModal';
import { SettingsScreen } from './components/SettingsScreen';
import { Footer } from './components/Footer';
import { WaveAnimation } from './components/WaveAnimation';
import { DEFAULT_COUNTRY_CODE, getCountryByCode } from './data/countries';
import { TRANSLATIONS } from './data/translations';
import { ActionOption, AppSettings, Country, RecentNumber } from './types';
import { normalizePhoneNumber } from './utils/phoneUtils';
import { Capacitor } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Browser } from '@capacitor/browser';

const SETTINGS_STORAGE_KEY = 'whatsapp_direct_settings_v1';
const HISTORY_STORAGE_KEY = 'whatsapp_direct_history_v1';

const defaultSettings: AppSettings = {
  themeMode: 'system',
  themeColor: 'whatsapp',
  language: 'en',
  defaultCountryCode: DEFAULT_COUNTRY_CODE,
  autoGenerateLink: true,
  waveAnimation: true,
  waveSpeed: 'natural',
  historyEnabled: true,
};

export default function App() {
  // 1. Persistent App Settings
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (saved) {
        return { ...defaultSettings, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('Failed to load settings from localStorage', e);
    }
    return defaultSettings;
  });

  // 2. Persistent Recent Numbers
  const [recentNumbers, setRecentNumbers] = useState<RecentNumber[]>(() => {
    try {
      const saved = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to load history from localStorage', e);
    }
    return [];
  });

  // Save settings when changed
  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      console.warn('Failed to save settings', e);
    }
  }, [settings]);

  // Save history when changed
  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(recentNumbers));
    } catch (e) {
      console.warn('Failed to save history', e);
    }
  }, [recentNumbers]);

  // Handle Theme Mode (Light / Dark / System) & Theme Color on HTML tag
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme-color', settings.themeColor);

    const applyDark = (isDark: boolean) => {
      if (isDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }

      if (Capacitor.isNativePlatform()) {
        StatusBar.setStyle({ style: isDark ? Style.Dark : Style.Light }).catch(() => {});
        const colorMap: Record<string, string> = {
          whatsapp: '#128C7E',
          emerald: '#059669',
          teal: '#0F766E',
          forest: '#14532D',
        };
        StatusBar.setBackgroundColor({
          color: isDark ? '#030712' : (colorMap[settings.themeColor] || '#128C7E')
        }).catch(() => {});
      }
    };

    if (settings.themeMode === 'dark') {
      applyDark(true);
    } else if (settings.themeMode === 'light') {
      applyDark(false);
    } else {
      // System Default
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      applyDark(mediaQuery.matches);

      const listener = (e: MediaQueryListEvent) => {
        applyDark(e.matches);
      };
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, [settings.themeMode, settings.themeColor]);

  // Active Main Action & Input State
  const [activeAction, setActiveAction] = useState<ActionOption>('manual');
  const [selectedCountry, setSelectedCountry] = useState<Country>(() =>
    getCountryByCode(settings.defaultCountryCode)
  );
  const [phoneNumber, setPhoneNumber] = useState('');

  // Modals & Navigation
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCountryModalOpen, setIsCountryModalOpen] = useState(false);
  const [isScannerModalOpen, setIsScannerModalOpen] = useState(false);
  const [scannerMode, setScannerMode] = useState<ActionOption>('scan_card');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync default country when changed in settings
  useEffect(() => {
    if (!phoneNumber) {
      setSelectedCountry(getCountryByCode(settings.defaultCountryCode));
    }
  }, [settings.defaultCountryCode]);

  // Android Hardware / Browser Back Button Support
  useEffect(() => {
    const handlePopState = () => {
      if (isScannerModalOpen) {
        setIsScannerModalOpen(false);
      } else if (isCountryModalOpen) {
        setIsCountryModalOpen(false);
      } else if (isSettingsOpen) {
        setIsSettingsOpen(false);
      }
    };

    window.addEventListener('popstate', handlePopState);

    let removeBack: (() => void) | null = null;
    if (Capacitor.isNativePlatform()) {
      CapApp.addListener('backButton', () => {
        if (isScannerModalOpen) {
          setIsScannerModalOpen(false);
        } else if (isCountryModalOpen) {
          setIsCountryModalOpen(false);
        } else if (isSettingsOpen) {
          setIsSettingsOpen(false);
        } else {
          CapApp.exitApp();
        }
      }).then((handle) => {
        removeBack = () => handle.remove();
      });
    }

    return () => {
      window.removeEventListener('popstate', handlePopState);
      if (removeBack) removeBack();
    };
  }, [isScannerModalOpen, isCountryModalOpen, isSettingsOpen]);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  }, []);

  // Phone Normalization and Validation
  const validation = useMemo(() => {
    return normalizePhoneNumber(phoneNumber, selectedCountry.code);
  }, [phoneNumber, selectedCountry]);

  // When an action option is clicked
  const handleSelectAction = (action: ActionOption) => {
    setActiveAction(action);
    if (action === 'manual') {
      // Focus on manual input
      const inputEl = document.getElementById('phone-number-input');
      inputEl?.focus();
    } else {
      // Launch Scanner / Camera / Gallery modal
      setScannerMode(action);
      setIsScannerModalOpen(true);
      window.history.pushState({ modal: 'scanner' }, '');
    }
  };

  // When a number is selected from Scanner (Card OCR, QR Code, or Gallery)
  const handleApplyScannedNumber = (number: string) => {
    setPhoneNumber(number);
    setActiveAction('manual');
    setIsScannerModalOpen(false);
    showToast(TRANSLATIONS[settings.language].normalizedNotice);
  };

  // Native and Web WhatsApp Launcher
  const launchWhatsApp = async (url: string) => {
    if (Capacitor.isNativePlatform()) {
      try {
        await Browser.open({ url, windowName: '_system' });
        return;
      } catch (e) {
        console.warn('Browser.open failed, falling back to window.location', e);
      }
    }
    try {
      const win = window.open(url, '_blank');
      if (!win || win.closed || typeof win.closed === 'undefined') {
        window.location.href = url;
      }
    } catch {
      window.location.href = url;
    }
  };

  // Open in WhatsApp Action
  const handleOpenWhatsApp = () => {
    if (!validation.isValid || !validation.waUrl) return;

    showToast(TRANSLATIONS[settings.language].openingWhatsApp);

    // If history enabled, save locally
    if (settings.historyEnabled) {
      const newItem: RecentNumber = {
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        countryCode: selectedCountry.code,
        countryDialCode: selectedCountry.dialCode,
        phoneNumber,
        internationalNumber: validation.internationalNumber,
        waUrl: validation.waUrl,
        timestamp: Date.now(),
      };

      setRecentNumbers((prev) => {
        // Filter out duplicate identical international numbers and prepend fresh one
        const filtered = prev.filter(
          (item) => item.internationalNumber !== validation.internationalNumber
        );
        return [newItem, ...filtered].slice(0, 50); // Keep last 50
      });
    }

    launchWhatsApp(validation.waUrl);
  };

  // Open WhatsApp from Recent History
  const handleOpenRecentNumber = (waUrl: string) => {
    launchWhatsApp(waUrl);
  };

  // Settings Handlers
  const handleUpdateSettings = (updater: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...updater }));
  };

  const handleClearHistory = () => {
    setRecentNumbers([]);
  };

  const handleDeleteRecentItem = (id: string) => {
    setRecentNumbers((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearAllData = () => {
    localStorage.removeItem(SETTINGS_STORAGE_KEY);
    localStorage.removeItem(HISTORY_STORAGE_KEY);
    setSettings(defaultSettings);
    setRecentNumbers([]);
    setPhoneNumber('');
    setSelectedCountry(getCountryByCode(DEFAULT_COUNTRY_CODE));
  };

  const openSettings = () => {
    setIsSettingsOpen(true);
    window.history.pushState({ screen: 'settings' }, '');
  };

  const closeSettings = () => {
    setIsSettingsOpen(false);
  };

  const openCountryModal = () => {
    setIsCountryModalOpen(true);
    window.history.pushState({ modal: 'country' }, '');
  };

  const closeCountryModal = () => {
    setIsCountryModalOpen(false);
  };

  // If Settings screen is open, display it cleanly
  if (isSettingsOpen) {
    return (
      <SettingsScreen
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        recentNumbers={recentNumbers}
        onOpenRecentNumber={handleOpenRecentNumber}
        onClearHistory={handleClearHistory}
        onDeleteRecentItem={handleDeleteRecentItem}
        onClearAllData={handleClearAllData}
        onBack={closeSettings}
      />
    );
  }

  return (
    <div
      id="whatsapp-direct-app"
      className="min-h-screen w-full bg-gray-50/70 dark:bg-gray-950 text-gray-900 dark:text-gray-100 flex flex-col justify-between relative overflow-x-hidden selection:bg-[var(--theme-color)] selection:text-white transition-colors"
    >
      {/* App Container */}
      <div className="w-full max-w-md mx-auto flex flex-col flex-1 relative z-10">
        {/* 1. Header */}
        <Header onOpenSettings={openSettings} language={settings.language} />

        {/* Global Toast Notification */}
        {toastMessage && (
          <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-4 py-2 rounded-xl text-xs font-medium shadow-lg animate-in fade-in slide-in-from-top-2">
            {toastMessage}
          </div>
        )}

        {/* 2. Main Content Area */}
        <main className="flex-1 px-4 py-4 flex flex-col gap-4">
          {/* Action Options (Manual, Scan Card, Scan QR, From Gallery) */}
          <ActionCards
            activeAction={activeAction}
            onSelectAction={handleSelectAction}
            language={settings.language}
          />

          {/* Manual Input, Country Selector, and Dynamic Link Generation */}
          <ManualInputSection
            country={selectedCountry}
            phoneNumber={phoneNumber}
            onChangePhoneNumber={setPhoneNumber}
            onClearPhoneNumber={() => setPhoneNumber('')}
            onOpenCountryModal={openCountryModal}
            validation={validation}
            autoGenerateLink={settings.autoGenerateLink}
            onOpenWhatsApp={handleOpenWhatsApp}
            language={settings.language}
          />
        </main>

        {/* 3. Footer */}
        <Footer language={settings.language} />
      </div>

      {/* 4. Subtle Animated Bottom Wave */}
      <WaveAnimation
        enabled={settings.waveAnimation}
        speed={settings.waveSpeed}
      />

      {/* 5. Country Selector Modal */}
      <CountrySelectorModal
        isOpen={isCountryModalOpen}
        onClose={closeCountryModal}
        selectedCountry={selectedCountry}
        onSelectCountry={(country) => {
          setSelectedCountry(country);
          closeCountryModal();
        }}
        language={settings.language}
      />

      {/* 6. Smart Scanner Modal (Scan Card / Scan QR / Gallery) */}
      <ScannerModal
        mode={scannerMode}
        isOpen={isScannerModalOpen}
        onClose={() => setIsScannerModalOpen(false)}
        onSelectNumber={handleApplyScannedNumber}
        language={settings.language}
      />
    </div>
  );
}
