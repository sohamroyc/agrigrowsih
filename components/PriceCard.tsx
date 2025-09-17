import React from 'react';
import { MarketPrice } from '../types';
import { useLocalization } from '../hooks/useLocalization';
import Card from './Card';
import SparklineChart from './SparklineChart';

interface PriceCardProps {
  price: MarketPrice;
  isFavorite: boolean;
  onToggleFavorite: (cropId: string) => void;
  onViewHistory: (priceData: MarketPrice) => void;
  onListProduce: (priceData: MarketPrice) => void;
}

const PriceCard: React.FC<PriceCardProps> = ({ price, isFavorite, onToggleFavorite, onViewHistory, onListProduce }) => {
  const { t, language } = useLocalization();

  const getLang = (field: any) => field[language] || field['en'];

  const trendInfo = {
    up: { color: 'bg-green-500' },
    down: { color: 'bg-red-500' },
    stable: { color: 'bg-yellow-500' },
  };

  const currentTrend = trendInfo[price.trend];
  const priceHistoryData = price.priceHistory?.map(h => h.price) || [];

  return (
    <Card className="flex flex-col justify-between transition-all duration-300">
      <div>
        <div className="flex justify-between items-start">
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">{getLang(price.cropName)}</h3>
          <div className="flex items-center gap-3">
            <div className={`w-4 h-4 rounded-full ${currentTrend.color}`} title={`Trend: ${price.trend}`}></div>
            <button onClick={() => onToggleFavorite(price.cropId)} aria-label="Toggle Favorite">
              <i className={`fas fa-star text-2xl ${isFavorite ? `text-yellow-400` : `text-gray-300 dark:text-gray-600 hover:text-yellow-300`}`}></i>
            </button>
          </div>
        </div>
        
        <div className="mt-2 flex items-end justify-between gap-4">
            <div>
                <span className="text-3xl font-bold text-gray-800 dark:text-gray-200">
                    ₹{price.price.toLocaleString('en-IN')}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400"> / {t('price_per_quintal').split(' ')[2]}</span>
            </div>
            {priceHistoryData.length > 0 && (
                <div className="w-28 h-10">
                    <SparklineChart data={priceHistoryData} />
                </div>
            )}
        </div>

        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
              <p className="text-xs font-bold text-blue-800 dark:text-blue-300 mb-1">{t('ai_price_forecast')}:</p>
              <p className="text-sm text-blue-700 dark:text-blue-400">{getLang(price.aiForecast)}</p>
        </div>
      </div>
       <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex flex-wrap gap-2">
         <button 
            onClick={() => onViewHistory(price)}
            className="flex-1 text-center px-4 py-2 text-sm font-bold rounded-lg shadow-sm transition-colors bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
        >
            <i className="fas fa-chart-line mr-2"></i>{t('view_price_history')}
        </button>
        <button 
            onClick={() => onListProduce(price)}
            className="flex-1 text-center px-4 py-2 text-sm font-bold rounded-lg shadow-sm transition-colors bg-green-600 text-white hover:bg-green-700"
        >
            <i className="fas fa-store-alt mr-2"></i>{t('list_my_produce')}
        </button>
       </div>
    </Card>
  );
};

export default PriceCard;
