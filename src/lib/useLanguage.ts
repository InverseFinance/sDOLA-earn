'use client';

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { createElement } from 'react';
import { translations, RTL_LANGS, type Lang, type Translations } from './i18n';

type LangContextType = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: Translations;
};

const LanguageContext = createContext<LangContextType | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en');

  useEffect(() => {
    const saved = localStorage.getItem('lang') as Lang | null;
    if (saved && saved in translations) {
      setLangState(saved);
      document.documentElement.dir = RTL_LANGS.includes(saved) ? 'rtl' : 'ltr';
    }
  }, []);

  function setLang(l: Lang) {
    setLangState(l);
    localStorage.setItem('lang', l);
    document.documentElement.dir = RTL_LANGS.includes(l) ? 'rtl' : 'ltr';
  }

  return createElement(
    LanguageContext.Provider,
    { value: { lang, setLang, t: translations[lang] } },
    children,
  );
}

export function useLanguage(): LangContextType {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
