import { useEffect, useState } from 'react';

type Language = 'en' | 'vi';

interface TranslationData {
  [key: string]: any;
}

export const useTranslation = (namespace: string = 'dashboard') => {
  const [translations, setTranslations] = useState<TranslationData>({});
  const [language, setLanguage] = useState<Language>('en');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get language from localStorage or browser preference
    const savedLang = (localStorage.getItem('language') as Language) || 'en';
    const browserLang = navigator.language.startsWith('vi') ? 'vi' : 'en';
    const lang = savedLang || browserLang;
    
    setLanguage(lang);
    fetchTranslations(lang, namespace);
  }, [namespace]);

  const fetchTranslations = async (lang: Language, ns: string) => {
    try {
      const response = await fetch(`/locales/${lang}/${ns}.json`);
      const data = await response.json();
      setTranslations(data);
    } catch (error) {
      console.error(`Failed to load translations for ${lang}/${ns}:`, error);
      // Fallback to English
      if (lang !== 'en') {
        fetchTranslations('en', ns);
      }
    } finally {
      setLoading(false);
    }
  };

  const t = (key: string, defaultValue?: string): string => {
    const keys = key.split('.');
    let value: any = translations;

    for (const k of keys) {
      value = value?.[k];
    }

    return value || defaultValue || key;
  };

  const changeLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
    fetchTranslations(lang, namespace);
  };

  return {
    t,
    language,
    changeLanguage,
    loading,
    availableLanguages: ['en', 'vi'] as const
  };
};
