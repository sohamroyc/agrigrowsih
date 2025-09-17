import React from 'react';
import { SoilData } from '../types';
import { useLocalization } from '../hooks/useLocalization';

interface SoilReportCardProps {
    userSoilData: SoilData;
    idealConditions: {
        ph: [number, number];
        nitrogen: [number, number];
        phosphorus: [number, number];
        potassium: [number, number];
    };
    cropName: string;
}

const ReportItem: React.FC<{ label: string, userValue: number, idealRange: [number, number], unit: string }> = ({ label, userValue, idealRange, unit }) => {
    const { t } = useLocalization();
    const [min, max] = idealRange;
    const isWithinRange = userValue >= min && userValue <= max;
    
    // Calculate percentage for the progress bar based on a broader scale
    const overallMin = Math.min(min, userValue) * 0.8;
    const overallMax = Math.max(max, userValue) * 1.2;
    const userPercent = ((userValue - overallMin) / (overallMax - overallMin)) * 100;
    const minPercent = ((min - overallMin) / (overallMax - overallMin)) * 100;
    const maxPercent = ((max - overallMin) / (overallMax - overallMin)) * 100;
    const rangeWidth = maxPercent - minPercent;

    return (
        <div>
            <div className="flex justify-between items-baseline mb-1">
                <span className="font-semibold text-gray-700 dark:text-gray-300">{label}</span>
                <span className={`font-bold text-sm ${isWithinRange ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'}`}>{t('your_value')}: {userValue.toFixed(1)} {unit}</span>
            </div>
            <div className="relative h-4 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                {/* Ideal Range Bar */}
                <div 
                    className="absolute h-full bg-green-200 dark:bg-green-900/50 rounded-full" 
                    style={{ left: `${minPercent}%`, width: `${rangeWidth}%` }}
                    title={`${t('ideal_range')}: ${min}-${max}`}
                ></div>
                {/* User Value Marker */}
                <div 
                    className={`absolute top-0 h-full w-1 ${isWithinRange ? 'bg-green-600' : 'bg-orange-500'}`}
                    style={{ left: `${userPercent}%` }}
                ></div>
            </div>
             <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                <span>{min}</span>
                <span className="font-medium">{t('ideal_range')}</span>
                <span>{max}</span>
            </div>
        </div>
    );
};


const SoilReportCard: React.FC<SoilReportCardProps> = ({ userSoilData, idealConditions, cropName }) => {
  const { t } = useLocalization();

  return (
    <div className="my-4 p-4 bg-green-50 dark:bg-gray-700/50 rounded-lg border border-green-200 dark:border-gray-700">
      <h4 className="font-bold text-green-800 dark:text-green-300 mb-3">{t('soil_report_card_title', { cropName })}</h4>
      <div className="space-y-4">
        <ReportItem label={t('ph_level')} userValue={userSoilData.ph} idealRange={idealConditions.ph} unit="" />
        <ReportItem label={t('nitrogen')} userValue={userSoilData.nitrogen} idealRange={idealConditions.nitrogen} unit="kg/ha" />
        <ReportItem label={t('phosphorus')} userValue={userSoilData.phosphorus} idealRange={idealConditions.phosphorus} unit="kg/ha" />
        <ReportItem label={t('potassium')} userValue={userSoilData.potassium} idealRange={idealConditions.potassium} unit="kg/ha" />
      </div>
    </div>
  );
};

export default SoilReportCard;