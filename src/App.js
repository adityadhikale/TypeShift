
import React from "react";
import { useState } from 'react';
import toast from "react-hot-toast";

import './App.css';
import './App.css';
import Navbar from './components/Navbar';
import Textbox from './components/Textbox';
import TosterProvider from "./providers/TosterProvider";

function App() {
  const [mode, setmode] = useState('dark');

  const toggelmode = () => {
    if (mode === 'dark') {
      setmode('light');
      document.body.style.backgroundColor = '#E3E6E6'
      toast.success('Light mode is Enable');
    }
    else {
      setmode('dark')
      document.body.style.backgroundColor = '#2F3337'
      toast.success('Dark mode is Enable');
    }
  }

  return (
    <>
    <TosterProvider/>
      <Navbar title='WildText' mode={mode} toggelmode={toggelmode} />
      <Textbox heading='Enter text below' mode={mode}  />
    </>
  );
}

export default App;
