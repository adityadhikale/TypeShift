import React, { useState, useEffect, useRef, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Icon } from "@iconify/react";
import '../styles/styles.css';
import { handleFileImport, getFileTypeDescription } from '../utils/fileHandlers';
import { exportAsDocx } from '../utils/docxExporter';
import { exportAsPdf } from '../utils/pdfExporter';

const MIN_FONT_SIZE = 8;
const MAX_FONT_SIZE = 200;
const DEFAULT_FONT_SIZE = 16;
const FONT_SIZE_PRESETS = [12, 14, 16, 18, 20, 24, 28, 32, 48, 64, 72];
const clampFontSize = (n: number) => Math.min(MAX_FONT_SIZE, Math.max(MIN_FONT_SIZE, Math.round(n)));

const loadStyle = () => {
  try {
    const saved = JSON.parse(localStorage.getItem('typeshift-text-style') || '{}');
    return {
      bold: saved.bold === true,
      italic: saved.italic === true,
      fontSize: typeof saved.fontSize === 'number' ? clampFontSize(saved.fontSize) : DEFAULT_FONT_SIZE,
    };
  } catch {
    return { bold: false, italic: false, fontSize: DEFAULT_FONT_SIZE };
  }
};

// Summary Card Component
interface SummaryCardProps {
  title: string;
  value: string | number;
}

const SummaryCard: React.FC<SummaryCardProps> = React.memo(({ title, value }) => {
  return (
    <div className={`summary-card`}>
      <h6>{title}</h6>
      <p className="mb-0 fw-bold fs-6">{value}</p>
    </div>
  );
});

// Define the types for props
interface TextboxProps {
  heading: string;
  mode: 'light' | 'dark';
}

const Textbox: React.FC<TextboxProps> = ({ heading, mode }) => {
  const [text, setText] = useState<string>(() => {
    return localStorage.getItem('typeshift-autosave') || '';
  });
  const [undoStack, setUndoStack] = useState<string[]>([]);
  const [redoStack, setRedoStack] = useState<string[]>([]);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showFindReplace, setShowFindReplace] = useState(false);
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [textStyle, setTextStyle] = useState(loadStyle);
  const [textAnalytics, setTextAnalytics] = useState({
    wordCount: 0,
    sentenceCount: 0,
    totalSyllables: 0,
    averageWordLength: "0",
    averageSentenceLength: "0 words",
    gunningFogIndex: "0.0",
    lineCount: 0,
    readingTime: "0 min",
    paragraphCount: 0,
    uniqueWordCount: 0,
    speakingTime: "0 min",
  });
  const workerRef = useRef<Worker | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Web Worker for text analytics
  useEffect(() => {
    workerRef.current = new Worker(
      new URL('../workers/textAnalytics.worker.ts', import.meta.url),
      { type: 'module' }
    );
    workerRef.current.onmessage = (e: MessageEvent) => {
      setTextAnalytics(e.data);
    };
    return () => workerRef.current?.terminate();
  }, []);

  // Debounced worker call (300ms delay)
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      workerRef.current?.postMessage(text);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [text]);

  // Autosave to localStorage
  useEffect(() => {
    localStorage.setItem('typeshift-autosave', text);
  }, [text]);

  // Persist text style (bold / italic / font size)
  useEffect(() => {
    localStorage.setItem('typeshift-text-style', JSON.stringify(textStyle));
  }, [textStyle]);

  const toggleBold = useCallback(() => setTextStyle(prev => ({ ...prev, bold: !prev.bold })), []);
  const toggleItalic = useCallback(() => setTextStyle(prev => ({ ...prev, italic: !prev.italic })), []);
  const changeFontSize = (fontSize: number) => setTextStyle(prev => ({ ...prev, fontSize: clampFontSize(fontSize) }));
  const resetStyle = () => setTextStyle({ bold: false, italic: false, fontSize: DEFAULT_FONT_SIZE });

  // Draft lets the user clear/retype the size field; it is clamped and committed on blur
  const [sizeDraft, setSizeDraft] = useState<string | null>(null);
  const commitSizeDraft = () => {
    if (sizeDraft !== null) {
      const n = parseInt(sizeDraft, 10);
      if (!Number.isNaN(n)) changeFontSize(n);
      setSizeDraft(null);
    }
  };

  const textStyleCss: React.CSSProperties = {
    fontWeight: textStyle.bold ? 700 : 400,
    fontStyle: textStyle.italic ? 'italic' : 'normal',
    fontSize: `${textStyle.fontSize}px`,
  };

  // Helper to apply text transformations with undo support
  const applyTransform = (newText: string) => {
    setUndoStack(prev => [...prev, text]);
    setRedoStack([]);
    setText(newText);
  };

  // Enhanced function to handle multi-format file import
  const importFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      toast.error('No file selected');
      return;
    }

    // Save current text to history before importing
    if (text.trim()) {
      setUndoStack(prev => [...prev, text]);
      setRedoStack([]);
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
    URL.revokeObjectURL(url);
  };

  // Export function for DOCX
  const exportAsDocxFile = async () => {
    try {
      toast.loading('Creating Word document...', { id: 'docx-export' });
      await exportAsDocx(text, 'document.docx', textStyle);
      toast.success('Word document exported successfully!', { id: 'docx-export' });
    } catch (error) {
      console.error('DOCX export error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Failed to export Word document: ${errorMessage}`, { id: 'docx-export' });
    }
  };

  // Export function for PDF
  const exportAsPdfFile = () => {
    try {
      exportAsPdf(text, 'TypeShift Document', textStyle);
      toast.success('PDF print dialog opened');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(errorMessage);
    }
  };

  // Undo function
  const undo = () => {
    if (undoStack.length > 0) {
      const previousText = undoStack[undoStack.length - 1];
      setUndoStack(prev => prev.slice(0, -1));
      setRedoStack(prev => [...prev, text]);
      setText(previousText);
      toast.success('Undo successful');
    } else {
      toast.error('Nothing to undo');
    }
  };

  // Redo function
  const redo = () => {
    if (redoStack.length > 0) {
      const nextText = redoStack[redoStack.length - 1];
      setRedoStack(prev => prev.slice(0, -1));
      setUndoStack(prev => [...prev, text]);
      setText(nextText);
      toast.success('Redo successful');
    } else {
      toast.error('Nothing to redo');
    }
  };

  // Text transformation functions
  const upperCase = () => {
    applyTransform(text.toUpperCase());
    toast.success('Converted to Uppercase');
  };

  const lowerCase = () => {
    applyTransform(text.toLowerCase());
    toast.success('Converted to Lowercase');
  };

  const sentenceCase = () => {
    let newText = text.replace(/(?:^|\.\s|!\s|\?\s|,\s|:\s|;\s)([a-z])/g, (p1) => p1.toUpperCase());
    newText = newText.charAt(0).toUpperCase() + newText.slice(1);
    applyTransform(newText);
    toast.success('Applied Sentence Case');
  };

  const titleCase = () => {
    const newText = text.replace(/\w\S*/g, (txt) =>
      txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase()
    );
    applyTransform(newText);
    toast.success('Converted to Title Case');
  };

  const clearText = () => {
    applyTransform('');
    toast.success('Text Cleared');
  };

  const copyText = () => {
    navigator.clipboard.writeText(text);
    toast.success('Text Copied to Clipboard');
  };

  const removeExtraSpaces = () => {
    const newText = text.replace(/ +/g, ' ');
    applyTransform(newText.trim());
    toast.success('Extra Spaces Removed');
  };

  const addSingleSpaces = () => {
    const newText = text.split('\n')
      .map(line => line.trim().split(/\s+/).filter(Boolean).join(' '))
      .join('\n');
    applyTransform(newText);
    toast.success('One Space Added Between Words');
  };

  const fixPunctuationSpacing = () => {
    const newText = text
      .replace(/[ \t]+([,.;:!?])/g, '$1')
      .replace(/([,;:!?])(?=\S)/g, '$1 ')
      .replace(/([.!?])(?=[A-Za-z])/g, '$1 ');
    applyTransform(newText);
    toast.success('Punctuation Spacing Fixed');
  };

  const removePara = () => {
    const newText = text.replace(/\s+/g, ' ').trim();
    applyTransform(newText.trim());
    toast.success('Only one Paragraph Removed');
  };

  const sortTextLines = () => {
    const newText = text.split('\n').sort().join('\n');
    applyTransform(newText.trim());
    toast.success('Text is Sorted');
  };

  const makeList = () => {
    if (text.trim().length === 0) {
      toast.error("No text to make a list");
      return;
    }

    const lines = text.split('\n').filter(line => line.trim() !== '');
    const numberedList = lines.map((line, index) => `${index + 1}. ${line.trim()}`).join('\n');
    applyTransform(numberedList);
    toast.success('List Created');
  };

  const removeExtraVerticalSpaces = () => {
    const newText = text.replace(/\n{3,}/g, '\n\n').trim();
    applyTransform(newText);
    toast.success('Extra Vertical Spaces Removed');
  };

  const removeDuplicateLines = () => {
    const lines = text.split('\n');
    const uniqueLines = [...new Set(lines)];
    applyTransform(uniqueLines.join('\n'));
    toast.success('Duplicate Lines Removed');
  };

  const slugify = () => {
    const newText = text.toLowerCase().trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
    applyTransform(newText);
    toast.success('Converted to URL Slug');
  };

  const removePunctuation = () => {
    const newText = text.replace(/[^\w\s]|_/g, '');
    applyTransform(newText);
    toast.success('Punctuation Removed');
  };

  // Programmer Case Conversions
  const toCamelCase = () => {
    const newText = text.split('\n').map(line => {
      const words = line.trim().split(/[\s_-]+/).filter(w => w.length > 0);
      if (words.length === 0) return '';
      return words.map((w, i) => i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
    }).join('\n');
    applyTransform(newText);
    toast.success('Converted to camelCase');
  };

  const toSnakeCase = () => {
    const newText = text.split('\n').map(line => {
      const words = line.trim().split(/[\s_-]+/).filter(w => w.length > 0);
      return words.map(w => w.toLowerCase()).join('_');
    }).join('\n');
    applyTransform(newText);
    toast.success('Converted to snake_case');
  };

  const toKebabCase = () => {
    const newText = text.split('\n').map(line => {
      const words = line.trim().split(/[\s_-]+/).filter(w => w.length > 0);
      return words.map(w => w.toLowerCase()).join('-');
    }).join('\n');
    applyTransform(newText);
    toast.success('Converted to kebab-case');
  };

  const toPascalCase = () => {
    const newText = text.split('\n').map(line => {
      const words = line.trim().split(/[\s_-]+/).filter(w => w.length > 0);
      return words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
    }).join('\n');
    applyTransform(newText);
    toast.success('Converted to PascalCase');
  };

  // Find & Replace
  const getMatchCount = useCallback((): number => {
    if (!findText) return 0;
    try {
      const flags = caseSensitive ? 'g' : 'gi';
      const regex = new RegExp(findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), flags);
      return (text.match(regex) || []).length;
    } catch {
      return 0;
    }
  }, [text, findText, caseSensitive]);

  const handleReplaceAll = () => {
    if (!findText) return;
    const count = getMatchCount();
    try {
      const flags = caseSensitive ? 'g' : 'gi';
      const regex = new RegExp(findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), flags);
      const newText = text.replace(regex, replaceText);
      applyTransform(newText);
      toast.success(`Replaced ${count} occurrence${count !== 1 ? 's' : ''}`);
    } catch {
      toast.error('Invalid search text');
    }
  };

  const handleReplaceFirst = () => {
    if (!findText) return;
    try {
      const flags = caseSensitive ? '' : 'i';
      const regex = new RegExp(findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), flags);
      const newText = text.replace(regex, replaceText);
      if (newText !== text) {
        applyTransform(newText);
        toast.success('Replaced first occurrence');
      } else {
        toast.error('No match found');
      }
    } catch {
      toast.error('Invalid search text');
    }
  };

  // Drag-and-Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (text.trim()) {
      setUndoStack(prev => [...prev, text]);
      setRedoStack([]);
    }

    const fileType = getFileTypeDescription(file.name);
    const toastId = toast.loading(`Processing ${fileType}...`);

    try {
      const extractedText = await handleFileImport(file);
      setText(extractedText);
      toast.success(`${fileType} imported successfully!`, { id: toastId });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Failed to import: ${errorMessage}`, { id: toastId });
    }
  };

  // Keyboard shortcuts
  const undoRef = useRef(undo);
  const redoRef = useRef(redo);
  undoRef.current = undo;
  redoRef.current = redo;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isTextarea = (e.target as HTMLElement).tagName === 'TEXTAREA';

      // Ctrl+Z / Cmd+Z: Undo (skip when typing in textarea)
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key === 'z' && !isTextarea) {
        e.preventDefault();
        undoRef.current();
        return;
      }

      // Ctrl+Y / Ctrl+Shift+Z: Redo (skip when typing in textarea)
      if (!isTextarea) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
          e.preventDefault();
          redoRef.current();
          return;
        }
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'z' || e.key === 'Z')) {
          e.preventDefault();
          redoRef.current();
          return;
        }
      }

      // Ctrl+B / Ctrl+I: Bold / Italic
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey && (e.key === 'b' || e.key === 'B')) {
        e.preventDefault();
        toggleBold();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey && (e.key === 'i' || e.key === 'I')) {
        e.preventDefault();
        toggleItalic();
        return;
      }

      // Ctrl+Shift+K: Toggle shortcuts help
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        setShowShortcuts(prev => !prev);
        return;
      }

      // Ctrl+H: Toggle Find & Replace
      if ((e.ctrlKey || e.metaKey) && (e.key === 'h' || e.key === 'H')) {
        e.preventDefault();
        setShowFindReplace(prev => !prev);
        return;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [toggleBold, toggleItalic]);

  return (
    <>
      {/* Container for Import/Export buttons */}
      <div className="container my-1" style={{ color: mode === 'dark' ? 'white' : 'black' }}>
        {/* Import and Export Buttons */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-end mb-3">
          <h6 className={`mb-2 mb-md-0 d-flex align-items-center ${mode === 'dark' ? 'text-light' : 'text-muted'} heading-animated`} style={{ minHeight: '32px' }}>{heading}</h6>

          {/* File Operations Group */}
          <div>
            <h6 className={`mb-2 ${mode === 'dark' ? 'text-light' : 'text-muted'} heading-animated`}>File Operations</h6>
            <div className="file-operations-group mb-0">
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
                  <li>
                    <button className="dropdown-item" onClick={exportAsPdfFile} disabled={text.length === 0} aria-label="Export as PDF">
                      <Icon icon="mdi:file-pdf-box" className="me-1 file-icon" width="20" height="20" aria-hidden="true" /> As .pdf
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="mb-3">
          {/* Compact text style toolbar attached to the text area */}
          <div className={`text-style-toolbar ${mode === 'dark' ? 'dark-mode' : ''}`} role="toolbar" aria-label="Text style">
            <button
              type="button"
              className={`btn btn-sm ${textStyle.bold ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={toggleBold}
              aria-pressed={textStyle.bold}
              aria-label="Toggle bold"
              title="Bold (Ctrl+B)"
            >
              <Icon icon="mdi:format-bold" width="18" height="18" aria-hidden="true" />
            </button>
            <button
              type="button"
              className={`btn btn-sm ${textStyle.italic ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={toggleItalic}
              aria-pressed={textStyle.italic}
              aria-label="Toggle italic"
              title="Italic (Ctrl+I)"
            >
              <Icon icon="mdi:format-italic" width="18" height="18" aria-hidden="true" />
            </button>
            <div className="btn-group font-size-group" role="group" aria-label="Font size">
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                onClick={() => changeFontSize(textStyle.fontSize - 1)}
                disabled={textStyle.fontSize <= MIN_FONT_SIZE}
                aria-label="Decrease font size"
                title="Decrease font size"
              >
                <Icon icon="mdi:minus" width="16" height="16" aria-hidden="true" />
              </button>
              <input
                type="number"
                inputMode="numeric"
                className={`form-control form-control-sm font-size-input ${mode === 'dark' ? 'bg-dark text-white border-secondary' : ''}`}
                min={MIN_FONT_SIZE}
                max={MAX_FONT_SIZE}
                value={sizeDraft ?? textStyle.fontSize}
                onChange={(e) => setSizeDraft(e.target.value)}
                onBlur={commitSizeDraft}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); commitSizeDraft(); } }}
                aria-label="Font size in pixels"
                title={`Font size (${MIN_FONT_SIZE}-${MAX_FONT_SIZE}px)`}
              />
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                onClick={() => changeFontSize(textStyle.fontSize + 1)}
                disabled={textStyle.fontSize >= MAX_FONT_SIZE}
                aria-label="Increase font size"
                title="Increase font size"
              >
                <Icon icon="mdi:plus" width="16" height="16" aria-hidden="true" />
              </button>
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary dropdown-toggle dropdown-toggle-split"
                data-bs-toggle="dropdown"
                aria-expanded="false"
                aria-label="Choose a preset font size"
                title="Preset sizes"
              ></button>
              <ul className={`dropdown-menu dropdown-menu-end font-size-menu${mode === 'dark' ? 'dropdown-menu-dark' : ''}`}>
                {FONT_SIZE_PRESETS.map(size => (
                  <li key={size}>
                    <button
                      type="button"
                      className={`dropdown-item ${textStyle.fontSize === size ? 'active' : ''}`}
                      onClick={() => changeFontSize(size)}
                    >
                      {size}px
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary"
              onClick={resetStyle}
              aria-label="Reset text style"
              title="Reset text style"
            >
              <Icon icon="mdi:format-clear" width="18" height="18" aria-hidden="true" />
            </button>
          </div>
          <div
            className={`drag-drop-zone ${isDragOver ? 'drag-over' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <textarea
              className={`form-control ${mode === 'dark' ? 'text-white' : 'text-black'}`}
              id="textBox"
              rows={10}
              placeholder="Type, paste, or drag & drop a file here..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              style={{ backgroundColor: mode === 'dark' ? '#74747400' : 'white', color: mode === 'dark' ? 'white' : 'black', ...textStyleCss }}
            />
            {isDragOver && (
              <div className="drag-overlay">
                <Icon icon="mdi:file-import" width="48" height="48" />
                <p>Drop file to import</p>
              </div>
            )}
          </div>
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
              <button disabled={text.length === 0} className="btn btn-primary" onClick={titleCase} aria-label="Apply title case">
                <Icon icon="mdi:format-title" className="me-1 file-icon" aria-hidden="true" /> Title Case
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
              <button disabled={undoStack.length === 0} className="btn btn-secondary" onClick={undo} aria-label="Undo last action" title={`${undoStack.length} undo step${undoStack.length !== 1 ? 's' : ''} available`}>
                <Icon icon="ic:round-undo" className="me-1 file-icon" width="20" height="20" aria-hidden="true" /> Undo
              </button>
              <button disabled={redoStack.length === 0} className="btn btn-secondary" onClick={redo} aria-label="Redo last action" title={`${redoStack.length} redo step${redoStack.length !== 1 ? 's' : ''} available`}>
                <Icon icon="ic:round-redo" className="me-1 file-icon" width="20" height="20" aria-hidden="true" /> Redo
              </button>
              <button className="btn btn-outline-secondary" onClick={() => setShowFindReplace(true)} aria-label="Find and Replace" title="Find & Replace (Ctrl+H)">
                <Icon icon="mdi:find-replace" className="file-icon" width="20" height="20" aria-hidden="true" />
              </button>
              <button className="btn btn-outline-secondary" onClick={() => setShowShortcuts(true)} aria-label="Show keyboard shortcuts" title="Keyboard Shortcuts (Ctrl+Shift+K)">
                <Icon icon="mdi:keyboard" className="file-icon" width="20" height="20" aria-hidden="true" />
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
            <button disabled={text.length === 0} className="btn btn-primary" onClick={addSingleSpaces} aria-label="Add one space between words">
              <Icon icon="mdi:format-letter-spacing" className="me-1 file-icon" aria-hidden="true" /> One Space
            </button>
            <button disabled={text.length === 0} className="btn btn-primary" onClick={fixPunctuationSpacing} aria-label="Fix punctuation spacing">
              <Icon icon="mdi:format-text-wrapping-wrap" className="me-1 file-icon" aria-hidden="true" /> Fix Punctuation
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
            <button disabled={text.length === 0} className="btn btn-primary" onClick={removeDuplicateLines} aria-label="Remove duplicate lines">
              <Icon icon="mdi:content-duplicate" className="me-1 file-icon" aria-hidden="true" /> Remove Duplicates
            </button>
            <button disabled={text.length === 0} className="btn btn-primary" onClick={removePunctuation} aria-label="Remove punctuation">
              <Icon icon="mdi:format-clear" className="me-1 file-icon" aria-hidden="true" /> Remove Punctuation
            </button>
            <button disabled={text.length === 0} className="btn btn-primary" onClick={slugify} aria-label="Convert to URL slug">
              <Icon icon="mdi:link-variant" className="me-1 file-icon" aria-hidden="true" /> Slugify
            </button>
          </div>
        </div>

        {/* Group 3: Programmer Cases */}
        <div className="mb-3">
          <h6 className={`mb-2 ${mode === 'dark' ? 'text-light' : 'text-muted'} heading-animated`}>Programmer Cases</h6>
          <div className="btn-group format-btn-group">
            <button disabled={text.length === 0} className="btn btn-primary" onClick={toCamelCase} aria-label="Convert to camelCase">
              <Icon icon="mdi:code-braces" className="me-1 file-icon" aria-hidden="true" /> camelCase
            </button>
            <button disabled={text.length === 0} className="btn btn-primary" onClick={toPascalCase} aria-label="Convert to PascalCase">
              <Icon icon="mdi:code-tags" className="me-1 file-icon" aria-hidden="true" /> PascalCase
            </button>
            <button disabled={text.length === 0} className="btn btn-primary" onClick={toSnakeCase} aria-label="Convert to snake_case">
              <Icon icon="mdi:code-brackets" className="me-1 file-icon" aria-hidden="true" /> snake_case
            </button>
            <button disabled={text.length === 0} className="btn btn-primary" onClick={toKebabCase} aria-label="Convert to kebab-case">
              <Icon icon="mdi:minus" className="me-1 file-icon" aria-hidden="true" /> kebab-case
            </button>
          </div>
        </div>

        {/* Group 4: Utility Actions - Mobile only */}
        <div className="mb-3 d-lg-none">
          <h6 className={`mb-2 ${mode === 'dark' ? 'text-light' : 'text-muted'} heading-animated`}>Utility Actions</h6>
          <div className="btn-group format-btn-group flex-wrap">
            <button disabled={text.length === 0} className="btn btn-success" onClick={copyText} aria-label="Copy text">
              <Icon icon="solar:copy-linear" className="me-1 file-icon" width="20" height="20" aria-hidden="true" /> Copy
            </button>
            <button disabled={text.length === 0} className="btn btn-danger" onClick={clearText} aria-label="Clear text">
              <Icon icon="ri:delete-bin-6-line" className="me-1 file-icon" width="20" height="20" aria-hidden="true" /> Clear
            </button>
            <button disabled={undoStack.length === 0} className="btn btn-secondary" onClick={undo} aria-label="Undo last action" title={`${undoStack.length} undo step${undoStack.length !== 1 ? 's' : ''} available`}>
              <Icon icon="ic:round-undo" className="me-1 file-icon" width="20" height="20" aria-hidden="true" /> Undo
            </button>
            <button disabled={redoStack.length === 0} className="btn btn-secondary" onClick={redo} aria-label="Redo last action" title={`${redoStack.length} redo step${redoStack.length !== 1 ? 's' : ''} available`}>
              <Icon icon="ic:round-redo" className="me-1 file-icon" width="20" height="20" aria-hidden="true" /> Redo
            </button>
            <button className="btn btn-outline-secondary" onClick={() => setShowFindReplace(true)} aria-label="Find and Replace" title="Find & Replace (Ctrl+H)">
              <Icon icon="mdi:find-replace" className="file-icon" width="20" height="20" aria-hidden="true" />
            </button>
            <button className="btn btn-outline-secondary" onClick={() => setShowShortcuts(true)} aria-label="Show keyboard shortcuts" title="Keyboard Shortcuts (Ctrl+Shift+K)">
              <Icon icon="mdi:keyboard" className="file-icon" width="20" height="20" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {/* Text Summary and Preview */}
      <div className="container" style={{ color: mode === 'dark' ? 'white' : 'black' }}>
        <hr />
        <h4 className="my-3 heading-animated">Your Text Summary</h4>

        {/* Grid layout for summary statistics */}
        <div className={`row row-cols-1 row-cols-sm-2 row-cols-md-4 g-2 ${mode === 'dark' ? 'dark-mode' : ''}`}>
          {/* Basic Counts - First Row */}
          <div className="col">
            <SummaryCard title="Words" value={textAnalytics.wordCount} />
          </div>
          <div className="col">
            <SummaryCard title="Characters" value={text.length} />
          </div>
          <div className="col">
            <SummaryCard title="Sentences" value={textAnalytics.sentenceCount} />
          </div>
          <div className="col">
            <SummaryCard title="Lines" value={textAnalytics.lineCount} />
          </div>

          {/* Advanced Metrics - Second Row */}
          <div className="col">
            <SummaryCard title="Syllables" value={textAnalytics.totalSyllables} />
          </div>
          <div className="col">
            <SummaryCard title="Avg Word Length" value={textAnalytics.averageWordLength} />
          </div>
          <div className="col">
            <SummaryCard title="Avg Sentence Length" value={textAnalytics.averageSentenceLength} />
          </div>
          <div className="col">
            <SummaryCard title="Gunning Fog Index" value={textAnalytics.gunningFogIndex} />
          </div>

          {/* Additional Metrics */}
          <div className="col">
            <SummaryCard title="Paragraphs" value={textAnalytics.paragraphCount} />
          </div>
          <div className="col">
            <SummaryCard title="Unique Words" value={textAnalytics.uniqueWordCount} />
          </div>
          <div className="col">
            <SummaryCard title="Reading Time" value={textAnalytics.readingTime} />
          </div>
          <div className="col">
            <SummaryCard title="Speaking Time" value={textAnalytics.speakingTime} />
          </div>
        </div>

        <hr className="my-4" />
        <h4 className="mb-3 heading-animated">Preview</h4>
        <div className={`preview-container ${mode === 'dark' ? 'dark-mode' : ''}`} style={textStyleCss}>
          {text.length > 0 ? text : 'Nothing to preview.'}
        </div>
        <hr className="my-4" />
      </div>

      {/* Find & Replace Modal */}
      {showFindReplace && (
        <div className="shortcuts-overlay" onClick={() => setShowFindReplace(false)} role="dialog" aria-modal="true" aria-label="Find and Replace">
          <div className={`shortcuts-modal find-replace-modal ${mode === 'dark' ? 'dark-mode' : ''}`} onClick={(e) => e.stopPropagation()}>
            <div className="shortcuts-header">
              <h5>Find & Replace</h5>
              <button className="btn-close" onClick={() => setShowFindReplace(false)} aria-label="Close"></button>
            </div>
            <div className="shortcuts-body">
              <div className="mb-3">
                <label className="form-label small">Find</label>
                <input
                  type="text"
                  className={`form-control ${mode === 'dark' ? 'bg-dark text-white border-secondary' : ''}`}
                  value={findText}
                  onChange={(e) => setFindText(e.target.value)}
                  placeholder="Search text..."
                  autoFocus
                />
                {findText && (
                  <small className={`${mode === 'dark' ? 'text-light' : 'text-muted'} mt-1 d-block`}>
                    {getMatchCount()} match{getMatchCount() !== 1 ? 'es' : ''} found
                  </small>
                )}
              </div>
              <div className="mb-3">
                <label className="form-label small">Replace with</label>
                <input
                  type="text"
                  className={`form-control ${mode === 'dark' ? 'bg-dark text-white border-secondary' : ''}`}
                  value={replaceText}
                  onChange={(e) => setReplaceText(e.target.value)}
                  placeholder="Replace with..."
                />
              </div>
              <div className="form-check mb-3">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="caseSensitive"
                  checked={caseSensitive}
                  onChange={(e) => setCaseSensitive(e.target.checked)}
                />
                <label className="form-check-label small" htmlFor="caseSensitive">
                  Case sensitive
                </label>
              </div>
              <div className="d-flex gap-2">
                <button
                  className="btn btn-primary btn-sm flex-fill"
                  onClick={handleReplaceFirst}
                  disabled={!findText || getMatchCount() === 0}
                >
                  Replace First
                </button>
                <button
                  className="btn btn-primary btn-sm flex-fill"
                  onClick={handleReplaceAll}
                  disabled={!findText || getMatchCount() === 0}
                >
                  Replace All
                </button>
              </div>
            </div>
            <div className="shortcuts-footer">
              <small>Press Ctrl+H to toggle this dialog</small>
            </div>
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Modal */}
      {showShortcuts && (
        <div className="shortcuts-overlay" onClick={() => setShowShortcuts(false)} role="dialog" aria-modal="true" aria-label="Keyboard shortcuts">
          <div className={`shortcuts-modal ${mode === 'dark' ? 'dark-mode' : ''}`} onClick={(e) => e.stopPropagation()}>
            <div className="shortcuts-header">
              <h5>Keyboard Shortcuts</h5>
              <button className="btn-close" onClick={() => setShowShortcuts(false)} aria-label="Close shortcuts"></button>
            </div>
            <div className="shortcuts-body">
              <div className="shortcut-row">
                <span className="shortcut-keys"><kbd>Ctrl</kbd> + <kbd>Z</kbd></span>
                <span className="shortcut-desc">Undo</span>
              </div>
              <div className="shortcut-row">
                <span className="shortcut-keys"><kbd>Ctrl</kbd> + <kbd>Y</kbd></span>
                <span className="shortcut-desc">Redo</span>
              </div>
              <div className="shortcut-row">
                <span className="shortcut-keys"><kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>Z</kbd></span>
                <span className="shortcut-desc">Redo (Alt)</span>
              </div>
              <div className="shortcut-row">
                <span className="shortcut-keys"><kbd>Ctrl</kbd> + <kbd>B</kbd></span>
                <span className="shortcut-desc">Bold</span>
              </div>
              <div className="shortcut-row">
                <span className="shortcut-keys"><kbd>Ctrl</kbd> + <kbd>I</kbd></span>
                <span className="shortcut-desc">Italic</span>
              </div>
              <div className="shortcut-row">
                <span className="shortcut-keys"><kbd>Ctrl</kbd> + <kbd>H</kbd></span>
                <span className="shortcut-desc">Find & Replace</span>
              </div>
              <div className="shortcut-row">
                <span className="shortcut-keys"><kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>K</kbd></span>
                <span className="shortcut-desc">Toggle this dialog</span>
              </div>
            </div>
            <div className="shortcuts-footer">
              <small>Undo/Redo work when the text area is not focused</small>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Textbox;
