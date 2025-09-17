import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { MarketPrice } from '../types';
import { fetchMarketPrices } from '../services/marketPriceService';
import { mandis, marketPrices as allMarketPrices } from '../data/marketData';
import Card from '../components/Card';
import PriceCard from '../components/PriceCard';
import Spinner from '../components/Spinner';
import PriceHistoryChart from '../components/PriceHistoryChart';
import InterMandiComparison from '../components/InterMandiComparison';
import Modal from '../components/Modal';

// Type definitions for the Web Speech API to resolve TypeScript errors.
interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    lang: string;
    interimResults: boolean;
    onresult: (event: SpeechRecognitionEvent) => void;
    onstart: () => void;
    onend: () => void;
    onerror: (event: Event) => void;
    start(): void;
}

interface SpeechRecognitionStatic {
    new(): SpeechRecognition;
}

declare global {
    interface Window {
        SpeechRecognition: SpeechRecognitionStatic;
        webkitSpeechRecognition: SpeechRecognitionStatic;
    }
}

const FAVORITES_KEY = 'agriGrowMarketFavorites';

const MarketPricesView: React.FC = () => {
  const { t, language } = useLocalization();
  const [selectedMandi, setSelectedMandi] = useState<string>(mandis[0].id);
  const [prices, setPrices] = useState<MarketPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [selectedCropForChart, setSelectedCropForChart] = useState<MarketPrice | null>(null);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isListProduceModalOpen, setIsListProduceModalOpen] = useState(false);

  // Load favorites from localStorage on initial render
  useEffect(() => {
    const storedFavorites = localStorage.getItem(FAVORITES_KEY);
    if (storedFavorites) {
      setFavorites(JSON.parse(storedFavorites));
    }
  }, []);

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    const getPrices = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchMarketPrices(selectedMandi);
        setPrices(result);
        setLastUpdated(new Date());
      } catch (err) {
        setError(t('error_fetching_prices'));
      } finally {
        setLoading(false);
      }
    };
    getPrices();
  }, [selectedMandi, t]);

  // Web Speech API setup
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.lang = language;
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => {
        console.error("Speech recognition error");
      };
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setSearchTerm(transcript);
      };
      recognitionRef.current = recognition;
    }
  }, [language]);
  
  const allCrops = useMemo(() => Object.values(allMarketPrices).flat().reduce((acc, crop) => {
    if (!acc.find(c => c.cropId.split('_')[0] === crop.cropId.split('_')[0])) {
        acc.push(crop);
    }
    return acc;
  }, [] as MarketPrice[]), []);


  const handleVoiceSearch = () => {
    if (recognitionRef.current && !isListening) {
      recognitionRef.current.start();
    }
  };

  const handleToggleFavorite = (cropId: string) => {
    setFavorites(prev =>
      prev.includes(cropId) ? prev.filter(id => id !== cropId) : [...prev, cropId]
    );
  };

  const handleListProduce = (priceData: MarketPrice) => {
    setIsListProduceModalOpen(true);
  };

  const getLang = (field: any) => field[language] || field.en;

  const filteredPrices = useMemo(() => {
    return prices.filter(p =>
      getLang(p.cropName).toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [prices, searchTerm, language]);

  const favoritePrices = filteredPrices.filter(p => favorites.includes(p.cropId));
  const otherPrices = filteredPrices.filter(p => !favorites.includes(p.cropId));

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-4xl font-extrabold text-green-800 dark:text-green-300">{t('market_prices_title')}</h2>
        <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">{t('market_prices_desc')}</p>
        {lastUpdated && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                {t('last_updated', { date: lastUpdated.toLocaleString() })}
            </p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <aside className="lg:col-span-1 space-y-6">
            <Card>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="mandi-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('select_mandi')}</label>
                        <select
                        id="mandi-select"
                        value={selectedMandi}
                        onChange={(e) => setSelectedMandi(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-700 dark:text-gray-200"
                        >
                        {mandis.map(mandi => (
                            <option key={mandi.id} value={mandi.id}>{getLang(mandi.name)}</option>
                        ))}
                        </select>
                    </div>
                    <div className="relative">
                        <label htmlFor="crop-search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('search_crop')}</label>
                        <div className="flex">
                        <input
                            id="crop-search"
                            type="text"
                            placeholder={isListening ? t('voice_search_listening') : t('search_crop')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-r-0 border-gray-300 dark:border-gray-600 rounded-l-lg shadow-sm focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-gray-200"
                        />
                        <button 
                            onClick={handleVoiceSearch}
                            className={`px-4 py-2 bg-green-600 text-white rounded-r-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 ${isListening ? 'animate-pulse' : ''}`} 
                            title={t('voice_search_start')}
                            disabled={isListening}
                        >
                            <i className={`fas ${isListening ? 'fa-microphone-alt' : 'fa-microphone'}`}></i>
                        </button>
                        </div>
                        <i className="fas fa-search absolute left-4 top-1/2 mt-3 -translate-y-px text-gray-400 dark:text-gray-500"></i>
                    </div>
                </div>
            </Card>

            <Card>
                <h3 className="font-bold text-lg text-yellow-800 dark:text-yellow-300 mb-2"><i className="fas fa-bell mr-2"></i>{t('smart_alerts')}</h3>
                <ul className="space-y-3">
                    <li className="text-sm p-3 bg-green-50 dark:bg-green-900/40 text-green-800 dark:text-green-300 rounded-lg">
                        <i className="fas fa-arrow-up mr-2"></i> {t('alert_good_time_to_sell')}
                    </li>
                    <li className="text-sm p-3 bg-red-50 dark:bg-red-900/40 text-red-800 dark:text-red-300 rounded-lg">
                        <i className="fas fa-arrow-down mr-2"></i> {t('alert_hold_storage')}
                    </li>
                </ul>
            </Card>
            
            <InterMandiComparison allCrops={allCrops} />
        </aside>

         <main className="lg:col-span-2">
            {loading ? (
                <Spinner message={t('fetching_prices')} />
            ) : error ? (
                <p className="text-center text-red-600 bg-red-100 dark:bg-red-900/50 p-4 rounded-lg">{error}</p>
            ) : (
                <div className="space-y-8">
                    {favoritePrices.length > 0 && (
                        <div>
                             <h3 className="text-2xl font-bold text-green-800 dark:text-green-300 mb-4 flex items-center"><i className="fas fa-star text-yellow-400 mr-2"></i>{t('favorites')}</h3>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {favoritePrices.map(p => <PriceCard key={p.cropId} price={p} isFavorite={true} onToggleFavorite={handleToggleFavorite} onViewHistory={setSelectedCropForChart} onListProduce={handleListProduce} />)}
                             </div>
                        </div>
                    )}
                     <div>
                         <h3 className="text-2xl font-bold text-green-800 dark:text-green-300 mb-4">{t('all_crops')}</h3>
                         {otherPrices.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {otherPrices.map(p => <PriceCard key={p.cropId} price={p} isFavorite={false} onToggleFavorite={handleToggleFavorite} onViewHistory={setSelectedCropForChart} onListProduce={handleListProduce} />)}
                            </div>
                         ) : (
                            <p className="text-center text-gray-500 dark:text-gray-400 mt-8">{t('no_prices_found')}</p>
                         )}
                    </div>
                </div>
            )}
        </main>
      </div>

      {selectedCropForChart && (
        <Modal 
            isOpen={!!selectedCropForChart} 
            onClose={() => setSelectedCropForChart(null)}
            title={t('price_history_for_crop', { cropName: getLang(selectedCropForChart.cropName) })}
        >
            {selectedCropForChart.priceHistory ? (
                    <PriceHistoryChart data={selectedCropForChart.priceHistory} />
            ) : (
                <p>{t('no_history_available')}</p>
            )}
        </Modal>
      )}

      <Modal 
        isOpen={isListProduceModalOpen} 
        onClose={() => setIsListProduceModalOpen(false)}
        title={t('list_my_produce')}
      >
          <div className="text-center p-4">
              <i className="fas fa-tools text-4xl text-yellow-500 mb-4"></i>
              <p className="text-lg text-gray-700 dark:text-gray-300">{t('coming_soon')}</p>
          </div>
      </Modal>
    </div>
  );
};

export default MarketPricesView;