import React from 'react';
import { Keyboard, CreditCard, QrCode, Image as ImageIcon } from 'lucide-react';
import { ActionOption, Language } from '../types';
import { TRANSLATIONS } from '../data/translations';

interface ActionCardsProps {
  activeAction: ActionOption;
  onSelectAction: (action: ActionOption) => void;
  language: Language;
}

export const ActionCards: React.FC<ActionCardsProps> = ({
  activeAction,
  onSelectAction,
  language,
}) => {
  const t = TRANSLATIONS[language];

  const actions: Array<{
    id: ActionOption;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }> = [
    {
      id: 'manual',
      label: t.manual,
      icon: Keyboard,
    },
    {
      id: 'scan_card',
      label: t.scanCard,
      icon: CreditCard,
    },
    {
      id: 'scan_qr',
      label: t.scanQr,
      icon: QrCode,
    },
    {
      id: 'gallery',
      label: t.fromGallery,
      icon: ImageIcon,
    },
  ];

  return (
    <div id="main-action-cards-grid" className="grid grid-cols-4 gap-2 w-full">
      {actions.map((act) => {
        const Icon = act.icon;
        const isSelected = activeAction === act.id;

        return (
          <button
            key={act.id}
            id={`action-card-${act.id}`}
            onClick={() => onSelectAction(act.id)}
            className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all text-center group cursor-pointer active:scale-95 ${
              isSelected
                ? 'border-[var(--theme-color)] bg-[var(--theme-surface)] text-[var(--theme-text)] dark:text-white'
                : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800/60 text-gray-600 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-700'
            }`}
          >
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center mb-1.5 transition-colors ${
                isSelected
                  ? 'bg-[var(--theme-color)] text-white shadow-xs'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200'
              }`}
            >
              <Icon className="w-4 h-4 stroke-[2]" />
            </div>
            <span className="text-[11px] font-medium leading-tight line-clamp-1">
              {act.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};
