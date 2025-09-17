
import React, { useState, useMemo } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { useAuth } from '../hooks/useAuth';
import { schemesData } from '../data/schemes';
import { Page, Scheme, SchemeCategory } from '../types';
import { checkSchemeEligibility } from '../services/geminiService';
import Card from '../components/Card';
import SchemeCard from '../components/SchemeCard';
import Button from '../components/Button';
import Modal from '../components/Modal';
import SchemeChatbotView from './SchemeChatbotView';

interface SchemesViewProps {
  navigate: (page: Page, data?: any) => void;
}

const allCategories: SchemeCategory[] = ['Insurance', 'Subsidy', 'Credit', 'Irrigation', 'General'];

const SchemesView: React.FC<SchemesViewProps> = ({ navigate }) => {
  const { t, language } = useLocalization();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<SchemeCategory | 'All'>('All');
  const [selectedState, setSelectedState] = useState('All');
  const [showNewOnly, setShowNewOnly] = useState(false);
  
  const [selectedSchemeForChat, setSelectedSchemeForChat] = useState<Scheme | null>(null);
  const [isChatbotModalOpen, setIsChatbotModalOpen] = useState(false);

  const [recommendedSchemes, setRecommendedSchemes] = useState<{ schemeId: string; reason: string }[]>([]);
  const [isCheckingEligibility, setIsCheckingEligibility] = useState(false);
  const [eligibilityChecked, setEligibilityChecked] = useState(false);

  const handleAskAi = (scheme: Scheme) => {
    setSelectedSchemeForChat(scheme);
    setIsChatbotModalOpen(true);
  };
  
  const handleCheckEligibility = async () => {
      if (!user) return;
      setIsCheckingEligibility(true);
      try {
          const recommendations = await checkSchemeEligibility(user, schemesData, language);
          setRecommendedSchemes(recommendations);
          setEligibilityChecked(true);
      } catch (error) {
          console.error("Eligibility check failed:", error);
          // Optionally, show an error message to the user
      } finally {
          setIsCheckingEligibility(false);
      }
  };

  const availableStates = useMemo(() => {
    const states = new Set(schemesData.map(s => s.state));
    return Array.from(states);
  }, []);

  const sortedAndFilteredSchemes = useMemo(() => {
    const filtered = schemesData.filter(scheme => {
      const categoryMatch = selectedCategory === 'All' || scheme.category === selectedCategory;
      const stateMatch = selectedState === 'All' || scheme.state === selectedState;
      const newMatch = !showNewOnly || scheme.isNew;
      const searchMatch = searchTerm === '' || 
        (scheme.title[language] || scheme.title.en).toLowerCase().includes(searchTerm.toLowerCase()) ||
        (scheme.summary[language] || scheme.summary.en).toLowerCase().includes(searchTerm.toLowerCase());
      return categoryMatch && searchMatch && stateMatch && newMatch;
    });

    // Sort to bring recommended schemes to the top
    filtered.sort((a, b) => {
      const isARecommended = recommendedSchemes.some(r => r.schemeId === a.id);
      const isBRecommended = recommendedSchemes.some(r => r.schemeId === b.id);
      if (isARecommended && !isBRecommended) return -1;
      if (!isARecommended && isBRecommended) return 1;
      return (b.popularity || 0) - (a.popularity || 0); // fallback to popularity
    });
    
    return filtered;
  }, [searchTerm, selectedCategory, selectedState, showNewOnly, language, recommendedSchemes]);

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-4xl font-extrabold text-green-800 dark:text-green-300">{t('schemes_title')}</h2>
        <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">{t('schemes_tagline')}</p>
      </div>

     <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <aside className="lg:col-span-1 space-y-6">
            <Card>
                <h3 className="text-lg font-bold text-green-800 dark:text-green-300 mb-2">{t('eligibility_checker_title')}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{t('eligibility_checker_desc')}</p>
                {user ? (
                    <Button onClick={handleCheckEligibility} disabled={isCheckingEligibility} className="w-full" variant="secondary">
                        {isCheckingEligibility ? t('checking_eligibility') : t('check_my_eligibility')}
                    </Button>
                ) : (
                    <p className="text-sm text-center p-2 bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300 rounded-md">{t('login_for_eligibility')}</p>
                )}
            </Card>

            <Card>
                 <div className="relative mb-4">
                    <input
                        type="text"
                        placeholder={t('search_schemes')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-full shadow-sm focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-gray-200"
                    />
                    <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"></i>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('filter_by_category')}</label>
                    <div className="flex flex-wrap gap-2">
                        <button onClick={() => setSelectedCategory('All')} className={`px-3 py-1 text-sm rounded-full ${selectedCategory === 'All' ? 'bg-green-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}>
                            {t('all_categories')}
                        </button>
                        {allCategories.map(cat => (
                             <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-3 py-1 text-sm rounded-full ${selectedCategory === cat ? 'bg-green-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}>
                                {t(`category_${cat.toLowerCase()}` as any)}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="mt-4">
                    <label htmlFor="state-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('filter_by_state')}</label>
                    <select id="state-filter" value={selectedState} onChange={e => setSelectedState(e.target.value)} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-700 dark:text-gray-200">
                        <option value="All">{t('all_states')}</option>
                        {availableStates.map(state => <option key={state} value={state}>{state === 'Central' ? t('central_schemes') : state}</option>)}
                    </select>
                </div>
                 <div className="mt-4 flex items-center justify-between">
                    <label htmlFor="new-only-toggle" className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('newly_added')}</label>
                    <button onClick={() => setShowNewOnly(!showNewOnly)} className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${showNewOnly ? 'bg-green-600' : 'bg-gray-200 dark:bg-gray-600'}`}>
                        <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${showNewOnly ? 'translate-x-6' : 'translate-x-1'}`}/>
                    </button>
                </div>
            </Card>
        </aside>

        {/* Main Content */}
        <main className="lg:col-span-3 space-y-6">
            {eligibilityChecked && (
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/40 border-l-4 border-yellow-400 dark:border-yellow-500">
                    <h3 className="font-bold text-yellow-800 dark:text-yellow-200">{recommendedSchemes.length} {recommendedSchemes.length === 1 ? 'Scheme' : 'Schemes'} Recommended For You</h3>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">Based on our AI analysis of your profile, these schemes are at the top.</p>
                </div>
            )}
            {sortedAndFilteredSchemes.length > 0 ? (
                sortedAndFilteredSchemes.map(scheme => {
                    const recommendation = recommendedSchemes.find(r => r.schemeId === scheme.id);
                    return (
                        <SchemeCard 
                            key={scheme.id} 
                            scheme={scheme} 
                            onAskAi={handleAskAi}
                            isRecommended={!!recommendation}
                            recommendationReason={recommendation?.reason}
                        />
                    );
                })
            ) : (
                <Card>
                    <p className="text-center text-gray-600 dark:text-gray-400 py-12">No schemes found matching your criteria.</p>
                </Card>
            )}
        </main>
      </div>
      {selectedSchemeForChat && (
        <Modal 
            isOpen={isChatbotModalOpen} 
            onClose={() => setIsChatbotModalOpen(false)}
            hideHeader={true}
        >
            <SchemeChatbotView 
                scheme={selectedSchemeForChat} 
                onBack={() => {
                    setIsChatbotModalOpen(false);
                    setSelectedSchemeForChat(null);
                }} 
            />
        </Modal>
      )}
    </div>
  );
};

export default SchemesView;