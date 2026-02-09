import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useGameStore } from './store/useGameStore';
import MainLayout from './layouts/MainLayout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import AdminPage from './pages/AdminPage';
import CollectionView from './components/CollectionView';
import ExchangeView from './components/ExchangeView';
import ProfileView from './components/ProfileView';

const CollectionPage = () => {
  const { inventory } = useGameStore();
  return <div className="p-4 md:p-8"><CollectionView inventory={inventory} burnItem={() => {}} addToInventory={() => {}} /></div>;
};

const ExchangePage = () => <div className="p-4 md:p-8"><ExchangeView addToInventory={() => {}} /></div>;
const ProfilePage = () => <div className="p-4 md:p-8"><ProfileView onLogin={() => {}} isLoggedIn={true} syncStatus="synced" /></div>;

const App: React.FC = () => {
  const { fetchUserData } = useGameStore();

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="collection" element={<CollectionPage />} />
          <Route path="games" element={<HomePage />} /> 
          <Route path="exchange" element={<ExchangePage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="admin" element={<AdminPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
