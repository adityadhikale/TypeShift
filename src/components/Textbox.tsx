import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Icon } from "@iconify/react";
import '../styles/styles.css';

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

  const capitalise = () => {
    let newText = text.replace(/(?:^|\.\s|\!\s|\?\s|\,\s|\:\s|\;\s)([a-z])/g, (p1) => p1.toUpperCase());
    newText = newText.charAt(0).toUpperCase() + newText.slice(1);
    setText(newText);
    toast.success('Capitalised');
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
          <label className="form-label my-3">{heading}</label>
          {/* Import and Export Buttons */}
          <div>
            <button className="btn btn-secondary mx-1 my-1">
              <label htmlFor="file-input" style={{ cursor: 'pointer' }}>
                <Icon icon="mdi:file-import" className="me-1" width="20" height="20" /> Import .txt
              </label>
              <input
                type="file"
                id="file-input"
                accept=".txt,.md"
                style={{ display: 'none' }}
                onChange={importFile}
              />
            </button>

            <button className="btn btn-secondary mx-1 my-1" onClick={() => exportAsFile('txt')} disabled={text.length === 0}>
              <Icon icon="mdi:file-document" className="me-1" width="20" height="20" /> Export as .txt
            </button>
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
        <h4>Formatting Options</h4>
        <button className="btn btn-primary mx-1 my-1" onClick={capitalise}>
          <Icon icon="mdi:format-letter-case" className="me-1" /> Capitalise
        </button>

        <button className="btn btn-primary mx-1 my-1" onClick={upperCase}>
          <Icon icon="mdi:format-uppercase" className="me-1" /> Upper Case
        </button>

        <button className="btn btn-primary mx-1 my-1" onClick={lowerCase}>
          <Icon icon="mdi:format-lowercase" className="me-1" /> Lower Case
        </button>

        <button className="btn btn-primary mx-1 my-1" onClick={removeExtraSpaces}>
          <Icon icon="mdi:format-horizontal-align-center" className="me-1" /> Remove Extra Spaces
        </button>

        <button className="btn btn-primary mx-1 my-1" onClick={removePara}>
          <Icon icon="mdi:format-align-justify" className="me-1" /> Make one Paragraph
        </button>

        <button className="btn btn-primary mx-1 my-1" onClick={sortTextLines}>
          <Icon icon="mdi:sort-alphabetical-ascending" className="me-1" /> Sort Text Line
        </button>

        <button className="btn btn-primary mx-1 my-1" onClick={makeList}>
          <Icon icon="mdi:format-list-numbered" className="me-1" /> Make List
        </button>

        {/* Copy, Clear, Undo buttons */}
        <button disabled={text.length === 0} className="btn btn-success mx-1 my-1" onClick={copyText}>
          <Icon icon="solar:copy-linear" className="me-1" width="20" height="20" /> Copy
        </button>

        <button disabled={text.length === 0} className="btn btn-danger mx-1 my-1" onClick={clearText}>
          <Icon icon="ri:delete-bin-6-line" className="me-1" width="20" height="20" /> Clear
        </button>

        <button disabled={text.length === 0} className="btn btn-secondary mx-1 my-1" onClick={undo}>
          <Icon icon="ic:round-undo" className="me-1" width="20" height="20" /> Undo
        </button>
      </div>

      {/* Text Summary and Preview */}
      <div className="container" style={{ color: mode === 'dark' ? 'white' : 'black' }}>
        <hr />
        <h4 className="my-3">Your Text Summary</h4>
        <p>
          Words: {text.split(/\s+/).filter((element) => element.length !== 0).length}<br />
          Characters: {text.length}<br />
          Sentences: {text.split(/[.!?]/).filter(Boolean).length}<br />
          Lines: {text.split('\n').filter(line => line.trim() !== '').length}<br />
          Average Word Length: {text.split(/\s+/).filter(Boolean).length ? (text.replace(/\s+/g, '').length / text.split(/\s+/).filter(Boolean).length).toFixed(2) : 0}<br />
          Average Sentence Length: {text.split(/[.!?]/).filter(Boolean).length ? (text.split(/[.!?]/).filter(Boolean).reduce((acc, sentence) => acc + sentence.split(/\s+/).filter(Boolean).length, 0) / text.split(/[.!?]/).filter(Boolean).length).toFixed(2) : 0} words
        </p>

        <hr />
        <h4>Preview</h4>
        <div>
          <p>{text.length > 0 ? text : 'Nothing to preview.'}</p>
        </div>
        <hr />
      </div>
    </>
  );
};

export default Textbox;
