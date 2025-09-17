import React, { useState } from 'react';
import { Scheme } from '../types';
import { useLocalization } from '../hooks/useLocalization';
import Card from './Card';
import Button from './Button';

interface SchemeCardProps {
  scheme: Scheme;
  onAskAi: (scheme: Scheme) => void;
  isRecommended?: boolean;
  recommendationReason?: string;
}

const SchemeCard: React.FC<SchemeCardProps> = ({ scheme, onAskAi, isRecommended, recommendationReason }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { t, language } = useLocalization();

  const getLang = (field: any) => field[language] || field['en'];

  return (
    <Card className={`border-l-8 ${isRecommended ? 'border-yellow-400 bg-yellow-50/50 dark:bg-yellow-900/20' : 'border-green-500'} transition-all duration-300`}>
      {isRecommended && (
        <div className="mb-3">
          <p className="text-sm font-bold text-yellow-700 dark:text-yellow-300"><i className="fas fa-star mr-2"></i>{t('recommended_for_you')}</p>
          <p className="text-xs text-yellow-600 dark:text-yellow-400 pl-5">{recommendationReason}</p>
        </div>
      )}
      <div className="flex flex-col sm:flex-row justify-between sm:items-start">
        <div className='flex-grow'>
            <h3 className="text-xl font-bold text-green-800 dark:text-green-300 pr-4">{getLang(scheme.title)}</h3>
             <div className="flex flex-wrap gap-2 mt-2">
                {scheme.isNew && <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-200 dark:bg-yellow-800/70 text-yellow-800 dark:text-yellow-200">{t('newly_added')}</span>}
                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 dark:bg-green-900/70 text-green-800 dark:text-green-200 flex items-center gap-1"><i className="fas fa-tags"></i>{scheme.category}</span>
                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 dark:bg-blue-900/70 text-blue-800 dark:text-blue-200 flex items-center gap-1"><i className="fas fa-map-marker-alt"></i>{scheme.state === 'Central' ? t('central_schemes') : scheme.state}</span>
            </div>
        </div>
        {scheme.keyBenefit && (
            <div className="flex-shrink-0 mt-2 sm:mt-0 text-right">
                <p className="font-bold text-green-700 dark:text-green-400">{getLang(scheme.keyBenefit)}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Key Benefit</p>
            </div>
        )}
      </div>
      <p className="text-gray-600 dark:text-gray-400 mt-3 text-sm">{getLang(scheme.summary)}</p>
      
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
          <div>
            <h4 className="font-semibold text-gray-800 dark:text-gray-200">{t('benefits')}:</h4>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 text-sm pl-4">
              {scheme.benefits.map((benefit, index) => <li key={index}>{getLang(benefit)}</li>)}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-800 dark:text-gray-200">{t('eligibility')}:</h4>
            <p className="text-gray-600 dark:text-gray-400 text-sm">{getLang(scheme.eligibility)}</p>
          </div>
           <div>
            <h4 className="font-semibold text-gray-800 dark:text-gray-200">{t('documents_required')}:</h4>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 text-sm pl-4">
              {scheme.documents.map((doc, index) => <li key={index}>{getLang(doc)}</li>)}
            </ul>
          </div>
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-4 items-center justify-between">
        <button onClick={() => setIsExpanded(!isExpanded)} className="text-sm font-bold text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300">
          {isExpanded ? t('less_details') : t('more_details')} <i className={`fas fa-chevron-${isExpanded ? 'up' : 'down'} ml-1`}></i>
        </button>
        <div className="flex gap-4">
            <Button onClick={() => onAskAi(scheme)} variant="primary" className="px-3 py-1.5 text-sm">
                <i className="fas fa-robot mr-2"></i>{t('ask_ai_about_scheme')}
            </Button>
            <a href={scheme.applyLink} target="_blank" rel="noopener noreferrer" className="px-4 py-2 text-sm font-bold rounded-lg shadow-md hover:shadow-lg transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 flex items-center justify-center space-x-2 bg-green-600 text-white hover:bg-green-700 focus:ring-green-600">
                <i className="fas fa-external-link-alt mr-2"></i>{t('apply_now')}
            </a>
        </div>
      </div>
    </Card>
  );
};

export default SchemeCard;