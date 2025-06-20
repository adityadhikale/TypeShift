import React from 'react';
import { Icon } from "@iconify/react";
import logo from '../images/logo.png';

// Define types for the props
interface NavbarProps {
  title: string;
  mode: 'dark' | 'light';
  toggleMode: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ title, mode, toggleMode }) => {
  return (
    <nav className={`navbar navbar-expand-lg navbar-${mode} bg-${mode}`} id="main-navbar">
      <div className="container-fluid" style={{ width: '86%' }}>
        <a className="navbar-brand logo-hover" href="/" aria-label="WildText Home">
          <img src={logo} alt="WildText logo" className='logo' />
          <span className="brand-text">{title}</span>
        </a>
        <button 
          className="navbar-toggler custom-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav" 
          aria-controls="navbarNav" 
          aria-expanded="false" 
          aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
      </div>
      <div className="collapse navbar-collapse" id="navbarNav">
        <div className={`form-check form-switch toggle-btn container-fluid text-${mode === 'dark' ? 'light' : 'dark'}`}>
          <button 
            type="button" 
            className={`btn mx-1 theme-toggle-btn ${mode === 'dark' ? 'btn-dark' : 'btn-light'}`} 
            onClick={toggleMode}
            aria-label={`Switch to ${mode === 'dark' ? 'light' : 'dark'} mode`}
            title={`Toggle ${mode === 'dark' ? 'light' : 'dark'} mode`}>
            {mode === 'dark' ? (
              <Icon 
                icon="material-symbols:light-mode-outline" 
                className="theme-icon" 
                aria-hidden="true" 
              />
            ) : (
              <Icon 
                icon="tdesign:mode-dark" 
                className="theme-icon" 
                aria-hidden="true" 
              />
            )}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
