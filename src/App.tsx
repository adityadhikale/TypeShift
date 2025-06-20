import React, { useState } from "react";
import toast from "react-hot-toast";

import Navbar from './components/Navbar';
import Textbox from './components/Textbox';
import TosterProvider from "./providers/TosterProvider";
import Footer from "./components/Footer";

// Define types for the mode
type Mode = 'light' | 'dark';

const App: React.FC = () => {
  const [mode, setMode] = useState<Mode>('dark');

  const toggleMode = () => {
    if (mode === 'dark') {
      setMode('light');
      document.body.style.backgroundColor = '#E3E6E6';
      toast.success('Light mode is enabled');
    } else {
      setMode('dark');
      document.body.style.backgroundColor = '#2F3337';
      toast.success('Dark mode is enabled');
    }
  };

  return (
    <>
      <TosterProvider mode={mode} />
      <Navbar title="WildText" mode={mode} toggleMode={toggleMode} />
      <Textbox heading="Enter text below" mode={mode} />
      <Footer mode={mode} />
    </>
  );
};

export default App;
