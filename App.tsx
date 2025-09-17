import React, { useState, useCallback } from 'react';
import HomeView from './views/HomeView';
import CropRecommendationView from './views/CropRecommendationView';
import SchemesView from './views/SchemesView';
import MarketPricesView from './views/MarketPricesView';
import LoginView from './views/LoginView';
import RegisterView from './views/RegisterView';
import ProfileView from './views/ProfileView';
import CommunityView from './views/CommunityView';
import Header from './components/Header';
import Footer from './components/Footer';
import { Page } from './types';
import { useAuth } from './hooks/useAuth';
import Chatbot from './components/Chatbot';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const { user } = useAuth();

  const navigate = useCallback((page: Page) => {
    // If user tries to access profile without being logged in, redirect to login
    if (page === 'profile' && !user) {
      setCurrentPage('login');
      return;
    }
    setCurrentPage(page);
  }, [user]);

  const renderContent = () => {
    switch (currentPage) {
      case 'crop':
        return <CropRecommendationView navigate={navigate} />;
      case 'schemes':
        return <SchemesView navigate={navigate} />;
      case 'market':
        return <MarketPricesView />;
      case 'login':
        return <LoginView navigate={navigate} />;
      case 'register':
        return <RegisterView navigate={navigate} />;
      case 'profile':
        return user ? <ProfileView navigate={navigate} /> : <LoginView navigate={navigate} />;
      case 'community':
        return <CommunityView />;
      case 'home':
      default:
        return <HomeView navigate={navigate} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans text-gray-800 dark:text-gray-200">
      <Header navigate={navigate} currentPage={currentPage} />
      <main className="flex-grow container mx-auto p-4 md:p-6">
        {renderContent()}
      </main>
      <Footer navigate={navigate} />
      <Chatbot />
    </div>
  );
};

export default App;