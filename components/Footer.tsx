import React, { useState } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { Page } from '../types';
import Modal from './Modal';

interface FooterProps {
  navigate: (page: Page) => void;
}

const Footer: React.FC<FooterProps> = ({ navigate }) => {
  const { t } = useLocalization();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');

  const handleLegalLinkClick = (titleKey: string) => {
    setModalTitle(t(titleKey as any));
    setIsModalOpen(true);
  };

  const navItems: { page: Page; labelKey: Parameters<typeof t>[0] }[] = [
    { page: 'home', labelKey: 'home' },
    { page: 'crop', labelKey: 'crop_recommendation' },
    { page: 'schemes', labelKey: 'government_schemes' },
    { page: 'market', labelKey: 'market_prices' },
    { page: 'community', labelKey: 'community' },
  ];

  const govLinks = [
    { key: 'gov_link_pm_kisan', url: 'https://pmkisan.gov.in/' },
    { key: 'gov_link_agrimarket', url: 'https://enam.gov.in/web/' },
    { key: 'gov_link_soil_health', url: 'https://soilhealth.dac.gov.in/' },
  ];
  
  const legalLinks = [
      { key: 'footer_faq' },
      { key: 'footer_about' },
      { key: 'footer_contact' },
      { key: 'footer_privacy' },
  ];

  const FooterLink: React.FC<{children: React.ReactNode, onClick?: () => void, href?: string}> = ({ children, onClick, href }) => {
    if (href) {
      return <a href={href} target="_blank" rel="noopener noreferrer" className="text-green-200 hover:text-yellow-300 transition-colors duration-200">{children}</a>
    }
    return <button onClick={onClick} className="text-green-200 hover:text-yellow-300 transition-colors duration-200 text-left">{children}</button>
  }

  return (
    <>
      <footer className="bg-green-800 text-white pt-12 pb-24 md:pb-6 mt-8">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Column 1: About */}
            <div className="md:col-span-2 lg:col-span-1">
              <div className="flex items-center space-x-2 mb-4">
                <i className="fas fa-leaf text-3xl text-yellow-300"></i>
                <h1 className="text-2xl font-bold text-white">{t('agriguru_title')}</h1>
              </div>
              <p className="text-sm text-green-200">{t('tagline')}</p>
            </div>

            {/* Column 2: Quick Links */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4 uppercase tracking-wider">{t('footer_quick_links')}</h3>
              <ul className="space-y-3">
                {navItems.map(item => (
                  <li key={item.page}>
                    <FooterLink onClick={() => navigate(item.page)}>{t(item.labelKey)}</FooterLink>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: Government Resources */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4 uppercase tracking-wider">{t('footer_gov_resources')}</h3>
              <ul className="space-y-3">
                {govLinks.map(link => (
                  <li key={link.key}>
                    <FooterLink href={link.url}>{t(link.key as any)}</FooterLink>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 4: Legal */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4 uppercase tracking-wider">{t('footer_legal')}</h3>
              <ul className="space-y-3">
                {legalLinks.map(link => (
                    <li key={link.key}>
                      <FooterLink onClick={() => handleLegalLinkClick(link.key)}>{t(link.key as any)}</FooterLink>
                    </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-green-700 flex flex-col sm:flex-row justify-between items-center text-center">
            <p className="text-sm text-green-200">{t('footer_text')}</p>
            <div className="flex space-x-4 mt-4 sm:mt-0">
              <a href="#" className="text-green-200 hover:text-yellow-300 transition-colors"><i className="fab fa-facebook-f text-xl"></i></a>
              <a href="#" className="text-green-200 hover:text-yellow-300 transition-colors"><i className="fab fa-twitter text-xl"></i></a>
              <a href="#" className="text-green-200 hover:text-yellow-300 transition-colors"><i className="fab fa-youtube text-xl"></i></a>
            </div>
          </div>
        </div>
      </footer>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalTitle}>
          <div className="text-center p-4">
              <i className="fas fa-tools text-4xl text-yellow-500 mb-4"></i>
              <p className="text-lg text-gray-700 dark:text-gray-300">{t('coming_soon')}</p>
          </div>
      </Modal>
    </>
  );
};

export default Footer;