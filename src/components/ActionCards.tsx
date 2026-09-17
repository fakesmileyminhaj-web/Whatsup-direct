import React from 'react';
import { Keyboard, ScanLine, Image as ImageIcon } from 'lucide-react';
import { ActionOption } from '../types';
import { TRANSLATIONS } from '../data/translations';

interface ActionCardsProps {
  activeAction: ActionOption;
  onSelectAction: (action: ActionOption) => void;
}

export const ActionCards: React.FC<ActionCardsProps> = ({
  activeAction,
  onSelectAction,
}) => {
  const modes: Array<{
    id: ActionOption;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }> = [
    {
      id: 'manual',
      label: TRANSLATIONS.manual,
      icon: Keyboard,
    },
    {
      id: 'scan',
      label: TRANSLATIONS.scan,
      icon: ScanLine,
    },
    {
      id: 'gallery',
      label: TRANSLATIONS.fromGallery,
      icon: ImageIcon,
    },
  ];

  return (
    <div id="mode-selector-tabs" className="grid grid-cols-3 gap-2 w-full">
      {modes.map((mode) => {
        const Icon = mode.icon;
        const isSelected = activeAction === mode.id;

        return (
          <button
            key={mode.id}
            id={`tab-mode-${mode.id}`}
            type="button"
            onClick={() => onSelectAction(mode.id)}
            className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all text-center group cursor-pointer active:scale-95 ${
              isSelected
                ? 'border-[var(--theme-color)] bg-white text-gray-900 shadow-sm ring-2 ring-[var(--theme-color)]/25'
                : 'border-gray-200/90 bg-white/95 text-gray-600 hover:border-gray-300 shadow-xs'
            }`}
          >
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center mb-1 transition-colors ${
                isSelected
                  ? 'bg-[var(--theme-color)] text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 group-hover:text-gray-900'
              }`}
            >
              <Icon className="w-4 h-4 stroke-[2]" />
            </div>
            <span
              className={`text-xs leading-tight font-medium ${
                isSelected ? 'text-[var(--theme-text)] font-semibold' : ''
              }`}
            >
              {mode.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};
