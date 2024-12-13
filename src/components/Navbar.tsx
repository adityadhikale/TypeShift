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
    <nav className={`navbar navbar-expand-lg navbar-${mode} bg-${mode}`}>
      <div className="container-fluid" style={{ width: '86%' }}>
        <a className="navbar-brand" href="/">
          <img src={logo} alt="logo" className='logo' />
          {title}
        </a>
        <button 
          className="navbar-toggler" 
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
            className={`btn mx-1 ${mode === 'dark' ? 'btn-dark' : 'btn-light'}`} 
            onClick={toggleMode}>
            {mode === 'dark' ? (
              <Icon icon="material-symbols:light-mode-outline" style={{ color: 'white', height: '28px', width: '20px' }} />
            ) : (
              <Icon icon="tdesign:mode-dark" style={{ color: 'black', height: '28px', width: '20px' }} />
            )}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
