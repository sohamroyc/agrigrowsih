import React, { useState, useEffect } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { MarketPrice, UserHarvest } from '../types';
import Card from './Card';
import Button from './Button';

const HARVEST_LOG_KEY = 'agriGrowHarvestLog';

interface HarvestTrackerProps {
    allCrops: MarketPrice[];
    currentPrices: MarketPrice[];
}

const HarvestTracker: React.FC<HarvestTrackerProps> = ({ allCrops, currentPrices }) => {
    const { t, language } = useLocalization();
    const [harvestLog, setHarvestLog] = useState<UserHarvest[]>([]);
    const [selectedCropId, setSelectedCropId] = useState('');
    const [quantity, setQuantity] = useState<number | ''>('');

    useEffect(() => {
        const storedLog = localStorage.getItem(HARVEST_LOG_KEY);
        if (storedLog) {
            setHarvestLog(JSON.parse(storedLog));
        }
    }, []);
    
    useEffect(() => {
        if (allCrops.length > 0) {
            setSelectedCropId(allCrops[0].cropId);
        }
    }, [allCrops]);

    const handleAddToHarvest = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCropId || !quantity || quantity <= 0) return;

        const newHarvest: UserHarvest = { cropId: selectedCropId, quantity: quantity };
        const updatedLog = [...harvestLog, newHarvest];
        setHarvestLog(updatedLog);
        localStorage.setItem(HARVEST_LOG_KEY, JSON.stringify(updatedLog));
        setQuantity('');
    };
    
    const handleRemoveFromHarvest = (index: number) => {
        const updatedLog = harvestLog.filter((_, i) => i !== index);
        setHarvestLog(updatedLog);
        localStorage.setItem(HARVEST_LOG_KEY, JSON.stringify(updatedLog));
    }

    const getLang = (field: any) => field[language] || field.en;

    const calculateTotalValue = () => {
        return harvestLog.reduce((total, item) => {
            const marketItem = currentPrices.find(p => p.cropId === item.cropId);
            const price = marketItem ? marketItem.price : 0;
            return total + (price * item.quantity);
        }, 0);
    };
    
    const totalValue = calculateTotalValue();

    return (
        <Card>
            <h2 className="text-2xl font-bold text-green-800 mb-2">{t('my_harvest_tracker')}</h2>
            <p className="text-gray-600 mb-4">{t('track_your_harvest_value')}</p>

            <form onSubmit={handleAddToHarvest} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end bg-green-50 p-4 rounded-lg mb-4">
                <div>
                    <label htmlFor="crop-select" className="block text-sm font-medium text-gray-700 mb-1">{t('crop')}</label>
                    <select id="crop-select" value={selectedCropId} onChange={(e) => setSelectedCropId(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm">
                        {allCrops.map(crop => <option key={crop.cropId} value={crop.cropId}>{getLang(crop.cropName)}</option>)}
                    </select>
                </div>
                 <div>
                    <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">{t('quantity_quintals')}</label>
                    <input id="quantity" type="number" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm" />
                </div>
                <Button type="submit" variant="secondary" className="w-full">{t('add_to_harvest')}</Button>
            </form>

            {harvestLog.length > 0 ? (
                <div>
                    <ul className="space-y-2 mb-4">
                        {harvestLog.map((item, index) => {
                             const cropInfo = allCrops.find(c => c.cropId === item.cropId);
                             const marketInfo = currentPrices.find(p => p.cropId === item.cropId);
                             const value = marketInfo ? marketInfo.price * item.quantity : 0;
                             return (
                                <li key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                    <div className="font-semibold">{getLang(cropInfo?.cropName)}: {item.quantity} {t('quantity_quintals')}</div>
                                    <div className="flex items-center gap-4">
                                        <span className="text-green-700 font-bold">₹{value.toLocaleString('en-IN')}</span>
                                        <button onClick={() => handleRemoveFromHarvest(index)} className="text-red-500 hover:text-red-700 text-xs">&times;</button>
                                    </div>
                                </li>
                             )
                        })}
                    </ul>
                    <div className="text-right p-3 bg-yellow-100 rounded-lg">
                        <span className="font-bold text-yellow-800">{t('total_harvest_value')}: </span>
                        <span className="text-xl font-extrabold text-yellow-900">₹{totalValue.toLocaleString('en-IN')}</span>
                    </div>
                </div>
            ) : (
                <p className="text-center text-gray-500 py-4">{t('no_harvest_tracked')}</p>
            )}
        </Card>
    );
};

export default HarvestTracker;
