import React, { useState, useCallback, useEffect } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { getCropRecommendations, getCropRecommendationsForLocation, detectCropDisease } from '../services/geminiService';
import { SoilData, CropRecommendation, Page, CropDiseaseDiagnosis } from '../types';
import Card from '../components/Card';
import SliderInput from '../components/SliderInput';
import Button from '../components/Button';
import Spinner from '../components/Spinner';
import CropRecommendationCard from '../components/CropRecommendationCard';

interface CropRecommendationViewProps {
  navigate: (page: Page) => void;
}

const FARMER_LOG_KEY = 'agriGrowFarmerLog';

const CropRecommendationView: React.FC<CropRecommendationViewProps> = ({ navigate }) => {
  const { t, language } = useLocalization();
  const [soilData, setSoilData] = useState<SoilData>({
    ph: 7.0,
    nitrogen: 150,
    phosphorus: 50,
    potassium: 200,
    moisture: 45,
    landSize: 2.5,
  });
  const [ecoMode, setEcoMode] = useState(false);
  const [recommendations, setRecommendations] = useState<CropRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [infoMessage, setInfoMessage] = useState<{type: 'info' | 'error', text: string} | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [compareMode, setCompareMode] = useState(false);
  const [savedPlans, setSavedPlans] = useState<CropRecommendation[]>([]);
  const [analyzedLocation, setAnalyzedLocation] = useState<string | null>(null);

  // States for Disease Detection
  const [diseaseImage, setDiseaseImage] = useState<File | null>(null);
  const [diseaseImagePreview, setDiseaseImagePreview] = useState<string | null>(null);
  const [diseaseResult, setDiseaseResult] = useState<CropDiseaseDiagnosis | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectionError, setDetectionError] = useState<string | null>(null);

  useEffect(() => {
    const storedPlans = localStorage.getItem(FARMER_LOG_KEY);
    if (storedPlans) {
      setSavedPlans(JSON.parse(storedPlans));
    }
  }, []);

  const handleSavePlan = (plan: CropRecommendation) => {
    const newSavedPlans = [...savedPlans, plan];
    setSavedPlans(newSavedPlans);
    localStorage.setItem(FARMER_LOG_KEY, JSON.stringify(newSavedPlans));
  };

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      const file = files?.[0];
      if (file) {
        setSoilData(prev => ({ ...prev, image: file }));
        setImagePreview(URL.createObjectURL(file));
      }
    } else {
      setSoilData(prev => ({ ...prev, [name]: parseFloat(value) }));
    }
  }, []);

  const clearImage = () => {
    setSoilData(prev => ({ ...prev, image: undefined }));
    setImagePreview(null);
    const fileInput = document.getElementById('soil-image') as HTMLInputElement;
    if(fileInput) fileInput.value = "";
  }

  const handleAnalyzeLocation = () => {
    setLoading(true);
    setInfoMessage({ type: 'info', text: t('fetching_location') });
    setAnalyzedLocation(null);
    setRecommendations([]);
    setCompareMode(false);

    if (!navigator.geolocation) {
      setInfoMessage({ type: 'error', text: t('error_geolocation_unsupported') });
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setInfoMessage({ type: 'info', text: t('fetching_recommendations') });

        try {
          const { recommendations, soilData: inferredSoilData } = await getCropRecommendationsForLocation(
            latitude,
            longitude,
            ecoMode,
            soilData.landSize
          );

          const newSoilData = {
            ...soilData,
            ph: inferredSoilData.ph,
            nitrogen: inferredSoilData.nitrogen,
            phosphorus: inferredSoilData.phosphorus,
            potassium: inferredSoilData.potassium,
            moisture: inferredSoilData.moisture,
          };
          
          setSoilData(newSoilData);
          setAnalyzedLocation(inferredSoilData.locationName);
          recommendations.sort((a, b) => b.suitability - a.suitability);
          setRecommendations(recommendations);
          setInfoMessage(null);
        } catch (err) {
          setInfoMessage({ type: 'error', text: t('error_fetching') });
        } finally {
          setLoading(false);
        }
      },
      (geoError) => {
        // Log a more descriptive error message to fix the '[object Object]' output
        console.error(`Geolocation error (Code: ${geoError.code}): ${geoError.message}`);
        
        // Provide more specific feedback to the user
        let errorMessage: string;
        switch (geoError.code) {
          case 1: // PERMISSION_DENIED
            errorMessage = t('error_geolocation');
            break;
          case 2: // POSITION_UNAVAILABLE
            errorMessage = t('error_geolocation_unavailable');
            break;
          case 3: // TIMEOUT
            errorMessage = t('error_geolocation_timeout');
            break;
          default:
            errorMessage = t('error_geolocation_generic');
            break;
        }
        
        setInfoMessage({ type: 'error', text: errorMessage });
        setLoading(false);
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setInfoMessage(null);
    setRecommendations([]);
    setCompareMode(false);
    try {
      const result = await getCropRecommendations(soilData, ecoMode);
      // Sort by suitability to ensure the best is first
      result.sort((a, b) => b.suitability - a.suitability);
      setRecommendations(result);
    } catch (err) {
      setInfoMessage({ type: 'error', text: t('error_fetching') });
    } finally {
      setLoading(false);
    }
  };
  
  const handleReadAloud = () => {
    if ('speechSynthesis' in window && recommendations.length > 0) {
      window.speechSynthesis.cancel();
      const textToSpeak = recommendations.map((rec, index) => 
        `Recommendation ${index + 1}: ${rec.cropName}. Suitability: ${rec.suitability} percent. ${rec.reason}`
      ).join('. ');
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = language;
      window.speechSynthesis.speak(utterance);
    } else {
      alert('Sorry, your browser does not support text-to-speech.');
    }
  };

  const handleDiseaseImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setDiseaseImage(file);
      setDiseaseImagePreview(URL.createObjectURL(file));
      setDiseaseResult(null);
      setDetectionError(null);
    }
  };

  const handleClearDiseaseImage = () => {
    setDiseaseImage(null);
    setDiseaseImagePreview(null);
    const fileInput = document.getElementById('disease-image') as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };
  
  const handleDetectDisease = async () => {
    if (!diseaseImage) return;
    setIsDetecting(true);
    setDetectionError(null);
    setDiseaseResult(null);

    try {
      const result = await detectCropDisease(diseaseImage);
      setDiseaseResult(result);
    } catch (err) {
      setDetectionError(t('error_detecting_disease'));
    } finally {
      setIsDetecting(false);
    }
  };

  const ComparisonView = () => (
    <Card>
        <h2 className="text-2xl font-bold text-green-800 dark:text-green-300 mb-4">{t('comparison_view')}</h2>
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-green-50 dark:bg-gray-700">
                    <tr>
                        <th scope="col" className="px-6 py-3">{t('metric')}</th>
                        {recommendations.map(rec => <th key={rec.cropName} scope="col" className="px-6 py-3 text-center">{rec.cropName}</th>)}
                    </tr>
                </thead>
                <tbody>
                    <tr className="bg-white dark:bg-gray-800 border-b dark:border-gray-700"><td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{t('suitability')}</td>{recommendations.map(r => <td key={r.cropName} className="px-6 py-4 text-center font-bold">{r.suitability}%</td>)}</tr>
                    <tr className="bg-green-50/50 dark:bg-gray-700/50 border-b dark:border-gray-700"><td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{t('expected_profit')}</td>{recommendations.map(r => <td key={r.cropName} className="px-6 py-4 text-center">₹{r.expectedProfitPerAcre.toLocaleString()}/{t('per_acre')}</td>)}</tr>
                    <tr className="bg-white dark:bg-gray-800 border-b dark:border-gray-700"><td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{t('pest_risk')}</td>{recommendations.map(r => <td key={r.cropName} className="px-6 py-4 text-center">{r.riskProfile.pestRisk}</td>)}</tr>
                    <tr className="bg-green-50/50 dark:bg-gray-700/50 border-b dark:border-gray-700"><td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{t('water_demand')}</td>{recommendations.map(r => <td key={r.cropName} className="px-6 py-4 text-center">{r.riskProfile.waterDemand}</td>)}</tr>
                    <tr className="bg-white dark:bg-gray-800 border-b dark:border-gray-700"><td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{t('market_volatility')}</td>{recommendations.map(r => <td key={r.cropName} className="px-6 py-4 text-center">{r.riskProfile.marketVolatility}</td>)}</tr>
                    <tr className="bg-green-50/50 dark:bg-gray-700/50"><td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{t('input_cost')}</td>{recommendations.map(r => <td key={r.cropName} className="px-6 py-4 text-center">{r.riskProfile.inputCost}</td>)}</tr>
                </tbody>
            </table>
        </div>
    </Card>
  );

  return (
    <div className="space-y-8">
      <Card>
        <h2 className="text-3xl font-bold text-green-800 dark:text-green-300 mb-4">{t('recommendation_form_title')}</h2>
        
        {infoMessage && <div className={`text-center p-3 rounded-lg mb-4 text-sm ${infoMessage.type === 'error' ? 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300' : 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'}`}>{infoMessage.text}</div>}
        {analyzedLocation && !loading && (
          <div className="text-center p-2 bg-green-50 dark:bg-green-900/50 text-green-700 dark:text-green-300 rounded-lg mb-4 text-sm font-semibold">
              <i className="fas fa-map-marker-alt mr-2"></i>
              {t('location_analyzed', { location: analyzedLocation })}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">{t('soil_data_sliders')}</h3>
                     <div className="space-y-4">
                        <SliderInput label={t('ph_level')} id="ph" min={4} max={9} step={0.1} value={soilData.ph} unit="" onChange={handleChange} />
                        <SliderInput label={t('nitrogen')} id="nitrogen" min={0} max={300} step={1} value={soilData.nitrogen} unit="kg/ha" onChange={handleChange} />
                        <SliderInput label={t('phosphorus')} id="phosphorus" min={0} max={150} step={1} value={soilData.phosphorus} unit="kg/ha" onChange={handleChange} />
                        <SliderInput label={t('potassium')} id="potassium" min={0} max={300} step={1} value={soilData.potassium} unit="kg/ha" onChange={handleChange} />
                        <SliderInput label={t('moisture')} id="moisture" min={10} max={90} step={1} value={soilData.moisture} unit="%" onChange={handleChange} />
                    </div>
                </div>
                 <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">{t('additional_info')}</h3>
                    <div className="space-y-4">
                        <SliderInput label={t('land_size')} id="landSize" min={0.5} max={50} step={0.5} value={soilData.landSize} unit="acres" onChange={handleChange} />
                        <div>
                            <label htmlFor="soil-image" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('upload_soil_photo')}</label>
                            <input type="file" id="soil-image" name="image" accept="image/*" onChange={handleChange} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 dark:file:bg-gray-700 dark:file:text-gray-300 dark:hover:file:bg-gray-600" />
                        </div>
                        {imagePreview && (
                            <div className="relative w-32 h-32">
                                <img src={imagePreview} alt="Soil preview" className="w-full h-full object-cover rounded-lg shadow-md" />
                                <button onClick={clearImage} type="button" className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full h-7 w-7 flex items-center justify-center shadow-lg hover:bg-red-600" title={t('clear_image')}>
                                    <i className="fas fa-times"></i>
                                </button>
                            </div>
                        )}
                        <Button type="button" onClick={handleAnalyzeLocation} className="w-full bg-blue-500 text-white hover:bg-blue-600" icon="fa-map-marker-alt" disabled={loading}>
                            {t('analyze_my_location')}
                        </Button>
                    </div>
                </div>
            </div>
           <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-100 dark:border-gray-700">
             <label htmlFor="eco-mode" className="flex items-center space-x-3 cursor-pointer">
                <input type="checkbox" id="eco-mode" checked={ecoMode} onChange={(e) => setEcoMode(e.target.checked)} className="h-5 w-5 rounded text-green-600 focus:ring-green-500" />
                <span className="text-gray-700 dark:text-gray-300 font-medium">{t('eco_mode')} <i className="fas fa-leaf text-green-500"></i></span>
             </label>
             <Button type="submit" variant="secondary" icon="fa-magic" disabled={loading} className="w-full md:w-auto">
              {loading ? t('fetching_recommendations') : t('get_recommendation')}
            </Button>
          </div>
        </form>
      </Card>

      <Card>
        <h2 className="text-3xl font-bold text-green-800 dark:text-green-300 mb-2">{t('disease_detection_title')}</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">{t('disease_detection_desc')}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {/* Left Side: Upload and Preview */}
          <div className="text-center">
            <label htmlFor="disease-image" className="w-full cursor-pointer bg-green-50 dark:bg-gray-700 border-2 border-dashed border-green-300 dark:border-gray-600 rounded-lg p-8 flex flex-col items-center justify-center hover:bg-green-100 dark:hover:bg-gray-600 transition-colors">
              <i className="fas fa-camera text-4xl text-green-500 dark:text-green-400 mb-3"></i>
              <span className="font-semibold text-green-700 dark:text-green-300">{t('upload_crop_photo_leaf')}</span>
              <input type="file" id="disease-image" accept="image/*" onChange={handleDiseaseImageChange} className="hidden" />
            </label>
            {diseaseImagePreview && (
              <div className="mt-4 relative w-48 h-48 mx-auto">
                <img src={diseaseImagePreview} alt="Crop leaf preview" className="w-full h-full object-cover rounded-lg shadow-md" />
                <button onClick={handleClearDiseaseImage} type="button" className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full h-7 w-7 flex items-center justify-center shadow-lg hover:bg-red-600" title={t('clear_disease_image')}>
                  <i className="fas fa-times"></i>
                </button>
              </div>
            )}
            <Button
              onClick={handleDetectDisease}
              disabled={!diseaseImage || isDetecting}
              variant="secondary"
              icon="fa-search"
              className="mt-4 w-full"
            >
              {isDetecting ? t('detecting_disease') : t('detect_disease')}
            </Button>
          </div>

          {/* Right Side: Results */}
          <div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">{t('disease_diagnosis_result')}</h3>
            {isDetecting && <Spinner message={t('detecting_disease')} />}
            {detectionError && <p className="text-red-600 bg-red-100 dark:text-red-300 dark:bg-red-900/50 p-3 rounded-lg">{detectionError}</p>}
            {diseaseResult && (
              <div className="space-y-4">
                {diseaseResult.diseaseName.toLowerCase() === 'healthy' ? (
                  <div className="p-4 bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 rounded-lg text-center">
                    <i className="fas fa-check-circle text-3xl mb-2"></i>
                    <p className="font-bold">{t('plant_is_healthy')}</p>
                    <p className="text-sm mt-1">{diseaseResult.description}</p>
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('disease_name')}</label>
                      <p className="text-lg font-bold text-red-700 dark:text-red-400">{diseaseResult.diseaseName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('confidence')}</label>
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
                        <div className="bg-green-600 h-2.5 rounded-full" style={{ width: `${diseaseResult.confidenceScore}%` }}></div>
                      </div>
                      <p className="text-right text-sm font-semibold">{diseaseResult.confidenceScore}%</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('description')}</label>
                      <p className="text-gray-700 dark:text-gray-300 text-sm">{diseaseResult.description}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('recommended_actions')}</label>
                      <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300 mt-1">
                        {diseaseResult.recommendedActions.map((action, index) => (
                          <li key={index}>{action}</li>
                        ))}
                      </ul>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </Card>
      
      {loading && !infoMessage && <Spinner message={t('fetching_recommendations')} />}
      
      {recommendations.length > 0 && (
        <div className="space-y-6">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-green-800 dark:text-green-300">{t('recommendations_title')}</h2>
            <div className="mt-4 flex flex-wrap justify-center gap-4">
                <Button onClick={() => setCompareMode(!compareMode)} variant="primary" icon={compareMode ? "fa-list" : "fa-balance-scale"}>
                    {compareMode ? t('back_to_results') : t('compare_recommendations')}
                </Button>
                <Button onClick={handleReadAloud} variant="primary" icon="fa-volume-up">
                    {t('read_aloud')}
                </Button>
            </div>
          </div>
          {compareMode ? (
              <ComparisonView />
          ) : (
            <>
                {recommendations[0] && (
                    <div>
                        <h3 className="text-xl font-bold text-yellow-600 dark:text-yellow-400 mb-4 text-center">{t('top_recommendation')}</h3>
                        <CropRecommendationCard recommendation={recommendations[0]} userSoilData={soilData} isTopPick={true} onSave={handleSavePlan} navigate={navigate} />
                    </div>
                )}
                {recommendations.length > 1 && (
                     <div>
                        <h3 className="text-xl font-bold text-green-700 dark:text-green-400 mt-8 mb-4 text-center">{t('alternative_options')}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {recommendations.slice(1).map((rec) => (
                                <CropRecommendationCard key={rec.cropName} recommendation={rec} userSoilData={soilData} isTopPick={false} onSave={handleSavePlan} navigate={navigate} />
                            ))}
                        </div>
                    </div>
                )}
            </>
          )}
        </div>
      )}
      {savedPlans.length > 0 && (
          <Card>
              <h3 className="text-2xl font-bold text-green-800 dark:text-green-300 mb-4"><i className="fas fa-book mr-2"></i>{t('farmers_log')}</h3>
              <ul className="space-y-2">
                  {savedPlans.map((plan, index) => (
                      <li key={index} className="flex justify-between items-center p-3 bg-green-50 dark:bg-gray-700 rounded-lg">
                          <span className="font-semibold">{plan.cropName}</span>
                          <span className="text-sm text-gray-600 dark:text-gray-400">{t('suitability')}: {plan.suitability}%</span>
                      </li>
                  ))}
              </ul>
          </Card>
      )}
    </div>
  );
};

export default CropRecommendationView;