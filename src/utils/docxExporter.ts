import { Document, Packer, Paragraph, TextRun } from 'docx';
import { saveAs } from 'file-saver';

export interface TextFormat {
  bold: boolean;
  italic: boolean;
  fontSize: number; // CSS px
}

/**
 * Exports text as a DOCX (Word) document
 */
export const exportAsDocx = async (text: string, filename: string = 'document.docx', format?: TextFormat): Promise<void> => {
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
            // docx size is in half-points; 1 CSS px = 0.75pt
            size: format ? Math.round(format.fontSize * 1.5) : 24,
            bold: format?.bold,
            italics: format?.italic,
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
