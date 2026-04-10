import React, { useState, useEffect } from 'react';
import { useWalletContext } from '../context/WalletContext';
import { useReputation } from '../hooks/useReputation';
import './BankLoans.css';

const BANKS = [
  {
    id: 1,
    name: 'StellarBank',
    icon: '🏦',
    description: 'A global leader in decentralized finance offering flexible terms.',
    minScore: 400,
    maxLoan: '5,000 USDC',
    interest: '8.5%',
    term: '12 Months'
  },
  {
    id: 2,
    name: 'Nexus Trust',
    icon: '🏛️',
    description: 'Premium lending for established reputation profiles.',
    minScore: 600,
    maxLoan: '25,000 USDC',
    interest: '5.2%',
    term: '24 Months'
  },
  {
    id: 3,
    name: 'Quantum Finance',
    icon: '💳',
    description: 'Algorithmically optimized loans for high-trust users.',
    minScore: 750,
    maxLoan: '100,000 USDC',
    interest: '3.8%',
    term: '36 Months'
  },
  {
    id: 4,
    name: 'Aegis Vault',
    icon: '🛡️',
    description: 'Exclusive, institutional-grade capital access.',
    minScore: 900,
    maxLoan: '500,000 USDC',
    interest: '2.1%',
    term: '60 Months'
  },
  {
    id: 5,
    name: 'Nova Credit',
    icon: '🚀',
    description: 'Fast-track short-term loans with competitive rates.',
    minScore: 500,
    maxLoan: '15,000 USDC',
    interest: '6.5%',
    term: '6 Months'
  },
  {
    id: 6,
    name: 'Vertex Capital',
    icon: '⛰️',
    description: 'Scaling your financial power with apex reputation rewards.',
    minScore: 820,
    maxLoan: '250,000 USDC',
    interest: '2.9%',
    term: '48 Months'
  }
];

export default function BankLoans() {
  const { walletAddress } = useWalletContext();
  const { data: repData, loading } = useReputation(walletAddress);

  // Animated score display
  const [displayScore, setDisplayScore] = useState(0);
  const actualScore = repData?.score || 785; // fallback score when not connected

  useEffect(() => {
    let start = 0;
    const target = actualScore;
    const duration = 1500;
    const increment = target / (duration / 16);

    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setDisplayScore(target);
        clearInterval(timer);
      } else {
        setDisplayScore(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [actualScore]);

  return (
    <div className="loans-container">
      <header className="loans-header">
        <h1>Reputation-Backed Loans</h1>
        <p>Unlock exclusive financial opportunities. Your high reputation score grants you access to premium lending rates from our partnered institutions.</p>
      </header>

      <div className="user-score-section">
        <span className="score-label">Your Current ReputX Score:</span>
        <span className="score-value">{displayScore}</span>
        {loading && <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginLeft: 8 }}>Fetching...</span>}
      </div>

      <div className="loans-grid">
        {BANKS.map(bank => {
          const isEligible = actualScore >= bank.minScore;
          
          return (
            <div key={bank.id} className={`bank-card ${isEligible ? 'eligible' : 'ineligible'}`}>
              {!isEligible && (
                <div className="locked-overlay">
                  <div className="locked-icon">🔒</div>
                  <div className="locked-text">
                    Requires ReputX Score of {bank.minScore}+
                  </div>
                </div>
              )}
              
              <div className="bank-icon">{bank.icon}</div>
              <h2 className="bank-name">{bank.name}</h2>
              <p className="bank-description">{bank.description}</p>
              
              <div className="loan-details">
                <div className="detail-row">
                  <span className="detail-label">Max Loan</span>
                  <span className="detail-value highlight">{bank.maxLoan}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Interest Rate</span>
                  <span className="detail-value">{bank.interest}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Max Term</span>
                  <span className="detail-value">{bank.term}</span>
                </div>
              </div>

              <button 
                className={`apply-btn ${isEligible ? 'eligible' : 'locked'}`}
                disabled={!isEligible}
              >
                {isEligible ? 'Apply Now' : 'Locked'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
