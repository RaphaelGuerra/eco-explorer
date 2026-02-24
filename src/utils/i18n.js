/**
 * React Internationalization (i18n) System
 * Adapted from raphaelguerra.com for React components
 */

class I18nManager {
    constructor() {
        this.currentLanguage = 'en';
        this.translations = {};
        this.supportedLanguages = ['en', 'pt', 'fr', 'es'];
        this.languageNames = {
            en: '🇺🇸 English',
            pt: '🇧🇷 Português',
            fr: '🇫🇷 Français',
            es: '🇪🇸 Español'
        };
        this.listeners = [];
        this.initialized = false;
    }

    /**
     * Initialize the i18n system
     */
    async initialize() {
        if (this.initialized) return;

        const urlLang = this.getLanguageFromURL();
        // Get saved language preference or detect browser language
        const savedLang = localStorage.getItem('preferred-language');
        const browserLang = this.detectBrowserLanguage();
        const initialLang = urlLang || savedLang || browserLang;

        // Load initial language
        await this.setLanguage(initialLang);
        this.initialized = true;
    }

    getLanguageFromURL() {
        try {
            const url = new URL(window.location.href);
            const urlLang = url.searchParams.get('lang');
            if (!urlLang) return null;
            const normalized = urlLang.toLowerCase();
            return this.supportedLanguages.includes(normalized) ? normalized : null;
        } catch {
            return null;
        }
    }

    /**
     * Detect browser language
     */
    detectBrowserLanguage() {
        const browserLang = navigator.language || navigator.userLanguage;
        const langCode = browserLang.split('-')[0].toLowerCase();
        
        return this.supportedLanguages.includes(langCode) ? langCode : 'en';
    }

    /**
     * Load translations for a specific language
     */
    async loadTranslations(lang) {
        try {
            // Import translations directly for Vite/React
            const translations = await import(`../locales/${lang}.json`);
            this.translations[lang] = translations.default;
        } catch (error) {
            console.error(`Error loading translations for ${lang}:`, error);
            // Fallback to English if translation file fails to load
            if (lang !== 'en') {
                await this.loadTranslations('en');
            }
        }
    }

    /**
     * Set the current language and update the page
     */
    async setLanguage(lang) {
        if (!this.supportedLanguages.includes(lang)) {
            console.warn(`Unsupported language: ${lang}`);
            return;
        }

        // Load translations if not already loaded
        if (!this.translations[lang]) {
            await this.loadTranslations(lang);
        }

        this.currentLanguage = lang;
        
        // Update HTML lang attribute
        document.documentElement.lang = lang;
        
        // Update page title
        this.updatePageTitle();
        
        // Save preference
        localStorage.setItem('preferred-language', lang);
        
        // Update URL
        this.updateURL();
        
        // Notify listeners
        this.notifyListeners();
    }

    /**
     * Update page title
     */
    updatePageTitle() {
        const title = this.translations[this.currentLanguage]?.pageTitle;
        if (title) {
            document.title = title;
        }
    }

    /**
     * Update URL with language parameter
     */
    updateURL() {
        const url = new URL(window.location);
        if (this.currentLanguage === 'en') {
            url.searchParams.delete('lang');
        } else {
            url.searchParams.set('lang', this.currentLanguage);
        }
        
        // Update URL without reloading the page
        window.history.replaceState({}, '', url);
    }

    /**
     * Get translation for a specific key
     */
    t(key) {
        return this.translations[this.currentLanguage]?.[key] || key;
    }

    /**
     * Get nested translation (e.g., "clueTypes.animal")
     */
    tNested(key) {
        const keys = key.split('.');
        let value = this.translations[this.currentLanguage];
        
        for (const k of keys) {
            if (value && typeof value === 'object') {
                value = value[k];
            } else {
                return key;
            }
        }
        
        return value || key;
    }

    /**
     * Get current language
     */
    getCurrentLanguage() {
        return this.currentLanguage;
    }

    /**
     * Get supported languages
     */
    getSupportedLanguages() {
        return this.supportedLanguages;
    }

    /**
     * Get language names
     */
    getLanguageNames() {
        return this.languageNames;
    }

    /**
     * Add listener for language changes
     */
    addListener(callback) {
        this.listeners.push(callback);
    }

    /**
     * Remove listener
     */
    removeListener(callback) {
        this.listeners = this.listeners.filter(listener => listener !== callback);
    }

    isInitialized() {
        return this.initialized;
    }

    /**
     * Notify all listeners
     */
    notifyListeners() {
        this.listeners.forEach(callback => callback(this.currentLanguage));
    }
}

// Create global instance
const i18n = new I18nManager();

export default i18n; 
