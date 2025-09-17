import React, { useState, useMemo } from 'react';
import { CropRecommendation, RiskLevel, SoilData, Page } from '../types';
import { useLocalization } from '../hooks/useLocalization';
import { schemesData } from '../data/schemes';
import Card from './Card';
import SoilReportCard from './SoilReportCard';
import Button from './Button';

interface CropRecommendationCardProps {
  recommendation: CropRecommendation;
  userSoilData: SoilData;
  isTopPick: boolean;
  onSave: (plan: CropRecommendation) => void;
  navigate: (page: Page) => void;
}

const RiskIndicator: React.FC<{ level: RiskLevel }> = ({ level }) => {
    const riskStyles = {
        Low: 'bg-green-100 text-green-800 dark:bg-green-900/70 dark:text-green-200',
        Medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/70 dark:text-yellow-200',
        High: 'bg-red-100 text-red-800 dark:bg-red-900/70 dark:text-red-200',
    };
    return <span className={`px-2 py-1 text-xs font-medium rounded-full ${riskStyles[level]}`}>{level}</span>;
};

const CropRecommendationCard: React.FC<CropRecommendationCardProps> = ({ recommendation, userSoilData, isTopPick, onSave, navigate }) => {
  const { t } = useLocalization();
  const [isExpanded, setIsExpanded] = useState(false);
  const [costs, setCosts] = useState({ seed: 2000, fertilizer: 5000, labor: 8000 });
  const [isSaved, setIsSaved] = useState(false);
  const [feedback, setFeedback] = useState<'liked' | 'disliked' | null>(null);

  const { 
      cropName, suitability, confidenceScore, expectedProfitPerAcre, riskProfile, reason, 
      fertilizerPlan, irrigationSchedule, waterManagement, marketInsights, cropRotationTip,
      idealSoilConditions, expectedYieldPerAcre, estimatedWaterUsage, sustainabilityScore,
      carbonSequestrationPotential, cropCalendar, pestAlerts, averageYieldInRegion
  } = recommendation;

  const totalCostPerAcre = costs.seed + costs.fertilizer + costs.labor;
  const netProfitPerAcreMin = (expectedYieldPerAcre[0] * (expectedProfitPerAcre / ( (expectedYieldPerAcre[0]+expectedYieldPerAcre[1])/2) )) - totalCostPerAcre;
  const netProfitPerAcreMax = (expectedYieldPerAcre[1] * (expectedProfitPerAcre / ( (expectedYieldPerAcre[0]+expectedYieldPerAcre[1])/2) )) - totalCostPerAcre;
  const totalNetProfitMin = netProfitPerAcreMin * userSoilData.landSize;
  const totalNetProfitMax = netProfitPerAcreMax * userSoilData.landSize;

  const handleCostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setCosts(prev => ({ ...prev, [name]: Number(value) }));
  }

  const handleSave = () => {
      onSave(recommendation);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
  }

  const handleFeedback = (newFeedback: 'liked' | 'disliked') => {
    setFeedback(prev => (prev === newFeedback ? null : newFeedback));
  };

  const matchingScheme = useMemo(() => {
    return schemesData.find(s => s.cropType.toLowerCase() === cropName.toLowerCase() || s.cropType === 'Any');
  }, [cropName]);

  const handleAskExpert = () => {
      const subject = `Farming Query: ${cropName} Recommendation`;
      const body = `
        Hello, I have a question regarding my AgriGrow crop recommendation.
        
        Crop: ${cropName}
        Suitability: ${suitability}%
        
        My Soil Data:
        - pH: ${userSoilData.ph}
        - Nitrogen: ${userSoilData.nitrogen} kg/ha
        - Phosphorus: ${userSoilData.phosphorus} kg/ha
        - Potassium: ${userSoilData.potassium} kg/ha
        - Moisture: ${userSoilData.moisture}%
        - Land Size: ${userSoilData.landSize} acres

        My Question:
        [Please type your question here]
      `;
      window.location.href = `mailto:expert@agrigrow.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  return (
    <Card className={`flex flex-col justify-between transition-all duration-300 ${isTopPick ? 'border-l-8 border-yellow-400 shadow-2xl' : 'border-l-8 border-green-500'}`}>
      <div>
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-2xl font-bold text-green-800 dark:text-green-300">{cropName}</h3>
          <div className="text-right">
              <div className="px-3 py-1 bg-yellow-400 text-green-900 font-bold rounded-lg text-lg">
                  {suitability}% {t('suitability')}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('ai_confidence')}: {confidenceScore}%</div>
          </div>
        </div>
        
        <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">{reason}</p>

        {isTopPick && idealSoilConditions && <SoilReportCard userSoilData={userSoilData} idealConditions={idealSoilConditions} cropName={cropName} />}
        
        <div className="my-4 p-4 bg-green-50 dark:bg-gray-700/50 rounded-lg">
            <h4 className="font-bold text-green-800 dark:text-green-300 mb-2">{t('net_profit_simulator')}</h4>
            <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                    <div><label className="font-medium">{t('seed_cost')}/acre</label><input type="number" name="seed" value={costs.seed} onChange={handleCostChange} className="w-full p-1 border rounded dark:bg-gray-600 dark:border-gray-500"/></div>
                    <div><label className="font-medium">{t('fertilizer_cost')}/acre</label><input type="number" name="fertilizer" value={costs.fertilizer} onChange={handleCostChange} className="w-full p-1 border rounded dark:bg-gray-600 dark:border-gray-500"/></div>
                    <div><label className="font-medium">{t('labor_cost')}/acre</label><input type="number" name="labor" value={costs.labor} onChange={handleCostChange} className="w-full p-1 border rounded dark:bg-gray-600 dark:border-gray-500"/></div>
                </div>
                <div className="flex justify-between items-center text-sm p-2 bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded">
                    <span>{t('total_cost')}/acre:</span>
                    <span className="font-bold">₹{totalCostPerAcre.toLocaleString('en-IN')}</span>
                </div>
                <div className="text-center pt-2">
                    <p className="text-sm text-gray-700 dark:text-gray-300">{t('net_profit_range')} (for {userSoilData.landSize} acres)</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">₹{totalNetProfitMin.toLocaleString('en-IN')} - ₹{totalNetProfitMax.toLocaleString('en-IN')}</p>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
            <div>
                <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-2">{t('risk_profile')}</h4>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    <div className="flex justify-between items-center"><span className="text-gray-600 dark:text-gray-400">{t('pest_risk')}</span><RiskIndicator level={riskProfile.pestRisk} /></div>
                    <div className="flex justify-between items-center"><span className="text-gray-600 dark:text-gray-400">{t('water_demand')}</span><RiskIndicator level={riskProfile.waterDemand} /></div>
                    <div className="flex justify-between items-center"><span className="text-gray-600 dark:text-gray-400">{t('market_volatility')}</span><RiskIndicator level={riskProfile.marketVolatility} /></div>
                    <div className="flex justify-between items-center"><span className="text-gray-600 dark:text-gray-400">{t('input_cost')}</span><RiskIndicator level={riskProfile.inputCost} /></div>
                </div>
            </div>
            {matchingScheme && (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-center flex flex-col justify-center">
                    <h4 className="font-bold text-blue-800 dark:text-blue-300"><i className="fas fa-scroll mr-2"></i>{t('scheme_match')}</h4>
                    <p className="text-sm text-blue-700 dark:text-blue-400 mb-2">{matchingScheme.title.en}</p>
                    <button onClick={() => navigate('schemes')} className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline">{t('view_matching_schemes')}</button>
                </div>
            )}
        </div>

        {isExpanded && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-4 text-sm">
                <div>
                    <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-2">{t('community_insights')}</h4>
                    <div className="space-y-2 pl-4">
                        <p><i className="fas fa-chart-area mr-2 text-purple-500"></i><strong>{t('regional_yield_benchmark')}:</strong> {averageYieldInRegion}</p>
                        <p><i className="fas fa-bug mr-2 text-red-500"></i><strong>{t('pest_disease_alerts')}:</strong> {pestAlerts.join(', ')}</p>
                    </div>
                </div>
                <div>
                    <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-2">{t('crop_calendar')}</h4>
                    <ul className="grid grid-cols-2 gap-2 pl-4">
                        <li><i className="fas fa-calendar-day mr-2 text-green-500"></i><strong>{t('sowing_window')}:</strong> {cropCalendar.sowingWindow}</li>
                        <li><i className="fas fa-flask mr-2 text-yellow-600"></i><strong>{t('fertilizer_application')}:</strong> {cropCalendar.fertilizerApplication}</li>
                        <li><i className="fas fa-tint mr-2 text-blue-500"></i><strong>{t('irrigation_milestones')}:</strong> {cropCalendar.irrigationMilestones}</li>
                        <li><i className="fas fa-search mr-2 text-gray-500"></i><strong>{t('pest_scouting')}:</strong> {cropCalendar.pestScouting}</li>
                        <li className="col-span-2"><i className="fas fa-calendar-check mr-2 text-green-700"></i><strong>{t('harvest_window')}:</strong> {cropCalendar.harvestWindow}</li>
                    </ul>
                </div>
                 <div>
                    <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-2">{t('eco_impact')}</h4>
                     <div className="flex justify-around text-center">
                         <div><p className="font-bold text-lg text-blue-600 dark:text-blue-400">{estimatedWaterUsage}</p><p className="text-xs">{t('water_usage')}</p><p className="text-xs text-gray-500 dark:text-gray-400">({t('seasonal_water_usage_unit')})</p></div>
                         <div><p className="font-bold text-lg text-green-600 dark:text-green-400">{sustainabilityScore}/100</p><p className="text-xs">{t('sustainability_score')}</p></div>
                         <div><p className="font-bold text-lg text-gray-700 dark:text-gray-300">{carbonSequestrationPotential.toFixed(2)}</p><p className="text-xs">{t('carbon_sequestration')}</p><p className="text-xs text-gray-500 dark:text-gray-400">({t('carbon_unit')})</p></div>
                     </div>
                </div>
                <div><h4 className="font-semibold text-gray-800 dark:text-gray-200"><i className="fas fa-flask mr-2 text-green-600"></i>{t('fertilizer_plan')}:</h4><p className="text-gray-600 dark:text-gray-400 pl-6">{fertilizerPlan}</p></div>
                <div><h4 className="font-semibold text-gray-800 dark:text-gray-200"><i className="fas fa-tint mr-2 text-blue-500"></i>{t('irrigation_schedule')}:</h4><p className="text-gray-600 dark:text-gray-400 pl-6">{irrigationSchedule}</p></div>
                <div><h4 className="font-semibold text-gray-800 dark:text-gray-200"><i className="fas fa-hand-holding-water mr-2 text-blue-500"></i>{t('water_management')}:</h4><p className="text-gray-600 dark:text-gray-400 pl-6">{waterManagement}</p></div>
                <div><h4 className="font-semibold text-gray-800 dark:text-gray-200"><i className="fas fa-chart-bar mr-2 text-purple-500"></i>{t('market_insights')}:</h4><p className="text-gray-600 dark:text-gray-400 pl-6">{marketInsights}</p></div>
                <div><h4 className="font-semibold text-gray-800 dark:text-gray-200"><i className="fas fa-sync-alt mr-2 text-yellow-600"></i>{t('crop_rotation_tip')}:</h4><p className="text-gray-600 dark:text-gray-400 pl-6">{cropRotationTip}</p></div>
            </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button onClick={() => setIsExpanded(!isExpanded)} className="text-sm font-bold text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 w-full text-left mb-4">
            {isExpanded ? t('less_details') : t('view_advisory')} <i className={`fas fa-chevron-${isExpanded ? 'up' : 'down'} ml-1`}></i>
        </button>
        <div className="flex flex-wrap items-center justify-between gap-3">
             <div className="flex gap-2">
                <Button 
                  onClick={handleSave} 
                  className={`px-3 py-1.5 text-sm ${isSaved ? 'bg-green-600 text-white' : 'bg-yellow-400 text-green-900 hover:bg-yellow-500'}`}
                  aria-label={t('save_plan')}
                >
                  <i className={`fas ${isSaved ? 'fa-check' : 'fa-save'} mr-2`}></i>
                  {isSaved ? t('plan_saved') : t('save_plan')}
                </Button>
                 <Button onClick={handleAskExpert} variant="secondary" className="px-3 py-1.5 text-sm">
                    <i className="fas fa-user-tie mr-2"></i>{t('ask_an_expert')}
                </Button>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                {t('was_this_helpful')}
                <button 
                  onClick={() => handleFeedback('liked')}
                  className={`h-8 w-8 flex items-center justify-center rounded-full transition-colors ${
                    feedback === 'liked' 
                    ? 'text-blue-600 bg-blue-100 dark:bg-blue-900/50' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-100 dark:hover:bg-gray-700'
                  }`}
                  aria-label="Yes"
                >
                  <i className="fas fa-thumbs-up"></i>
                </button>
                <button 
                  onClick={() => handleFeedback('disliked')}
                  className={`h-8 w-8 flex items-center justify-center rounded-full transition-colors ${
                    feedback === 'disliked' 
                    ? 'text-red-600 bg-red-100 dark:bg-red-900/50' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-100 dark:hover:bg-gray-700'
                  }`}
                  aria-label="No"
                >
                  <i className="fas fa-thumbs-down"></i>
                </button>
            </div>
        </div>
      </div>
    </Card>
  );
};

export default CropRecommendationCard;