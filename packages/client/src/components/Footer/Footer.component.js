import React from 'react';
import { NavLink } from 'react-router-dom';
import './Footer.styles.css';
import { Support } from '../Support/Support.component';

export const Footer = () => {
  return (
    <div className="footer">
      <Support />
      <div className="menu">
        <ul>
          <li>
            <NavLink to="/faq" className="nav-link">
              FAQ
            </NavLink>
          </li>
        </ul>
      </div>
      <span>&copy;2025</span>
    </div>
  );
};
