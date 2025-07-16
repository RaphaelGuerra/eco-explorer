import { useState, useRef, useEffect } from 'react';
import { useTranslation } from '../hooks/useTranslation';

export default function LanguageSwitcher() {
    const { currentLanguage, setLanguage, supportedLanguages, languageNames } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Close dropdown with Escape key
    useEffect(() => {
        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                setIsOpen(false);
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, []);

    const handleLanguageChange = async (lang) => {
        await setLanguage(lang);
        setIsOpen(false);
    };

    return (
        <div className="language-switcher relative" ref={dropdownRef}>
            <button
                className="language-btn flex items-center space-x-2 px-3 py-2 text-sm font-medium text-white bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span>{currentLanguage.toUpperCase()}</span>
                <svg 
                    className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
            </button>

            {isOpen && (
                <div className="language-dropdown absolute top-full right-0 mt-2 w-48 bg-slate-800 rounded-lg shadow-lg border border-slate-700 z-50">
                    {supportedLanguages.map((lang) => (
                        <button
                            key={lang}
                            className={`language-option w-full text-left px-4 py-3 text-sm hover:bg-slate-700 transition-colors ${
                                lang === currentLanguage ? 'bg-slate-700 text-green-400' : 'text-white'
                            }`}
                            onClick={() => handleLanguageChange(lang)}
                        >
                            {languageNames[lang]}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
} 