
import React, { useState, useEffect } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { useAuth } from '../hooks/useAuth';
import { User, Page } from '../types';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';

interface ProfileViewProps {
  navigate: (page: Page) => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ navigate }) => {
  const { t } = useLocalization();
  const { user, updateProfile, logout } = useAuth();
  const [profileData, setProfileData] = useState<User | null>(user);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    setProfileData(user);
  }, [user]);

  if (!profileData) {
    return <div className="text-center">{t('login_desc')}</div>;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => prev ? { ...prev, [name]: value } : null);
  };

  const handleLogout = () => {
    logout();
    navigate('home');
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (profileData) {
      updateProfile(profileData);
      setSuccessMessage(t('profile_saved'));
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h2 className="text-4xl font-extrabold text-green-800 dark:text-green-300">{t('profile_title')}</h2>
        <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">{t('profile_desc')}</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-8">
          {successMessage && <div className="p-3 bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 rounded-lg text-center">{successMessage}</div>}

          {/* Personal Details */}
          <div>
            <h3 className="text-2xl font-bold text-green-700 dark:text-green-300 border-b-2 border-green-200 dark:border-green-800 pb-2 mb-4">{t('personal_details')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Input label={t('full_name')} id="name" name="name" type="text" value={profileData.name} onChange={handleChange} />
              <Input label={t('age')} id="age" name="age" type="number" value={profileData.age} onChange={handleChange} />
              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('gender')}</label>
                <select id="gender" name="gender" value={profileData.gender} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-gray-200">
                  <option value="">{t('select_gender')}</option>
                  <option value="male">{t('male')}</option>
                  <option value="female">{t('female')}</option>
                  <option value="other">{t('other')}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Farm Details */}
          <div>
            <h3 className="text-2xl font-bold text-green-700 dark:text-green-300 border-b-2 border-green-200 dark:border-green-800 pb-2 mb-4">{t('farm_details')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                 <Input label={t('land_size')} id="landSize" name="landSize" type="number" step="0.1" value={profileData.landSize} onChange={handleChange} />
                 <Input label={t('soil_type')} id="soilType" name="soilType" type="text" value={profileData.soilType} onChange={handleChange} />
                 <Input label={t('irrigation_method')} id="irrigationMethod" name="irrigationMethod" type="text" value={profileData.irrigationMethod} onChange={handleChange} />
                 <Input label={t('usual_crops')} id="usualCrops" name="usualCrops" type="text" value={profileData.usualCrops} onChange={handleChange} />
                 <Input label={t('state')} id="state" name="state" type="text" value={profileData.state} onChange={handleChange} />
                 <Input label={t('district')} id="district" name="district" type="text" value={profileData.district} onChange={handleChange} />
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center pt-4 border-t border-gray-100 dark:border-gray-700">
             <Button type="button" onClick={handleLogout} className="bg-red-600 text-white hover:bg-red-700 w-full md:w-auto mb-4 md:mb-0">
                {t('logout')}
            </Button>
            <Button type="submit" variant="secondary" className="w-full md:w-auto">
              {t('save_profile')}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default ProfileView;