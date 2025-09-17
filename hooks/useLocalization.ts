
import { useContext, useCallback } from 'react';
import { LanguageContext } from '../context/LanguageContext';
import { translations } from '../i18n/translations';

export const useLocalization = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLocalization must be used within a LanguageProvider');
  }

  const { language } = context;

  // FIX: Wrapped `t` in useCallback to ensure it has a stable reference across re-renders,
  // preventing unnecessary re-runs of useEffects that depend on it (like in Chatbot.tsx).
  const t = useCallback((key: keyof typeof translations['en'], replacements?: Record<string, string | number>) => {
    let translation = (translations[language]?.[key]) || translations['en'][key];

    if (replacements) {
      Object.keys(replacements).forEach(placeholder => {
        translation = translation.replace(new RegExp(`\\{${placeholder}\\}`, 'g'), String(replacements[placeholder]));
      });
    }

    return translation;
  }, [language]);

  return { t, language: context.language, setLanguage: context.setLanguage };
};
