import React, { useState, useEffect, useRef } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { Language, Page } from '../types';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';

interface HeaderProps {
    navigate: (page: Page) => void;
    currentPage: Page;
}

const Header: React.FC<HeaderProps> = ({ navigate, currentPage }) => {
  const { language, setLanguage, t } = useLocalization();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const langDropdownRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  const languages: { code: Language; name: string }[] = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिन्दी' },
    { code: 'bn', name: 'বাংলা' },
    { code: 'sat', name: 'संताली' },
    { code: 'nag', name: 'नागपुरी' },
    { code: 'kho', name: 'खोरठा' },
  ];

  const navItems: { page: Page; labelKey: Parameters<typeof t>[0]; icon: string }[] = [
      { page: 'home', labelKey: 'home', icon: 'fa-home' },
      { page: 'crop', labelKey: 'crop_recommendation', icon: 'fa-seedling' },
      { page: 'schemes', labelKey: 'government_schemes', icon: 'fa-scroll' },
      { page: 'market', labelKey: 'market_prices', icon: 'fa-chart-line' },
      { page: 'community', labelKey: 'community', icon: 'fa-users' },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target as Node)) {
        setIsLangDropdownOpen(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLanguageSelect = (langCode: Language) => {
      setLanguage(langCode);
      setIsLangDropdownOpen(false);
  }
  
  const handleLogout = () => {
    logout();
    setIsUserDropdownOpen(false);
    navigate('home');
  }

  const handleUserMenuClick = (page: Page) => {
    navigate(page);
    setIsUserDropdownOpen(false);
  }

  return (
    <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-10">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('home')}>
          <i className="fas fa-leaf text-3xl text-green-600"></i>
          <h1 className="text-2xl font-bold text-green-800 dark:text-green-300">{t('agriguru_title')}</h1>
        </div>
        
        <div className="hidden md:flex items-center space-x-6">
            {navItems.map(item => (
                <button
                    key={item.page}
                    onClick={() => navigate(item.page)}
                    className={`text-lg font-medium transition-colors duration-200 pb-1 ${currentPage === item.page ? 'text-green-600 dark:text-green-400 border-b-2 border-green-600 dark:border-green-400' : 'text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400'}`}
                >
                    <i className={`fas ${item.icon} mr-2`}></i>
                    {t(item.labelKey)}
                </button>
            ))}
             <div className="relative" ref={langDropdownRef}>
                <button
                onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                className="flex items-center gap-1 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-gray-300 dark:border-gray-600"
                >
                <i className="fas fa-globe text-green-700 dark:text-green-400"></i>
                <span className="font-medium text-gray-700 dark:text-gray-200">{languages.find(l => l.code === language)?.name}</span>
                <i className={`fas fa-chevron-down text-xs transition-transform ${isLangDropdownOpen ? 'rotate-180' : ''}`}></i>
                </button>
                {isLangDropdownOpen && (
                <div className="absolute right-0 mt-1 w-40 bg-white dark:bg-gray-700 rounded-md shadow-lg z-20 py-1 border dark:border-gray-600">
                    {languages.map(lang => (
                    <button
                        key={lang.code}
                        onClick={() => handleLanguageSelect(lang.code)}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-green-50 dark:hover:bg-gray-600 ${language === lang.code ? 'font-bold text-green-700 dark:text-green-300' : 'text-gray-800 dark:text-gray-200'}`}
                    >
                        {lang.name}
                    </button>
                    ))}
                </div>
                )}
            </div>
            <button
                onClick={toggleTheme}
                className="w-10 h-10 flex items-center justify-center rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Toggle theme"
            >
                <i className={`fas ${theme === 'light' ? 'fa-moon' : 'fa-sun'} text-xl`}></i>
            </button>
            {user ? (
                 <div className="relative" ref={userDropdownRef}>
                    <button onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)} className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                        <div className="w-9 h-9 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">
                            {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                        </div>
                        <i className={`fas fa-chevron-down text-xs transition-transform ${isUserDropdownOpen ? 'rotate-180' : ''}`}></i>
                    </button>
                    {isUserDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-md shadow-lg z-20 py-1 border dark:border-gray-600">
                            <button onClick={() => handleUserMenuClick('profile')} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-green-50 dark:hover:bg-gray-600"><i className="fas fa-user-circle w-5 mr-2"></i>{t('profile')}</button>
                            <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-green-50 dark:hover:bg-gray-600"><i className="fas fa-sign-out-alt w-5 mr-2"></i>{t('logout')}</button>
                        </div>
                    )}
                </div>
            ) : (
                <button onClick={() => navigate('login')} className="px-4 py-2 font-bold rounded-lg shadow-sm transition-colors bg-green-600 text-white hover:bg-green-700">
                    {t('login')}
                </button>
            )}
        </div>

        <div className="md:hidden">
            {user ? (
                 <button onClick={() => navigate('profile')} className="w-9 h-9 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">
                    {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                 </button>
            ) : (
                <button onClick={() => navigate('login')} className="px-3 py-1.5 text-sm font-bold rounded-lg shadow-sm transition-colors bg-green-600 text-white hover:bg-green-700">
                     {t('login')}
                 </button>
            )}
        </div>
      </div>
      
       <nav className="md:hidden bg-green-50/80 dark:bg-gray-800/80 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700 p-1 flex justify-around fixed bottom-0 left-0 right-0 z-20">
            {navItems.map(item => (
                <button
                    key={item.page}
                    onClick={() => navigate(item.page)}
                    className={`flex flex-col items-center text-xs w-1/5 p-1 rounded-lg transition-colors ${currentPage === item.page ? 'bg-green-200 dark:bg-green-900/50 text-green-800 dark:text-green-300' : 'text-gray-600 dark:text-gray-300 hover:bg-green-100 dark:hover:bg-gray-700'}`}
                >
                    <i className={`fas ${item.icon} text-lg mb-1`}></i>
                    <span className="text-center">{t(item.labelKey)}</span>
                </button>
            ))}
        </nav>
    </header>
  );
};

export default Header;