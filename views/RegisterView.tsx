
import React, { useState } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { useAuth } from '../hooks/useAuth';
import { Page } from '../types';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';

interface RegisterViewProps {
  navigate: (page: Page) => void;
}

const RegisterView: React.FC<RegisterViewProps> = ({ navigate }) => {
  const { t } = useLocalization();
  const { register } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const success = await register(email, password);
    if (success) {
      navigate('profile');
    } else {
      setError(t('registration_failed'));
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <div className="text-center mb-6">
          <i className="fas fa-user-plus text-5xl text-green-600 mb-2"></i>
          <h2 className="text-3xl font-bold text-green-800">{t('register_title')}</h2>
          <p className="text-gray-600 mt-1">{t('register_desc')}</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <p className="text-red-500 text-sm text-center bg-red-100 p-3 rounded-lg">{error}</p>}
          <Input
            label={t('email_address')}
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label={t('password')}
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
          <Button type="submit" variant="secondary" className="w-full">
            {t('register')}
          </Button>
        </form>
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            {t('already_have_account')}{' '}
            <button onClick={() => navigate('login')} className="font-semibold text-green-600 hover:underline">
              {t('login_now')}
            </button>
          </p>
        </div>
      </Card>
    </div>
  );
};

export default RegisterView;
