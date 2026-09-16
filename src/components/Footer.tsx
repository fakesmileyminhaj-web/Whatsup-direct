import React from 'react';
import { Mail, Linkedin, Instagram, Facebook } from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../data/translations';

export const SOCIAL_LINKS = [
  {
    id: 'facebook',
    name: 'Facebook',
    handle: 'smileyminhaj',
    url: 'https://facebook.com/smileyminhaj',
    icon: Facebook,
  },
  {
    id: 'instagram',
    name: 'Instagram',
    handle: 'smileyminhaj',
    url: 'https://instagram.com/smileyminhaj',
    icon: Instagram,
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    handle: 'smileyminhaj',
    url: 'https://linkedin.com/in/smileyminhaj',
    icon: Linkedin,
  },
  {
    id: 'gmail',
    name: 'Gmail',
    handle: 'smileyminhaj',
    url: 'mailto:smileyminhaj@gmail.com',
    icon: Mail,
  },
];

interface FooterProps {
  language: Language;
}

export const Footer: React.FC<FooterProps> = ({ language }) => {
  const t = TRANSLATIONS[language];

  return (
    <footer
      id="app-footer"
      className="relative z-10 w-full pt-4 pb-6 flex flex-col items-center justify-center text-center gap-2.5 mt-auto"
    >
      <p id="footer-developer-credit" className="text-xs font-medium text-gray-500 dark:text-gray-400">
        {t.footerDevBy}
      </p>

      {/* 4 Theme-colored Social Icons with 'smileyminhaj' handle underneath */}
      <div id="footer-social-links-grid" className="flex items-center justify-center gap-5 sm:gap-6">
        {SOCIAL_LINKS.map((link) => {
          const Icon = link.icon;
          return (
            <a
              key={link.id}
              id={`social-link-${link.id}`}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              title={`${link.name}: ${link.handle}`}
              className="flex flex-col items-center gap-1 group transition-transform active:scale-95 text-decoration-none"
            >
              {/* Minimalist Icon strictly using current theme color */}
              <div className="w-7 h-7 rounded-lg bg-[var(--theme-surface)] text-[var(--theme-color)] group-hover:bg-[var(--theme-color)] group-hover:text-white flex items-center justify-center transition-colors">
                <Icon className="w-3.5 h-3.5 stroke-[2] fill-none" />
              </div>
              {/* Label underneath */}
              <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 group-hover:text-[var(--theme-color)] dark:group-hover:text-[var(--theme-color)] transition-colors leading-none">
                {link.handle}
              </span>
            </a>
          );
        })}
      </div>
    </footer>
  );
};
