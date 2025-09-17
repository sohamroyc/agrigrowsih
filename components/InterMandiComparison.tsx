import React, { useState } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { MarketPrice } from '../types';
import { fetchMarketPrices } from '../services/marketPriceService';
import { mandis } from '../data/marketData';
import Card from './Card';
import Button from './Button';
import Spinner from './Spinner';

interface InterMandiComparisonProps {
  allCrops: MarketPrice[];
}

interface ComparisonResult {
    mandiName: string;
    price: number;
}

const InterMandiComparison: React.FC<InterMandiComparisonProps> = ({ allCrops }) => {
    const { t, language } = useLocalization();
    const [selectedCropId, setSelectedCropId] = useState<string>(allCrops[0]?.cropId.split('_')[0] || '');
    const [selectedMandiIds, setSelectedMandiIds] = useState<string[]>([mandis[0]?.id]);
    const [results, setResults] = useState<ComparisonResult[]>([]);
    const [loading, setLoading] = useState(false);

    const getLang = (field: any) => field[language] || field.en;
    
    const uniqueCrops = allCrops.reduce((acc, crop) => {
        const cropName = getLang(crop.cropName);
        if (!acc.some(c => getLang(c.cropName) === cropName)) {
            acc.push(crop);
        }
        return acc;
    }, [] as MarketPrice[]);


    const handleMandiChange = (mandiId: string) => {
        setSelectedMandiIds(prev => {
            if (prev.includes(mandiId)) {
                return prev.filter(id => id !== mandiId);
            }
            if (prev.length < 3) {
                return [...prev, mandiId];
            }
            return prev;
        });
    };

    const handleCompare = async () => {
        setLoading(true);
        setResults([]);
        try {
            const pricePromises = selectedMandiIds.map(mandiId => fetchMarketPrices(mandiId));
            const priceResults = await Promise.all(pricePromises);
            
            const comparisonData: ComparisonResult[] = priceResults.map((prices, index) => {
                const mandiId = selectedMandiIds[index];
                const cropPrice = prices.find(p => p.cropId.startsWith(selectedCropId));
                return {
                    mandiName: getLang(mandis.find(m => m.id === mandiId)?.name),
                    price: cropPrice?.price || 0,
                };
            });
            setResults(comparisonData);
        } catch (error) {
            console.error("Failed to compare prices", error);
        } finally {
            setLoading(false);
        }
    };
    
    const maxPrice = results.length > 0 ? Math.max(...results.map(r => r.price)) : 0;

    return (
        <Card>
            <h2 className="text-lg font-bold text-green-800 dark:text-green-300 mb-2">{t('inter_mandi_comparison')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div className="md:col-span-3">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('select_crop_to_compare')}</label>
                    <select value={selectedCropId} onChange={e => setSelectedCropId(e.target.value)} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-700 dark:text-gray-200">
                         {uniqueCrops.map(crop => <option key={crop.cropId} value={crop.cropId.split('_')[0]}>{getLang(crop.cropName)}</option>)}
                    </select>
                </div>
            </div>
            <div className="mt-4">
                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('select_mandis_to_compare')}</label>
                 <div className="flex flex-wrap gap-2">
                     {mandis.map(mandi => (
                         <button 
                            key={mandi.id}
                            onClick={() => handleMandiChange(mandi.id)}
                            className={`px-3 py-1.5 text-sm rounded-full border-2 transition-colors ${selectedMandiIds.includes(mandi.id) ? 'bg-green-600 text-white border-green-600' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-green-400'}`}
                         >
                            {getLang(mandi.name)}
                         </button>
                     ))}
                 </div>
            </div>
            <Button onClick={handleCompare} disabled={loading || selectedMandiIds.length < 2} variant="secondary" className="w-full mt-4">{t('compare')}</Button>


            <div className="mt-6 min-h-[100px]">
                {loading && <Spinner message={t('fetching_prices')} />}
                {results.length > 0 && !loading && (
                    <div className="space-y-3">
                        {results.sort((a,b) => b.price - a.price).map(result => (
                            <div key={result.mandiName} className="flex items-center gap-4">
                                <div className="w-32 text-sm font-semibold text-gray-700 dark:text-gray-200 truncate flex items-center gap-2">
                                    <span>{result.mandiName}</span>
                                    {result.price === maxPrice && maxPrice > 0 && (
                                        <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-yellow-400 text-green-900">{t('best_price')}</span>
                                    )}
                                </div>
                                <div className="flex-grow bg-gray-200 dark:bg-gray-700 rounded-full h-6">
                                    {result.price > 0 ? (
                                        <div 
                                            className="bg-green-500 h-6 rounded-full flex items-center justify-end px-2"
                                            style={{ width: `${(result.price / maxPrice) * 100}%` }}
                                        >
                                           <span className="font-bold text-white text-sm">₹{result.price.toLocaleString()}</span>
                                        </div>
                                    ) : (
                                        <div className="h-6 flex items-center px-2">
                                            <span className="text-gray-500 dark:text-gray-400 text-sm">N/A</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

        </Card>
    );
};

export default InterMandiComparison;