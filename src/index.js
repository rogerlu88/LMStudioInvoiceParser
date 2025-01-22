import { OCRProcessor } from './ocr.js';
import { LMStudioProcessor } from './lm-studio.js';
import { FileUtils, ValidationUtils } from './utils.js';

class InvoiceProcessor {
  /**
   * Process an invoice image
   * @param {string} imagePath - Path to the invoice image
   * @param {Object} config - Configuration options
   * @returns {Promise<Object>} Processed invoice data
   */
  static async process(imagePath, config = {}) {
    try {
      // Validate image file
      if (!FileUtils.fileExists(imagePath)) {
        throw new Error('Image file does not exist');
      }

      // Check file extension
      const allowedExtensions = ['.jpg', '.jpeg', '.png', '.pdf'];
      const fileExt = FileUtils.getFileExtension(imagePath);
      if (!allowedExtensions.includes(fileExt)) {
        throw new Error(`Unsupported file type: ${fileExt}`);
      }

      // Perform OCR
      const ocrText = await OCRProcessor.extract(
        imagePath, 
        config.language || 'eng'
      );

      // Validate OCR extraction
      if (!OCRProcessor.validateText(ocrText)) {
        throw new Error('Insufficient text extracted from image');
      }

      // Process with LM Studio
      const structuredData = await LMStudioProcessor.processInvoiceText(
        ocrText, 
        config.lmStudio
      );

      // Validate processed data
      if (!ValidationUtils.isValidInvoiceData(structuredData)) {
        throw new Error('Invalid invoice data extracted');
      }

      // Prepare result
      const result = {
        originalText: ocrText,
        structuredData: structuredData
      };

      // Optionally save to file if output path provided
      if (config.outputPath) {
        FileUtils.saveProcessedData(result, config.outputPath);
      }

      return result;
    } catch (error) {
      console.error('Invoice Processing Error:', error);
      throw error;
    }
  }
}

// Example usage
async function main() {
  try {
    // Test with text file
    console.log('Testing with text file:');
    const fs = await import('fs');
    const invoiceText = fs.readFileSync('./invoiceExample.txt', 'utf8');
    const textResult = await LMStudioProcessor.processInvoiceText(invoiceText);
    fs.writeFileSync('./processed_text_invoice.json', JSON.stringify(textResult, null, 2));
    console.log('Text Invoice Result:', JSON.stringify(textResult, null, 2));
    console.log('\nText result saved to processed_text_invoice.json');

    // Test with PDF file
    console.log('\nTesting with PDF file:');
    const pdfText = await OCRProcessor.extract('./invoiceExample.pdf');
    const pdfResult = await LMStudioProcessor.processInvoiceText(pdfText);
    fs.writeFileSync('./processed_pdf_invoice.json', JSON.stringify(pdfResult, null, 2));
    console.log('PDF Invoice Result:', JSON.stringify(pdfResult, null, 2));
    console.log('\nPDF result saved to processed_pdf_invoice.json');
  } catch (error) {
    console.error('Processing Failed:', error);
  }
}

main();

export default InvoiceProcessor;