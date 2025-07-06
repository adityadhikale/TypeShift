import { Document, Packer, Paragraph, TextRun } from 'docx';
import { saveAs } from 'file-saver';

/**
 * Exports text as a DOCX (Word) document
 */
export const exportAsDocx = async (text: string, filename: string = 'document.docx'): Promise<void> => {
  try {
    // Split text into paragraphs
    const paragraphs = text.split('\n').map(line => {
      // Handle empty lines
      if (line.trim() === '') {
        return new Paragraph({
          children: [new TextRun({ text: '' })],
          spacing: { after: 120 } // Add some spacing after empty lines
        });
      }
      
      // Regular paragraphs
      return new Paragraph({
        children: [
          new TextRun({
            text: line,
            size: 24, // 12pt font (size is in half-points)
          }),
        ],
        spacing: { after: 120 } // Add spacing between paragraphs
      });
    });

    // Create the document
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: paragraphs.length > 0 ? paragraphs : [
            new Paragraph({
              children: [
                new TextRun({
                  text: 'This document appears to be empty.',
                  size: 24,
                  italics: true
                })
              ]
            })
          ]
        },
      ],
    });

    // Generate the document as a blob
    const blob = await Packer.toBlob(doc);
    
    // Save the file
    saveAs(blob, filename);
  } catch (error) {
    console.error('Error creating DOCX file:', error);
    throw new Error(`Failed to create Word document: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};
