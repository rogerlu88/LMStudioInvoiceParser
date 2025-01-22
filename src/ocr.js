import { createWorker } from 'tesseract.js';
import fs from 'fs';
import { PDFExtract } from 'pdf.js-extract';

export class OCRProcessor {
  /**
   * Extract text from a PDF file
   * @param {string} pdfPath - Path to the PDF file
   * @returns {Promise<string>} Extracted text
   */
  static async extractFromPDF(pdfPath) {
    try {
      const pdfExtract = new PDFExtract();
      const options = {
        // Enable layout analysis for better table detection
        normalizeWhitespace: true,
        disableCombineTextItems: false
      };
      
      const data = await pdfExtract.extract(pdfPath, options);
      
      // Process each page with layout analysis
      const text = data.pages.map(page => {
        // Sort content by vertical position first, then horizontal
        const sortedContent = page.content.sort((a, b) => {
          const yDiff = Math.abs(a.y - b.y);
          // If items are roughly on the same line (within 5 units)
          if (yDiff < 5) {
            return a.x - b.x; // Sort by x position
          }
          return a.y - b.y; // Sort by y position
        });

        // Group items by line (y-position)
        let currentY = null;
        let currentLine = [];
        let lines = [];

        sortedContent.forEach(item => {
          // Clean up the text by removing extra spaces and normalizing characters
          item.str = item.str.replace(/\s+/g, ' ').trim()
            .replace(/[""]/g, '"')
            .replace(/['']/g, "'");

          if (currentY === null) {
            currentY = item.y;
          }

          // If this item is roughly on the same line
          if (Math.abs(item.y - currentY) < 5) {
            currentLine.push(item);
          } else {
            // New line
            if (currentLine.length > 0) {
              lines.push(currentLine);
            }
            currentLine = [item];
            currentY = item.y;
          }
        });

        // Don't forget the last line
        if (currentLine.length > 0) {
          lines.push(currentLine);
        }

        // Convert lines to text, preserving layout
        return lines.map(line => {
          // Sort items in line by x position
          line.sort((a, b) => a.x - b.x);
          // Join with space, but handle special cases for invoice numbers
          return line.map(item => item.str).join(' ')
            .replace(/Invoice\s*#\s*:?\s*(\d+)/i, 'Invoice #$1')  // Normalize invoice number format
            .replace(/Invoice\s*Number\s*:?\s*(\d+)/i, 'Invoice #$1');
        }).join('\n');
      }).join('\n\n');
      
      return text;
    } catch (error) {
      console.error('PDF Extraction Error:', error);
      throw error;
    }
  }

  /**
   * Perform Optical Character Recognition
   * @param {string} filePath - Path to the file (image or PDF)
   * @returns {Promise<string>} Extracted text
   */
  static async extract(filePath) {
    try {
      // Check if file exists and is readable
      try {
        await fs.promises.access(filePath, fs.constants.R_OK);
      } catch (err) {
        throw new Error(`Cannot access file: ${err.message}`);
      }

      // Get file stats to check size
      const stats = await fs.promises.stat(filePath);
      if (stats.size === 0) {
        throw new Error('File is empty');
      }

      // Check file extension
      const ext = filePath.toLowerCase().split('.').pop();
      
      if (ext === 'pdf') {
        return await this.extractFromPDF(filePath);
      } else if (['jpg', 'jpeg', 'png'].includes(ext)) {
        console.log('Processing image file:', filePath);
        
        let worker = null;
        try {
          // Initialize worker
          console.log('Creating Tesseract worker...');
          worker = await createWorker();
          console.log('Worker created successfully');

          // Initialize tesseract with English
          console.log('Loading Tesseract core...');
          await worker.load();
          console.log('Tesseract core loaded successfully');
          
          console.log('Loading English language data...');
          await worker.loadLanguage('eng');
          console.log('Language data loaded successfully');
          
          console.log('Initializing Tesseract...');
          await worker.initialize('eng');
          console.log('Tesseract initialized successfully');

          // Set parameters for better OCR
          console.log('Setting Tesseract parameters...');
          await worker.setParameters({
            tessedit_ocr_engine_mode: 3,  // Use only LSTM neural net mode
            preserve_interword_spaces: '1',
            tessedit_pageseg_mode: '1'   // Automatic page segmentation with OSD
          });
          console.log('Parameters set successfully');

          // Verify file exists before OCR
          const fileContent = await fs.promises.readFile(filePath);
          if (!fileContent || fileContent.length === 0) {
            throw new Error('File is empty or unreadable');
          }

          // Perform OCR
          console.log('Starting OCR on file:', filePath);
          const { data: { text } } = await worker.recognize(filePath);
          console.log('OCR completed successfully');

          // Clean up
          console.log('Terminating worker...');
          await worker.terminate();
          console.log('Worker terminated successfully');

          if (!text || text.trim().length === 0) {
            throw new Error('No text was extracted from the image');
          }

          console.log('Extracted text length:', text.length);
          console.log('First 100 characters:', text.substring(0, 100));
          return text;
        } catch (err) {
          console.error('OCR Error:', {
            message: err.message,
            stack: err.stack,
            filePath,
            fileExists: fs.existsSync(filePath),
            fileStats: fs.existsSync(filePath) ? fs.statSync(filePath) : null
          });
          
          if (worker) {
            try {
              await worker.terminate();
              console.log('Worker terminated after error');
            } catch (termError) {
              console.error('Error terminating worker:', termError);
            }
          }
          throw new Error(`OCR processing failed: ${err.message}`);
        }
      } else {
        throw new Error('Unsupported file format. Please upload a PDF, JPEG, or PNG file.');
      }
    } catch (error) {
      console.error('Error in OCR processing:', error);
      throw error;
    }
  }

  /**
   * Validate extracted text
   * @param {string} text - Extracted text
   * @returns {boolean} Whether text is valid
   */
  static validateText(text) {
    return text && text.trim().length > 10;
  }
}