import React, { useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import WalletConnect from './components/WalletConnect';
import Home from './pages/Home';
import LeaderBoard from './pages/LeaderBoard';
import Profile from './pages/Profile';
import BankLoans from './pages/BankLoans';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';

const SIDEBAR_PAGES = ['/leaderboard', '/profile', '/loans', '/settings'];

function App() {
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const location = useLocation();
  const showSidebar = SIDEBAR_PAGES.includes(location.pathname);

  return (
    <div className="app-wrapper">
      <Navbar onConnectClick={() => setWalletModalOpen(true)} />

      {showSidebar ? (
        <div className="app-with-sidebar">
          <Sidebar />
          <main className="app-main">
            <Routes>
              <Route path="/leaderboard" element={<LeaderBoard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/loans" element={<BankLoans />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </main>
        </div>
      ) : (
        <main className="app-main">
          <Routes>
            <Route path="/" element={<Home onConnectClick={() => setWalletModalOpen(true)} />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      )}

      <Footer />

      {walletModalOpen && (
        <WalletConnect onClose={() => setWalletModalOpen(false)} />
      )}
    </div>
  );
}

export default App;
