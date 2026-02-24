import { useState, useEffect } from 'react';
import i18n from '../utils/i18n';

/**
 * React hook for using translations
 * Usage: const { t, tNested, currentLanguage, setLanguage } = useTranslation();
 */
export function useTranslation() {
    const [currentLanguage, setCurrentLanguage] = useState(i18n.getCurrentLanguage());

    useEffect(() => {
        let isMounted = true;
        const handleLanguageChange = (lang) => {
            if (isMounted) {
                setCurrentLanguage(lang);
            }
        };

        const initializeI18n = async () => {
            if (!i18n.isInitialized()) {
                await i18n.initialize();
            }
            if (isMounted) {
                setCurrentLanguage(i18n.getCurrentLanguage());
            }
        };

        initializeI18n();
        i18n.addListener(handleLanguageChange);

        return () => {
            isMounted = false;
            i18n.removeListener(handleLanguageChange);
        };
    }, []);

    const t = (key) => i18n.t(key);
    const tNested = (key) => i18n.tNested(key);
    const setLanguage = (lang) => i18n.setLanguage(lang);

    return {
        t,
        tNested,
        currentLanguage,
        setLanguage,
        supportedLanguages: i18n.getSupportedLanguages(),
        languageNames: i18n.getLanguageNames()
    };
} 
