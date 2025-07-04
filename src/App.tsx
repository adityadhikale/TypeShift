import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";

import Navbar from './components/Navbar';
import Textbox from './components/Textbox';
import TosterProvider from "./providers/TosterProvider";
import Footer from "./components/Footer";

// Define types for the mode
type Mode = 'light' | 'dark';

const App: React.FC = () => {
  // Function to get system theme
  const getSystemTheme = (): Mode => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  };

  // Initialize with system theme, but check localStorage for user preference
  const [mode, setMode] = useState<Mode>(() => {
    const savedMode = localStorage.getItem('theme-mode') as Mode;
    if (savedMode) {
      return savedMode;
    }
    return getSystemTheme();
  });

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      // Only update if user hasn't manually set a preference
      if (!localStorage.getItem('theme-mode')) {
        const newMode = e.matches ? 'dark' : 'light';
        setMode(newMode);
        updateBodyStyle(newMode);
        toast.success(`System theme changed to ${newMode} mode`);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    
    // Set initial body style
    updateBodyStyle(mode);
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Function to update body style
  const updateBodyStyle = (currentMode: Mode) => {
    document.body.style.backgroundColor = currentMode === 'dark' ? '#2F3337' : '#E3E6E6';
  };

  // Save mode to localStorage when it changes
  useEffect(() => {
    updateBodyStyle(mode);
  }, [mode]);

  const toggleMode = () => {
    const newMode = mode === 'dark' ? 'light' : 'dark';
    setMode(newMode);
    
    // Save user preference to localStorage
    localStorage.setItem('theme-mode', newMode);
    
    updateBodyStyle(newMode);
    toast.success(`${newMode === 'light' ? 'Light' : 'Dark'} mode is enabled`);
  };

  return (
    <>
      <TosterProvider mode={mode} />
      <Navbar title="TypeShift" mode={mode} toggleMode={toggleMode} />
      <Textbox heading="Enter text below" mode={mode} />
      <Footer mode={mode} />
    </>
  );
};

export default App;
