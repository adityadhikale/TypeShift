import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Icon } from "@iconify/react";
import '../styles/styles.css';

// Summary Card Component
interface SummaryCardProps {
  title: string;
  value: string | number;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ title, value }) => {
  return (
    <div className={`summary-card`}>
      <h6>{title}</h6>
      <p className="mb-0 fw-bold fs-6">{value}</p> {/* Reduced font size from fs-5 to fs-6 */}
    </div>
  );
};

// Define the types for props
interface TextboxProps {
  heading: string;
  mode: 'light' | 'dark';
}

const Textbox: React.FC<TextboxProps> = ({ heading, mode }) => {
  const [text, setText] = useState<string>('');
  const [textHistory, setTextHistory] = useState<string[]>([]);

  // Function to handle file import
  const importFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const fileContent = reader.result as string;
        setText(fileContent);
        toast.success('File Imported Successfully');
      };
      reader.readAsText(file);
    } else {
      toast.error('No file selected');
    }
  };

  // Export function (as before)
  const exportAsFile = (fileType: 'txt' | 'md') => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;

    if (fileType === 'txt') {
      link.download = 'textfile.txt';
    } else if (fileType === 'md') {
      link.download = 'textfile.md';
    }

    link.click();
    URL.revokeObjectURL(url); // Clean up the object URL after download
  };

  // Undo function
  const undo = () => {
    if (textHistory.length > 0) {
      const previousText = textHistory[textHistory.length - 1];
      const newTextHistory = textHistory.slice(0, -1);
      setText(previousText);
      setTextHistory(newTextHistory);
      toast.success('Undo successful');
    } else {
      toast.error('Nothing to undo');
    }
  };

  // Text transformation functions (Uppercase, Lowercase, etc.)
  const upperCase = () => {
    const newText = text.toUpperCase();
    setText(newText);
    toast.success('Converted to Uppercase');
  };

  const lowerCase = () => {
    const newText = text.toLowerCase();
    setText(newText);
    toast.success('Converted to Lowercase');
  };

  const sentenceCase = () => {
    let newText = text.replace(/(?:^|\.\s|\!\s|\?\s|\,\s|\:\s|\;\s)([a-z])/g, (p1) => p1.toUpperCase());
    newText = newText.charAt(0).toUpperCase() + newText.slice(1);
    setText(newText);
    toast.success('Applied Sentence Case');
  };

  const clearText = () => {
    setText('');
    toast.success('Text Cleared');
  };

  const copyText = () => {
    navigator.clipboard.writeText(text);
    toast.success('Text Copied to Clipboard');
  };

  const removeExtraSpaces = () => {
    const newText = text.replace(/ +/g, ' ');
    setText(newText.trim());
    toast.success('Extra Spaces Removed');
  };

  const removePara = () => {
    const newText = text.replace(/\s+/g, ' ').trim();
    setText(newText.trim());
    toast.success('Only one Paragraph Removed');
  };

  const sortTextLines = () => {
    const newText = text.split('\n').sort().join('\n');
    setText(newText.trim());
    toast.success('Text is Sorted');
  };

  const makeList = () => {
    if (text.trim().length === 0) {
      toast.error("No text to make a list");
      return;
    }

    const lines = text.split('\n').filter(line => line.trim() !== '');
    const numberedList = lines.map((line, index) => `${index + 1}. ${line.trim()}`).join('\n');
    setText(numberedList);
    toast.success('List Created');
  };

  return (
    <>
      {/* Container for Import/Export buttons */}
      <div className="container my-1" style={{ color: mode === 'dark' ? 'white' : 'black' }}>
        {/* Import and Export Buttons */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-3">
          <label className="form-label my-3 heading-animated">{heading}</label>
          
          {/* File Operations Group */}
          <div className="mb-3">
            <h6 className={`mb-2 ${mode === 'dark' ? 'text-light' : 'text-muted'} heading-animated`}>File Operations</h6>
            <div className="file-operations-group">
              {/* Import Button */}
              <button className="btn btn-primary file-btn" aria-label="Import text file">
                <label htmlFor="file-input" style={{ cursor: 'pointer', margin: 0, display: 'flex', alignItems: 'center' }}>
                  <Icon icon="mdi:file-import" className="me-1 file-icon" width="20" height="20" aria-hidden="true" /> 
                  <span>Import</span>
                </label>
                <input
                  type="file"
                  id="file-input"
                  accept=".txt,.md"
                  style={{ display: 'none' }}
                  onChange={importFile}
                />
              </button>
              
              {/* Export Button */}
              <div className="dropdown file-btn-container">
                <button 
                  className="btn btn-primary file-btn dropdown-toggle" 
                  type="button" 
                  id="exportDropdown" 
                  data-bs-toggle="dropdown" 
                  aria-expanded="false"
                  disabled={text.length === 0}
                  aria-label="Export text file options"
                >
                  <Icon icon="mdi:file-export" className="me-1 file-icon" width="20" height="20" aria-hidden="true" /> 
                  <span>Export</span>
                </button>
                <ul className="dropdown-menu" aria-labelledby="exportDropdown">
                  <li>
                    <button className="dropdown-item" onClick={() => exportAsFile('txt')} disabled={text.length === 0} aria-label="Export as text file">
                      <Icon icon="mdi:file-document" className="me-1 file-icon" width="20" height="20" aria-hidden="true" /> As .txt
                    </button>
                  </li>
                  <li>
                    <button className="dropdown-item" onClick={() => exportAsFile('md')} disabled={text.length === 0} aria-label="Export as markdown file">
                      <Icon icon="mdi:language-markdown" className="me-1 file-icon" width="20" height="20" aria-hidden="true" /> As .md
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="mb-3">
          <textarea
            className={`form-control ${mode === 'dark' ? 'text-white' : 'text-black'}`}
            id="textBox"
            rows={10}
            placeholder="Type or Paste your text..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            style={{ backgroundColor: mode === 'dark' ? '#74747400' : 'white', color: mode === 'dark' ? 'white' : 'black' }}
          />
        </div>

        {/* Formatting Options */}
        <h4 className="mb-3 heading-animated">Formatting Options</h4>
        
        {/* Group 1: Case Transformation */}
        <div className="mb-3">
          <h6 className={`mb-2 ${mode === 'dark' ? 'text-light' : 'text-muted'} heading-animated`}>Case Transformation</h6>
          <div className="btn-group format-btn-group">
            <button className="btn btn-primary" onClick={upperCase} aria-label="Convert to uppercase">
              <Icon icon="mdi:format-uppercase" className="me-1 file-icon" aria-hidden="true" /> Upper Case
            </button>
            <button className="btn btn-primary" onClick={lowerCase} aria-label="Convert to lowercase">
              <Icon icon="mdi:format-lowercase" className="me-1 file-icon" aria-hidden="true" /> Lower Case
            </button>
            <button className="btn btn-primary" onClick={sentenceCase} aria-label="Apply sentence case">
              <Icon icon="mdi:format-letter-case" className="me-1 file-icon" aria-hidden="true" /> Sentence Case
            </button>
          </div>
        </div>
        
        {/* Group 2: Text Manipulation */}
        <div className="mb-3">
          <h6 className={`mb-2 ${mode === 'dark' ? 'text-light' : 'text-muted'} heading-animated`}>Text Manipulation</h6>
          <div className="btn-group format-btn-group">
            <button className="btn btn-primary" onClick={removeExtraSpaces} aria-label="Remove extra spaces">
              <Icon icon="mdi:format-horizontal-align-center" className="me-1 file-icon" aria-hidden="true" /> Remove Spaces
            </button>
            <button className="btn btn-primary" onClick={removePara} aria-label="Make one paragraph">
              <Icon icon="mdi:format-align-justify" className="me-1 file-icon" aria-hidden="true" /> One Paragraph
            </button>
          </div>
          
          <div className="btn-group format-btn-group">
            <button className="btn btn-primary" onClick={sortTextLines} aria-label="Sort lines alphabetically">
              <Icon icon="mdi:sort-alphabetical-ascending" className="me-1 file-icon" aria-hidden="true" /> Sort Lines
            </button>
            <button className="btn btn-primary" onClick={makeList} aria-label="Create numbered list">
              <Icon icon="mdi:format-list-numbered" className="me-1 file-icon" aria-hidden="true" /> Make List
            </button>
          </div>
        </div>
        
        {/* Group 3: Utility Actions */}
        <div className="mb-3">
          <h6 className={`mb-2 ${mode === 'dark' ? 'text-light' : 'text-muted'} heading-animated`}>Utility Actions</h6>
          <div className="btn-group format-btn-group">
            <button disabled={text.length === 0} className="btn btn-success" onClick={copyText} aria-label="Copy text">
              <Icon icon="solar:copy-linear" className="me-1 file-icon" width="20" height="20" aria-hidden="true" /> Copy
            </button>
            <button disabled={text.length === 0} className="btn btn-danger" onClick={clearText} aria-label="Clear text">
              <Icon icon="ri:delete-bin-6-line" className="me-1 file-icon" width="20" height="20" aria-hidden="true" /> Clear
            </button>
            <button disabled={text.length === 0} className="btn btn-secondary" onClick={undo} aria-label="Undo last action">
              <Icon icon="ic:round-undo" className="me-1 file-icon" width="20" height="20" aria-hidden="true" /> Undo
            </button>
          </div>
        </div>
      </div>

      {/* Text Summary and Preview */}
      <div className="container" style={{ color: mode === 'dark' ? 'white' : 'black' }}>
        <hr />
        <h4 className="my-3 heading-animated">Your Text Summary</h4>
        
        {/* Grid layout for summary statistics */}
        <div className={`row row-cols-2 row-cols-md-3 g-2 ${mode === 'dark' ? 'dark-mode' : ''}`}>
          <div className="col">
            <SummaryCard 
              title="Words" 
              value={text.split(/\s+/).filter((element) => element.length !== 0).length} 
            />
          </div>
          <div className="col">
            <SummaryCard 
              title="Characters" 
              value={text.length} 
            />
          </div>
          <div className="col">
            <SummaryCard 
              title="Sentences" 
              value={text.split(/[.!?]/).filter(Boolean).length} 
            />
          </div>
          <div className="col">
            <SummaryCard 
              title="Lines" 
              value={text.split('\n').filter(line => line.trim() !== '').length} 
            />
          </div>
          <div className="col">
            <SummaryCard 
              title="Avg Word Length" 
              value={text.split(/\s+/).filter(Boolean).length ? 
                (text.replace(/\s+/g, '').length / text.split(/\s+/).filter(Boolean).length).toFixed(2) : 
                "0"} 
            />
          </div>
          <div className="col">
            <SummaryCard 
              title="Avg Sentence Length" 
              value={text.split(/[.!?]/).filter(Boolean).length ? 
                (text.split(/[.!?]/).filter(Boolean).reduce((acc, sentence) => acc + sentence.split(/\s+/).filter(Boolean).length, 0) / text.split(/[.!?]/).filter(Boolean).length).toFixed(2) + " words" : 
                "0 words"} 
            />
          </div>
        </div>

        <hr className="my-4" />
        <h4 className="mb-3 heading-animated">Preview</h4>
        <div className={`preview-container ${mode === 'dark' ? 'dark-mode' : ''}`}>
          {text.length > 0 ? text : 'Nothing to preview.'}
        </div>
        <hr className="my-4" />
      </div>
    </>
  );
};

export default Textbox;
