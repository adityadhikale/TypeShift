/**
 * Exports text as a PDF by opening a print-friendly window.
 * Uses the browser's native print dialog, which supports "Save as PDF".
 */
export const exportAsPdf = (
  text: string,
  title: string = 'TypeShift Document',
  format?: { bold: boolean; italic: boolean; fontSize: number }
): void => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    throw new Error('Pop-up blocked. Please allow pop-ups for this site to export as PDF.');
  }

  const escapedText = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br>');

  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>${title}</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          padding: 2rem;
          max-width: 800px;
          margin: 0 auto;
          color: #333;${format ? `
          font-size: ${format.fontSize}px;
          font-weight: ${format.bold ? 700 : 400};
          font-style: ${format.italic ? 'italic' : 'normal'};` : ''}
        }
        @media print {
          body { padding: 0; }
        }
      </style>
    </head>
    <body>${escapedText}</body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
};
