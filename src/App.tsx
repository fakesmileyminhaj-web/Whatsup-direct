import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Header } from './components/Header';
import { ActionCards } from './components/ActionCards';
import { ManualInputSection } from './components/ManualInputSection';
import { UnifiedScannerSection } from './components/UnifiedScannerSection';
import { GallerySection } from './components/GallerySection';
import { CountrySelectorModal } from './components/CountrySelectorModal';
import { SettingsScreen } from './components/SettingsScreen';
import { ParticleBackground } from './components/ParticleBackground';
import { DEFAULT_COUNTRY_CODE, getCountryByCode } from './data/countries';
import { TRANSLATIONS } from './data/translations';
import { ActionOption, AppSettings, Country, RecentNumber } from './types';
import { normalizePhoneNumber } from './utils/phoneUtils';
import { getDarkThemeBg, getLightThemeBg } from './utils/themeColors';
import { Capacitor } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Browser } from '@capacitor/browser';

const SETTINGS_STORAGE_KEY = 'whatsapp_direct_settings_v2';
const HISTORY_STORAGE_KEY = 'whatsapp_direct_history_v2';

export const DEFAULT_CUSTOM_COLOR = '#EF4444'; // Clean standard red

// Subtly tint/darken the background according to custom color (blending 5% color into neutral light #F4F5F6)
function computeCustomThemeBg(hex: string): string {
  try {
    const clean = hex.replace('#', '').trim();
    let r = 239, g = 68, b = 68;
    if (clean.length === 3) {
      r = parseInt(clean[0] + clean[0], 16);
      g = parseInt(clean[1] + clean[1], 16);
      b = parseInt(clean[2] + clean[2], 16);
    } else if (clean.length === 6) {
      r = parseInt(clean.substring(0, 2), 16);
      g = parseInt(clean.substring(2, 4), 16);
      b = parseInt(clean.substring(4, 6), 16);
    }
    const br = Math.round(r * 0.05 + 244 * 0.95);
    const bg = Math.round(g * 0.05 + 245 * 0.95);
    const bb = Math.round(b * 0.05 + 246 * 0.95);
    return `rgb(${br}, ${bg}, ${bb})`;
  } catch {
    return '#EEF6F2';
  }
}

const defaultSettings: AppSettings = {
  themeColor: 'whatsapp',
  customColorHex: DEFAULT_CUSTOM_COLOR,
  defaultCountryCode: DEFAULT_COUNTRY_CODE,
  autoGenerateLink: true,
  particleBackground: true,
  particleSpeed: '6s',
  customParticleDuration: 6,
  historyEnabled: true,
};

const MODES: ActionOption[] = ['manual', 'scan', 'gallery'];

export default function App() {
  // 1. App Settings (Persistent)
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.customColorHex === '#25D366') {
          parsed.customColorHex = DEFAULT_CUSTOM_COLOR;
        }
        if (parsed.particleBackground === undefined) {
          parsed.particleBackground = true;
        }
        if (parsed.particleSpeed === undefined) {
          parsed.particleSpeed = '6s';
        }
        if (parsed.customParticleDuration === undefined) {
          parsed.customParticleDuration = 6;
        }
        delete parsed.waveAnimation;
        delete parsed.waveSpeed;
        delete parsed.customWaveDuration;

        return { ...defaultSettings, ...parsed };
      }
    } catch (e) {
      console.warn('Failed to load settings', e);
    }
    return defaultSettings;
  });

  // 2. Recent Numbers History (Persistent)
  const [recentNumbers, setRecentNumbers] = useState<RecentNumber[]>(() => {
    try {
      const saved = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to load history', e);
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

  // Fixed Clean Light Mode & Theme Color Management
  useEffect(() => {
    const root = document.documentElement;
    // Always enforce fixed clean light theme (remove dark class)
    root.classList.remove('dark');
    root.setAttribute('data-theme-color', settings.themeColor);

    // Apply custom color if selected
    if (settings.themeColor === 'custom' && settings.customColorHex) {
      const hex = settings.customColorHex;
      root.style.setProperty('--theme-color', hex);
      root.style.setProperty('--theme-hover', hex);
      root.style.setProperty('--theme-surface', `${hex}15`);
      root.style.setProperty('--theme-border', `${hex}45`);
      root.style.setProperty('--theme-text', hex);
      root.style.setProperty('--theme-bg', computeCustomThemeBg(hex));
    } else {
      root.style.removeProperty('--theme-color');
      root.style.removeProperty('--theme-hover');
      root.style.removeProperty('--theme-surface');
      root.style.removeProperty('--theme-border');
      root.style.removeProperty('--theme-text');
      root.style.removeProperty('--theme-bg');
    }

    // Android Status Bar: Keep visible, readable, and non-overlapping
    if (Capacitor.isNativePlatform()) {
      StatusBar.setStyle({ style: Style.Light }).catch(() => {});
      StatusBar.show().catch(() => {});
      StatusBar.setOverlaysWebView({ overlay: false }).catch(() => {});
      StatusBar.setBackgroundColor({ color: '#FFFFFF' }).catch(() => {});
    }
  }, [settings.themeColor, settings.customColorHex]);

  // Active Main Mode (Manual, Scan, From Gallery)
  const [activeAction, setActiveAction] = useState<ActionOption>('manual');
  const [selectedCountry, setSelectedCountry] = useState<Country>(() =>
    getCountryByCode(settings.defaultCountryCode)
  );
  const [phoneNumber, setPhoneNumber] = useState('');

  // Modals & Navigation
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCountryModalOpen, setIsCountryModalOpen] = useState(false);
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
      if (isCountryModalOpen) {
        setIsCountryModalOpen(false);
      } else if (isSettingsOpen) {
        setIsSettingsOpen(false);
      }
    };

    window.addEventListener('popstate', handlePopState);

    let removeBack: (() => void) | null = null;
    if (Capacitor.isNativePlatform()) {
      CapApp.addListener('backButton', () => {
        if (isCountryModalOpen) {
          setIsCountryModalOpen(false);
        } else if (isSettingsOpen) {
          setIsSettingsOpen(false);
        } else if (activeAction !== 'manual') {
          setActiveAction('manual');
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
  }, [isCountryModalOpen, isSettingsOpen, activeAction]);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  }, []);

  // Phone Normalization and Validation
  const validation = useMemo(() => {
    return normalizePhoneNumber(phoneNumber, selectedCountry.code);
  }, [phoneNumber, selectedCountry]);

  // When a number is selected/confirmed from Unified Scan or From Gallery
  const handleApplyDetectedNumber = (number: string) => {
    setPhoneNumber(number);
    setActiveAction('manual');
    showToast(TRANSLATIONS.normalizedNotice);
  };

  // WhatsApp Launcher
  const launchWhatsApp = async (url: string) => {
    if (Capacitor.isNativePlatform()) {
      try {
        await Browser.open({ url, windowName: '_system' });
        return;
      } catch (e) {
        console.warn('Browser.open fallback', e);
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

    showToast(TRANSLATIONS.openingWhatsApp);

    // Save locally if history is enabled
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
        const filtered = prev.filter(
          (item) => item.internationalNumber !== validation.internationalNumber
        );
        return [newItem, ...filtered].slice(0, 50);
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

  // Horizontal Swipe Gesture Detection for the 3 modes:
  // Manual <-> Scan <-> From Gallery
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const touchStartTime = useRef<number>(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    const target = e.target as HTMLElement | null;
    if (
      target &&
      (target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable)
    ) {
      touchStartX.current = null;
      touchStartY.current = null;
      return;
    }
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    touchStartTime.current = Date.now();
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;
    const deltaTime = Date.now() - touchStartTime.current;

    // Trigger only if horizontal swipe >= 45px, abs(deltaX) > abs(deltaY) * 1.4, and within 500ms
    if (
      Math.abs(deltaX) > 45 &&
      Math.abs(deltaX) > Math.abs(deltaY) * 1.4 &&
      deltaTime < 500
    ) {
      const currentIndex = MODES.indexOf(activeAction);
      if (deltaX < 0) {
        // Swiped Left: next mode
        if (currentIndex < MODES.length - 1) {
          setActiveAction(MODES[currentIndex + 1]);
        }
      } else {
        // Swiped Right: previous mode
        if (currentIndex > 0) {
          setActiveAction(MODES[currentIndex - 1]);
        }
      }
    }

    touchStartX.current = null;
    touchStartY.current = null;
  };

  const activeIndex = MODES.indexOf(activeAction);

  // Darkish version of theme color for Home background and particle canvas
  const darkThemeBg = useMemo(
    () => getDarkThemeBg(settings.themeColor, settings.customColorHex),
    [settings.themeColor, settings.customColorHex]
  );

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
      className="min-h-screen w-full text-gray-900 flex flex-col justify-between relative overflow-x-hidden selection:bg-[var(--theme-color)] selection:text-white transition-colors duration-500"
      style={{ backgroundColor: darkThemeBg }}
    >
      {/* Interactive Particle / Network Background */}
      <ParticleBackground
        enabled={settings.particleBackground}
        speed={settings.particleSpeed}
        customDuration={settings.customParticleDuration}
        darkBgColor={darkThemeBg}
      />

      {/* App Container - ONE consistent responsive content container */}
      <div
        id="home-content-container"
        className="w-full max-w-md mx-auto px-4 py-3 sm:py-4 flex flex-col gap-3.5 relative z-10 flex-1"
      >
        {/* 1. Header (Clean, English, Settings Gear) */}
        <Header onOpenSettings={openSettings} />

        {/* Global Toast Notification */}
        {toastMessage && (
          <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white px-4 py-2 rounded-xl text-xs font-medium shadow-lg animate-in fade-in slide-in-from-top-2">
            {toastMessage}
          </div>
        )}

        {/* 2. Main Content Area */}
        <main className="w-full flex flex-col gap-3.5 flex-1">
          {/* Exact 3 Mode Selector (Manual, Scan, From Gallery) */}
          <ActionCards
            activeAction={activeAction}
            onSelectAction={(mode) => setActiveAction(mode)}
          />

          {/* Swipeable View Container for the 3 modes */}
          <div
            id="swipeable-modes-container"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className="w-full overflow-hidden relative"
          >
            <div
              className="flex w-full transition-transform duration-300 ease-out"
              style={{
                transform: `translateX(-${activeIndex * 100}%)`,
              }}
            >
              {/* Panel 0: Manual Input */}
              <div className="w-full flex-shrink-0">
                <ManualInputSection
                  country={selectedCountry}
                  phoneNumber={phoneNumber}
                  onChangePhoneNumber={setPhoneNumber}
                  onClearPhoneNumber={() => setPhoneNumber('')}
                  onOpenCountryModal={openCountryModal}
                  validation={validation}
                  onOpenWhatsApp={handleOpenWhatsApp}
                  onCopySuccess={showToast}
                />
              </div>

              {/* Panel 1: Unified Scan (Camera QR + OCR) */}
              <div className="w-full flex-shrink-0">
                <UnifiedScannerSection
                  isActive={activeAction === 'scan'}
                  onApplyNumber={handleApplyDetectedNumber}
                />
              </div>

              {/* Panel 2: From Gallery */}
              <div className="w-full flex-shrink-0">
                <GallerySection
                  onApplyNumber={handleApplyDetectedNumber}
                />
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* 3. Country Selector Modal */}
      <CountrySelectorModal
        isOpen={isCountryModalOpen}
        onClose={closeCountryModal}
        selectedCountry={selectedCountry}
        onSelectCountry={(country) => {
          setSelectedCountry(country);
          closeCountryModal();
        }}
      />
    </div>
  );
}
