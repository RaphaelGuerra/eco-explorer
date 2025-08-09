import { useState, useEffect } from 'react';
import i18n from '../utils/i18n';

/**
 * React hook for using translations
 * Usage: const { t, tNested, currentLanguage, setLanguage } = useTranslation();
 */
export function useTranslation() {
    const [currentLanguage, setCurrentLanguage] = useState(i18n.getCurrentLanguage());

    useEffect(() => {
        // Initialize i18n if not already done
        if (!i18n.translations[currentLanguage]) {
            i18n.initialize();
        }

        // Add listener for language changes
        const handleLanguageChange = (lang) => {
            setCurrentLanguage(lang);
        };

        i18n.addListener(handleLanguageChange);

        // Cleanup
        return () => {
            i18n.removeListener(handleLanguageChange);
        };
    }, [currentLanguage]);

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