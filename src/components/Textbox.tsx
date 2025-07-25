import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Icon } from "@iconify/react";
import '../styles/styles.css';
import { handleFileImport, getFileTypeDescription } from '../utils/fileHandlers';
import { exportAsDocx } from '../utils/docxExporter';

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

  // Enhanced function to handle multi-format file import
  const importFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      toast.error('No file selected');
      return;
    }

    // Save current text to history before importing
    if (text.trim()) {
      setTextHistory([...textHistory, text]);
    }

    const fileType = getFileTypeDescription(file.name);
    const toastId = toast.loading(`Processing ${fileType}...`);

    try {
      const extractedText = await handleFileImport(file);
      setText(extractedText);
      toast.success(`${fileType} imported successfully!`, { id: toastId });
    } catch (error) {
      console.error('File import error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Failed to import ${fileType}: ${errorMessage}`, { id: toastId });
    } finally {
      // Clear the input so the same file can be selected again
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  // Export function for text files
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

  // Export function for DOCX
  const exportAsDocxFile = async () => {
    try {
      toast.loading('Creating Word document...', { id: 'docx-export' });
      await exportAsDocx(text, 'document.docx');
      toast.success('Word document exported successfully!', { id: 'docx-export' });
    } catch (error) {
      console.error('DOCX export error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Failed to export Word document: ${errorMessage}`, { id: 'docx-export' });
    }
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

  const removeExtraVerticalSpaces = () => {
    // Replace multiple consecutive line breaks with a single line break
    const newText = text.replace(/\n{3,}/g, '\n\n').trim();
    setText(newText);
    toast.success('Extra Vertical Spaces Removed');
  };

  // Simple function to count syllables in a word
  const countSyllables = (word: string): number => {
    word = word.toLowerCase();
    if(word.length <= 3) return 1; // A short word can't have multiple syllables
    word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
    word = word.replace(/^y/, '');
    const matches = word.match(/[aeiouy]{1,2}/g);
    return matches ? matches.length : 0;
  };

  // Function to count total syllables in text
  const getTotalSyllables = (): number => {
    if (!text.trim()) return 0;
    
    const words = text.split(/\s+/).filter(word => word.length > 0);
    return words.reduce((total, word) => total + countSyllables(word), 0);
  };

  // Function to count complex words (3+ syllables)
  const getComplexWords = (): number => {
    if (!text.trim()) return 0;
    
    const words = text.split(/\s+/).filter(word => word.length > 0);
    return words.filter(word => countSyllables(word) >= 3).length;
  };

  // Reliable word counting function
  const getWordCount = (): number => {
    if (!text.trim()) return 0;
    return text.split(/\s+/).filter((element) => element.length !== 0).length;
  };

  // Reliable sentence counting function
  const getSentenceCount = (): number => {
    if (!text.trim()) return 0;
    return text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
  };


  // Average word length calculation
  const getAverageWordLength = (): string => {
    if (!text.trim()) return "0";
    
    const words = text.split(/\s+/).filter(Boolean);
    if (words.length === 0) return "0";
    
    const totalLength = words.reduce((sum, word) => {
      return sum + word.replace(/[^a-zA-Z]/g, '').length;
    }, 0);
    
    return (totalLength / words.length).toFixed(2);
  };

  // Average sentence length calculation
  const getAverageSentenceLength = (): string => {
    if (!text.trim()) return "0 words";
    
    const sentences = getSentenceCount();
    const words = getWordCount();
    
    if (sentences === 0) return "0 words";
    
    const avgLength = words / sentences;
    return `${avgLength.toFixed(2)} words`;
  };

  // Gunning Fog Index calculation using custom implementation
  const getGunningFogIndex = (): string => {
    if (!text.trim()) return "0.0";
    
    const sentences = getSentenceCount();
    const words = getWordCount();
    
    if (sentences === 0 || words === 0) {
      return "0.0";
    }
    
    const avgWordsPerSentence = words / sentences;
    const complexWords = getComplexWords();
    const percentComplexWords = (complexWords / words) * 100;
    
    // Gunning Fog Index formula: 0.4 * (avgWordsPerSentence + percentComplexWords)
    const fogIndex = 0.4 * (avgWordsPerSentence + percentComplexWords);
    
    return fogIndex.toFixed(1);
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
              <button 
                className="btn btn-primary file-btn" 
                aria-label="Import text from TXT, MD, or Word documents"
                title="Supports: TXT, MD, DOCX files"
              >
                <label htmlFor="file-input" style={{ cursor: 'pointer', margin: 0, display: 'flex', alignItems: 'center' }}>
                  <Icon icon="mdi:file-import" className="me-1 file-icon" aria-hidden="true" /> 
                  <span>Import</span>
                </label>
                <input
                  type="file"
                  id="file-input"
                  accept=".txt,.md,.docx,.doc"
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
                  <li><hr className="dropdown-divider"/></li>
                  <li>
                    <button className="dropdown-item" onClick={exportAsDocxFile} disabled={text.length === 0} aria-label="Export as Word document">
                      <Icon icon="mdi:file-word-box" className="me-1 file-icon" width="20" height="20" aria-hidden="true" /> As .docx
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
        
        {/* Group 1: Case Transformation (Desktop: with Utility Actions, Mobile: standalone) */}
        <div className="mb-3">
          <div className="d-flex flex-column flex-lg-row justify-content-between align-items-start align-items-lg-center mb-2">
            <h6 className={`mb-2 mb-lg-0 ${mode === 'dark' ? 'text-light' : 'text-muted'} heading-animated`}>Case Transformation</h6>
            <h6 className={`mb-2 mb-lg-0 d-none d-lg-block ${mode === 'dark' ? 'text-light' : 'text-muted'} heading-animated`}>Utility Actions</h6>
          </div>
          <div className="d-flex flex-column flex-lg-row justify-content-between gap-3">
            {/* Case Transformation buttons */}
            <div className="btn-group format-btn-group flex-wrap">
              <button disabled={text.length === 0} className="btn btn-primary" onClick={upperCase} aria-label="Convert to uppercase">
                <Icon icon="mdi:format-uppercase" className="me-1 file-icon" aria-hidden="true" /> Upper Case
              </button>
              <button disabled={text.length === 0} className="btn btn-primary" onClick={lowerCase} aria-label="Convert to lowercase">
                <Icon icon="mdi:format-lowercase" className="me-1 file-icon" aria-hidden="true" /> Lower Case
              </button>
              <button disabled={text.length === 0} className="btn btn-primary" onClick={sentenceCase} aria-label="Apply sentence case">
                <Icon icon="mdi:format-letter-case" className="me-1 file-icon" aria-hidden="true" /> Sentence Case
              </button>
            </div>
            
            {/* Utility Actions buttons - Desktop only */}
            <div className="btn-group format-btn-group flex-wrap d-none d-lg-flex">
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
        
        {/* Group 2: Text Manipulation */}
        <div className="mb-3">
          <h6 className={`mb-2 ${mode === 'dark' ? 'text-light' : 'text-muted'} heading-animated`}>Text Manipulation</h6>
          <div className="btn-group format-btn-group">
            <button disabled={text.length === 0} className="btn btn-primary" onClick={removeExtraSpaces} aria-label="Remove extra horizontal spaces">
              <Icon icon="mdi:format-horizontal-align-center" className="me-1 file-icon" aria-hidden="true" /> Remove Spaces
            </button>
            <button disabled={text.length === 0} className="btn btn-primary" onClick={removeExtraVerticalSpaces} aria-label="Remove extra vertical spaces">
              <Icon icon="mdi:format-line-spacing" className="me-1 file-icon" aria-hidden="true" /> Remove Vertical Spaces
            </button>
            <button disabled={text.length === 0} className="btn btn-primary" onClick={removePara} aria-label="Make one paragraph">
              <Icon icon="mdi:format-align-justify" className="me-1 file-icon" aria-hidden="true" /> One Paragraph
            </button>
          </div>
          
          <div className="btn-group format-btn-group">
            <button disabled={text.length === 0} className="btn btn-primary" onClick={sortTextLines} aria-label="Sort lines alphabetically">
              <Icon icon="mdi:sort-alphabetical-ascending" className="me-1 file-icon" aria-hidden="true" /> Sort Lines
            </button>
            <button disabled={text.length === 0} className="btn btn-primary" onClick={makeList} aria-label="Create numbered list">
              <Icon icon="mdi:format-list-numbered" className="me-1 file-icon" aria-hidden="true" /> Make List
            </button>
          </div>
        </div>
        
        {/* Group 3: Utility Actions - Mobile only (after Text Manipulation) */}
        <div className="mb-3 d-lg-none">
          <h6 className={`mb-2 ${mode === 'dark' ? 'text-light' : 'text-muted'} heading-animated`}>Utility Actions</h6>
          <div className="btn-group format-btn-group flex-wrap">
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
        
        {/* Grid layout for summary statistics - Organized logically */}
        <div className={`row row-cols-2 row-cols-md-4 g-2 ${mode === 'dark' ? 'dark-mode' : ''}`}>
          {/* Basic Counts - First Row */}
          <div className="col">
            <SummaryCard 
              title="Words" 
              value={getWordCount()} 
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
              value={getSentenceCount()} 
            />
          </div>
          <div className="col">
            <SummaryCard 
              title="Lines" 
              value={text.split('\n').filter(line => line.trim() !== '').length} 
            />
          </div>
          
          {/* Advanced Metrics - Second Row */}
          <div className="col">
            <SummaryCard 
              title="Syllables" 
              value={getTotalSyllables()} 
            />
          </div>
          <div className="col">
            <SummaryCard 
              title="Avg Word Length" 
              value={getAverageWordLength()} 
            />
          </div>
          <div className="col">
            <SummaryCard 
              title="Avg Sentence Length" 
              value={getAverageSentenceLength()} 
            />
          </div>
          <div className="col">
            <SummaryCard 
              title="Gunning Fog Index" 
              value={getGunningFogIndex()} 
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
