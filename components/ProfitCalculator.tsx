import React, { useState, useMemo } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { MarketPrice } from '../types';

interface ProfitCalculatorProps {
  cropPrice: MarketPrice;
}

// Constants for calculation
const TRANSPORT_COST_PER_KM_QUINTAL = 2.5; // INR
const MANDI_COMMISSION_PERCENT = 2.0; // 2%

const ProfitCalculator: React.FC<ProfitCalculatorProps> = ({ cropPrice }) => {
    const { t } = useLocalization();
    const [distance, setDistance] = useState<number | ''>('');
    const [quantity, setQuantity] = useState<number | ''>('');

    const calculations = useMemo(() => {
        const q = Number(quantity);
        const d = Number(distance);

        if (q <= 0) return null;

        const grossValue = cropPrice.price * q;
        const transportCost = d > 0 ? d * q * TRANSPORT_COST_PER_KM_QUINTAL : 0;
        const mandiCommission = grossValue * (MANDI_COMMISSION_PERCENT / 100);
        const totalDeductions = transportCost + mandiCommission;
        const netEarnings = grossValue - totalDeductions;

        return {
            grossValue,
            transportCost,
            mandiCommission,
            totalDeductions,
            netEarnings
        };
    }, [distance, quantity, cropPrice]);

    const formatCurrency = (value: number) => `₹${value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    return (
        <div className="space-y-6 p-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="distance" className="block text-sm font-medium text-gray-700 mb-1">{t('distance_to_mandi')}</label>
                    <input id="distance" type="number" value={distance} onChange={e => setDistance(Number(e.target.value))} className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm" placeholder="e.g., 25" />
                </div>
                <div>
                    <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">{t('quantity_to_sell')}</label>
                    <input id="quantity" type="number" value={quantity} onChange={e => setQuantity(Number(e.target.value))} className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm" placeholder="e.g., 50" />
                </div>
            </div>
            
            {calculations && (
                <div className="space-y-3 pt-4 border-t border-gray-200">
                    <div className="flex justify-between text-sm"><span className="text-gray-600">Gross Sale Value ({quantity} Qtl x ₹{cropPrice.price})</span><span className="font-medium">{formatCurrency(calculations.grossValue)}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-gray-600">{t('estimated_transport_cost')}</span><span className="font-medium text-red-600">- {formatCurrency(calculations.transportCost)}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-gray-600">{t('estimated_mandi_commission')} ({MANDI_COMMISSION_PERCENT}%)</span><span className="font-medium text-red-600">- {formatCurrency(calculations.mandiCommission)}</span></div>
                    <hr/>
                    <div className="flex justify-between font-bold text-lg">
                        <span>{t('estimated_net_earnings')}</span>
                        <span className="text-green-700">{formatCurrency(calculations.netEarnings)}</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfitCalculator;
