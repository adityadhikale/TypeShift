import mammoth from 'mammoth';

/**
 * Detects text encoding from a file's byte content by checking BOM signatures.
 * Falls back to UTF-8 if no BOM is found.
 */
const detectEncoding = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer);

  // UTF-8 BOM: EF BB BF
  if (bytes.length >= 3 && bytes[0] === 0xEF && bytes[1] === 0xBB && bytes[2] === 0xBF) {
    return 'utf-8';
  }

  // UTF-16 LE BOM: FF FE
  if (bytes.length >= 2 && bytes[0] === 0xFF && bytes[1] === 0xFE) {
    return 'utf-16le';
  }

  // UTF-16 BE BOM: FE FF
  if (bytes.length >= 2 && bytes[0] === 0xFE && bytes[1] === 0xFF) {
    return 'utf-16be';
  }

  return 'utf-8';
};

/**
 * Handles text file import (.txt, .md) with encoding detection
 */
export const handleTextFile = async (file: File): Promise<string> => {
  const buffer = await file.arrayBuffer();
  const encoding = detectEncoding(buffer);
  const decoder = new TextDecoder(encoding);
  return decoder.decode(buffer);
};


/**
 * Handles Word document import (.docx)
 */
export const handleWordFile = async (file: File): Promise<string> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    
    if (!result.value || result.value.trim().length === 0) {
      throw new Error('No text content found in Word document');
    }
    
    return result.value;
  } catch (error) {
    throw new Error(`Failed to extract text from Word document: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Validates file before processing
 */
export const validateFile = (file: File): { isValid: boolean; error?: string } => {
  const maxSize = 10 * 1024 * 1024; // 10MB limit
  const allowedExtensions = ['txt', 'md', 'docx', 'doc'];
  
  // Check file size
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: 'File size must be less than 10MB'
    };
  }
  
  // Check file extension
  const fileExtension = file.name.split('.').pop()?.toLowerCase();
  if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
    return {
      isValid: false,
      error: `Unsupported file format. Supported formats: ${allowedExtensions.join(', ')}`
    };
  }
  
  return { isValid: true };
};

/**
 * Main file import handler - routes to appropriate handler based on file type
 */
export const handleFileImport = async (file: File): Promise<string> => {
  // Validate file first
  const validation = validateFile(file);
  if (!validation.isValid) {
    throw new Error(validation.error);
  }
  
  const fileExtension = file.name.split('.').pop()?.toLowerCase();
  
  switch (fileExtension) {
    case 'txt':
    case 'md':
      return await handleTextFile(file);
    case 'docx':
    case 'doc':
      return await handleWordFile(file);
    default:
      throw new Error('Unsupported file format');
  }
};

/**
 * Gets appropriate icon for file type
 */
export const getFileIcon = (fileName: string): string => {
  const ext = fileName.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'docx':
    case 'doc':
      return 'mdi:file-word-box';
    case 'md':
      return 'mdi:language-markdown';
    case 'txt':
      return 'mdi:file-document';
    default:
      return 'mdi:file-import';
  }
};

/**
 * Gets file type description for user feedback
 */
export const getFileTypeDescription = (fileName: string): string => {
  const ext = fileName.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'docx':
      return 'Word Document';
    case 'doc':
      return 'Word Document (Legacy)';
    case 'md':
      return 'Markdown File';
    case 'txt':
      return 'Text File';
    default:
      return 'Document';
  }
};
