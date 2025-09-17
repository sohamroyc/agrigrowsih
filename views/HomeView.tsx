import React, { useState, useEffect } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { Page, MarketPrice } from '../types';
import { marketPrices } from '../data/marketData';
import { schemesData } from '../data/schemes';
import { useAuth } from '../hooks/useAuth';
import Card from '../components/Card';
import Button from '../components/Button';
import Modal from '../components/Modal';

interface HomeViewProps {
  navigate: (page: Page) => void;
}

const HomeView: React.FC<HomeViewProps> = ({ navigate }) => {
  const { t, language } = useLocalization();
  const { user } = useAuth();
  const [priceSnapshot, setPriceSnapshot] = useState<MarketPrice[]>([]);
  const [isSafetyTipsModalOpen, setIsSafetyTipsModalOpen] = useState(false);

  useEffect(() => {
    // Simulate fetching price data for the snapshot
    const snapshotData = marketPrices['mandi_kolkata'] || [];
    setPriceSnapshot(snapshotData.slice(0, 3));
  }, []);

  const getLang = (field: any) => field[language] || field.en;

  const handleGamificationClick = () => {
    if (user) {
      navigate('profile');
    } else {
      navigate('login');
    }
  };

  const weatherData = {
      temp: 32,
      humidity: 75,
      rainfall: 5, // in mm
  };

  const successStories = [
      { quoteKey: 'story_1_quote', authorKey: 'story_1_author', icon: 'fa-chart-line' },
      { quoteKey: 'story_2_quote', authorKey: 'story_2_author', icon: 'fa-file-alt' },
  ];
  
  const featuredSchemes = schemesData.filter(s => s.popularity && s.popularity > 85);

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div 
        className="w-full bg-cover bg-center rounded-xl shadow-2xl p-8 md:p-16" 
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=2070&auto=format&fit=crop')" }}
      >
        <div className="bg-black bg-opacity-50 rounded-lg p-6 md:p-10 text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold text-white leading-tight">
            {t('tagline')}
          </h2>
        </div>
      </div>

      {/* Quick Access Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 w-full max-w-5xl mx-auto">
        <div 
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 flex flex-col items-center text-center hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer"
          onClick={() => navigate('crop')}
        >
          <div className="bg-green-100 dark:bg-gray-700 rounded-full p-4 mb-4">
            <i className="fas fa-seedling text-4xl text-green-600 dark:text-green-400"></i>
          </div>
          <h3 className="text-xl font-bold text-green-800 dark:text-green-300 mb-2">{t('get_crop_recommendation')}</h3>
          <p className="text-gray-600 dark:text-gray-400">{t('home_crop_desc')}</p>
        </div>

        <div 
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 flex flex-col items-center text-center hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer"
          onClick={() => navigate('schemes')}
        >
          <div className="bg-yellow-100 dark:bg-gray-700 rounded-full p-4 mb-4">
            <i className="fas fa-scroll text-4xl text-yellow-600 dark:text-yellow-400"></i>
          </div>
          <h3 className="text-xl font-bold text-yellow-800 dark:text-yellow-300 mb-2">{t('government_schemes')}</h3>
          <p className="text-gray-600 dark:text-gray-400">{t('home_schemes_desc')}</p>
        </div>

        <div 
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 flex flex-col items-center text-center hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer"
          onClick={() => navigate('market')}
        >
          <div className="bg-blue-100 dark:bg-gray-700 rounded-full p-4 mb-4">
            <i className="fas fa-chart-line text-4xl text-blue-600 dark:text-blue-400"></i>
          </div>
          <h3 className="text-xl font-bold text-blue-800 dark:text-blue-300 mb-2">{t('market_prices')}</h3>
          <p className="text-gray-600 dark:text-gray-400">{t('home_market_desc')}</p>
        </div>
      </div>

      {/* Natural Disaster Alert Section */}
      <div className="bg-red-100 dark:bg-red-900/30 border-l-8 border-red-500 dark:border-red-600 text-red-800 dark:text-red-300 p-6 rounded-xl shadow-lg flex flex-col md:flex-row items-center gap-6">
        <div className="text-5xl">
          <i className="fas fa-exclamation-triangle animate-pulse"></i>
        </div>
        <div className="flex-grow">
          <h3 className="text-2xl font-extrabold">{t('natural_disaster_alert_title')}</h3>
          <p className="mt-2 text-red-700 dark:text-red-300">{t('natural_disaster_alert_desc')}</p>
          <ul className="list-disc list-inside mt-3 space-y-1 text-sm font-medium text-red-700 dark:text-red-300">
            <li>{t('natural_disaster_alert_advice_1')}</li>
            <li>{t('natural_disaster_alert_advice_2')}</li>
            <li>{t('natural_disaster_alert_advice_3')}</li>
          </ul>
        </div>
        <div className="flex-shrink-0 mt-4 md:mt-0">
          <Button
            onClick={() => setIsSafetyTipsModalOpen(true)}
            className="bg-red-600 text-white hover:bg-red-700 focus:ring-red-500"
          >
            <i className="fas fa-book-reader mr-2"></i> {t('view_safety_tips_button')}
          </Button>
        </div>
      </div>
      
      {/* Highlights Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <h3 className="font-bold text-lg text-blue-800 dark:text-blue-300 mb-3"><i className="fas fa-cloud-sun-rain mr-2"></i>{t('weather_widget_title')}</h3>
          <div className="flex justify-around items-center text-center">
             <div><i className="fas fa-temperature-high text-3xl text-red-500"></i><p className="font-bold text-xl">{weatherData.temp}°C</p></div>
             <div><i className="fas fa-tint text-3xl text-blue-500"></i><p className="font-bold text-xl">{weatherData.humidity}%</p><p className="text-xs text-gray-500 dark:text-gray-400">{t('humidity')}</p></div>
             <div><i className="fas fa-cloud-showers-heavy text-3xl text-gray-500"></i><p className="font-bold text-xl">{weatherData.rainfall}mm</p><p className="text-xs text-gray-500 dark:text-gray-400">{t('rainfall')}</p></div>
          </div>
        </Card>
        <Card>
            <h3 className="font-bold text-lg text-yellow-800 dark:text-yellow-300 mb-3"><i className="fas fa-lightbulb mr-2"></i>{t('todays_tip')}</h3>
            <p className="text-gray-700 dark:text-gray-300">{t('tip_content_placeholder')}</p>
        </Card>
        <Card>
            <h3 className="font-bold text-lg text-green-800 dark:text-green-300 mb-3"><i className="fas fa-store mr-2"></i>{t('mandi_snapshot_title')}</h3>
            <ul className="space-y-2">
                {priceSnapshot.map(p => (
                    <li key={p.cropId} className="flex justify-between items-center text-sm">
                        <span className="font-semibold">{getLang(p.cropName)}</span>
                        <span className="font-bold text-green-600 dark:text-green-400">₹{p.price}/{t('price_per_quintal').split(' ')[2]}</span>
                    </li>
                ))}
            </ul>
        </Card>
      </div>

      {/* Scheme Spotlight Section */}
      <div>
        <h2 className="text-3xl font-bold text-green-800 dark:text-green-300 mb-4 text-center">{t('scheme_spotlight_title')}</h2>
        <div className="flex gap-6 pb-4 -mb-4 overflow-x-auto">
            {featuredSchemes.map(scheme => (
                <div key={scheme.id} className="flex-shrink-0 w-80">
                    <Card className="h-full flex flex-col justify-between">
                        <div>
                            <h4 className="font-bold text-green-800 dark:text-green-300">{getLang(scheme.title)}</h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{getLang(scheme.summary)}</p>
                        </div>
                        <button onClick={() => navigate('schemes')} className="mt-3 text-sm font-bold text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 self-start">
                           {t('know_more')} <i className="fas fa-arrow-right"></i>
                        </button>
                    </Card>
                </div>
            ))}
        </div>
      </div>
      
      {/* Farmer Success Stories Section */}
       <div>
         <h2 className="text-3xl font-bold text-green-800 dark:text-green-300 mb-4 text-center">{t('success_stories_title')}</h2>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           {successStories.map((story, index) => (
             <Card key={index} className="flex items-start gap-4">
               <i className={`fas ${story.icon} text-3xl text-yellow-500 mt-1`}></i>
               <div>
                 <p className="text-gray-700 dark:text-gray-300 italic">"{t(story.quoteKey as any)}"</p>
                 <p className="mt-2 font-semibold text-green-800 dark:text-green-300 text-right">- {t(story.authorKey as any)}</p>
               </div>
             </Card>
           ))}
         </div>
       </div>

        {/* AI Scheme Assistant CTA */}
        <Card className="text-center">
            <i className="fas fa-robot text-5xl text-green-600 dark:text-green-400 mb-4"></i>
            <h3 className="text-2xl font-bold text-green-800 dark:text-green-300 mb-2">{t('ai_scheme_assistant_title')}</h3>
            <p className="mb-4 text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">{t('ai_scheme_assistant_desc')}</p>
            <Button onClick={() => navigate('schemes')} variant="secondary" icon="fa-arrow-right">
                {t('explore_schemes_and_ask')}
            </Button>
        </Card>

        {/* Gamification Widget */}
        <Card className="bg-gradient-to-r from-green-600 to-teal-600 text-white text-center p-8">
            <i className="fas fa-trophy text-5xl text-yellow-300 mb-4"></i>
            <h3 className="text-2xl font-bold mb-2">{t('gamification_title')}</h3>
            <p className="mb-4 text-green-100">{t('gamification_desc')}</p>
            <Button variant="primary" onClick={handleGamificationClick}>
                {user ? t('view_my_progress') : t('login_to_earn')}
            </Button>
        </Card>

        <Modal 
            isOpen={isSafetyTipsModalOpen} 
            onClose={() => setIsSafetyTipsModalOpen(false)}
            title={t('natural_disaster_alert_title')}
        >
            <div className="space-y-4">
                <p className="font-semibold text-gray-700 dark:text-gray-300">{t('natural_disaster_alert_desc')}</p>
                <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400">
                    <li>{t('natural_disaster_alert_advice_1')}</li>
                    <li>{t('natural_disaster_alert_advice_2')}</li>
                    <li>{t('natural_disaster_alert_advice_3')}</li>
                </ul>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('safety_tips_footer')}</p>
            </div>
        </Modal>
    </div>
  );
};

export default HomeView;