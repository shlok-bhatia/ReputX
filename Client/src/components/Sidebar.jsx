// import React from 'react';
// import { useLocation, useState,Link } from 'react-router-dom';
// import './Slidebar.css';

// const NAV_ITEMS = [
//   { icon: '⚙️', label: 'Identity',      path: '/profile' },
//   { icon: '🏦', label: 'Loans',         path: '/loans' },
//   { icon: '⚙️', label: 'Settings',      path: '/settings' },
// ];

// export default function Sidebar() {
//   const location = useLocation();
//   const[emailModal,setEmailModal]=useState()

//   return (
//     <aside className="sidebar" id="app-sidebar">
//       {/* Vault access header */}
//       <div className="sidebar__vault-access">
//         <div className="sidebar__vault-icon">🛡️</div>
//         <div className="sidebar__vault-info">
//           <span className="sidebar__vault-title">Vault Access</span>
//           <span className="sidebar__vault-tier">Level 4</span>
//         </div>
//       </div>

//       {/* Nav */}
//       <nav className="sidebar__nav">
//         {NAV_ITEMS.map(({ icon, label, path }) => (
//           <Link
//             key={label}
//             to={path}
//             className={`sidebar__nav-item${location.pathname === path ? ' active' : ''}`}
//           >
//             <span className="sidebar__nav-icon">{icon}</span>
//             {label}
//           </Link>
//         ))}
//       </nav>

     
//       <div className="sidebar__bottom">
//         {/* <button className="sidebar__upgrade">Upgrade Tier</button> */}
//         <div className="sidebar__support">
//           <span>❓</span>
//           Support
//         </div>
//       </div>
//     </aside>
//   );
// }

import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import './Slidebar.css';

const NAV_ITEMS = [
  { icon: '⚙️', label: 'Identity', path: '/profile' },
  { icon: '🏦', label: 'Loans', path: '/loans' },
  { icon: '⚙️', label: 'Settings', path: '/settings' },
];

export default function Sidebar() {
  const location = useLocation();
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <aside className="sidebar">
        {/* Vault */}
        <div className="sidebar__vault-access">
          <div className="sidebar__vault-icon">🛡️</div>
          <div className="sidebar__vault-info">
            <span className="sidebar__vault-title">Vault Access</span>
            <span className="sidebar__vault-tier">Level 4</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="sidebar__nav">
          {NAV_ITEMS.map(({ icon, label, path }) => (
            <Link
              key={label}
              to={path}
              className={`sidebar__nav-item ${
                location.pathname === path ? 'active' : ''
              }`}
            >
              <span className="sidebar__nav-icon">{icon}</span>
              {label}
            </Link>
          ))}
        </nav>

        {/* Bottom */}
        <div className="sidebar__bottom">
          <div
            className="sidebar__support"
            onClick={() => setShowModal(true)}
          >
            <span>❓</span>
            Support
          </div>
        </div>
      </aside>

      {/* 🔥 SUPPORT MODAL */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div
            className="modal-box"
            onClick={(e) => e.stopPropagation()}
          >
            <h2>Support</h2>
            <p>If you have any issues, contact us:</p>

            <a
              href="mailto:yourgmail@gmail.com"
              className="support-email"
            >
              aalsicodersservices@gmail.com
            </a>

            <button
              className="close-btn"
              onClick={() => setShowModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
