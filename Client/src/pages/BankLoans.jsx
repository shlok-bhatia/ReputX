import React, { useState, useEffect } from 'react';
import { useWalletContext } from '../context/WalletContext';
import { useReputation } from '../hooks/useReputation';
import './BankLoans.css';

const LENDERS = [
  {
    id: 1,
    name: 'Nexo',
    icon: '🔵',
    description: 'Instant crypto credit lines with flexible repayment options.',
    minScore: 400,
    // maxLoan: '5,000 USDC',
    // interest: '7.9%',
    term: 'Flexible'
  },
  {
    id: 2,
    name: 'Crypto.com',
    icon: '🦁',
    description: 'Monetize your crypto assets without selling them.',
    minScore: 550,
    // maxLoan: '25,000 USDC',
    // interest: '5.5%',
    term: '12 Months'
  },
  {
    id: 3,
    name: 'Unchained Capital',
    icon: '⛓️',
    description: 'Collaborative custody bitcoin loans for individuals and businesses.',
    minScore: 700,
    // maxLoan: '100,000 USDC',
    // interest: '4.2%',
    term: '24 Months'
  },
  {
    id: 4,
    name: 'Aave',
    icon: '👻',
    description: 'Decentralized non-custodial liquidity market protocol.',
    minScore: 800,
    // maxLoan: '500,000 USDC',
    // interest: 'Variable',
    term: 'No Fixed Term'
  },
  // {
  //   id: 5,
  //   name: 'MakerDAO',
  //   icon: '🏺',
  //   description: 'Borrow DAI against your crypto collateral globally.',
  //   minScore: 650,
  //   // maxLoan: '50,000 DAI',
  //   // interest: '3.0%',
  //   term: 'Flexible'
  // },
  // {
  //   id: 6,
  //   name: 'Compound',
  //   icon: '☄️',
  //   description: 'Algorithmic, autonomous interest rate protocol built for developers.',
  //   minScore: 750,
  //   // maxLoan: '250,000 USDC',
  //   // interest: '2.5%',
  //   term: 'Flexible'
  // }
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
        {LENDERS.map(lender => {
          const isEligible = actualScore >= lender.minScore;
          
          return (
            <div key={lender.id} className={`bank-card ${isEligible ? 'eligible' : 'ineligible'}`}>
              {!isEligible && (
                <div className="locked-overlay">
                  <div className="locked-icon">🔒</div>
                  <div className="locked-text">
                    Requires ReputX Score of {lender.minScore}+
                  </div>
                </div>
              )}
              
              <div className="bank-icon">{lender.icon}</div>
              <h2 className="bank-name">{lender.name}</h2>
              <p className="bank-description">{lender.description}</p>
              
              <div className="loan-details">
                <div className="detail-row">
                  <span className="detail-label">Max Loan</span>
                  <span className="detail-value highlight">{lender.maxLoan}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Interest Rate</span>
                  <span className="detail-value">{lender.interest}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Max Term</span>
                  <span className="detail-value">{lender.term}</span>
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
