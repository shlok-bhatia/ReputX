import React from 'react';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer" id="app-footer">
      <div className="footer__brand">
        <span className="footer__logo">ReputX</span>
        <span className="footer__copy">© 2024 ReputX. Secured by Decentralized Consensus.</span>
      </div>

      <div className="footer__links">
        <a href="#" className="footer__link">Privacy Protocol</a>
        <a href="#" className="footer__link">Terms of Service</a>
        <a href="#" className="footer__link">Github</a>
        <a href="#" className="footer__link">Discord</a>
      </div>

      <div className="footer__socials">
        <a href="#" className="footer__social-icon" aria-label="Twitter">𝕏</a>
        <a href="#" className="footer__social-icon" aria-label="Discord">⬡</a>
      </div>
    </footer>
  );
}
