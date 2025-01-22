import fs from 'fs';
import path from 'path';

export class FileUtils {
  /**
   * Save processed invoice data to a file
   * @param {Object} processedData - Processed invoice data
   * @param {string} outputPath - Path to save the output file
   */
  static saveProcessedData(processedData, outputPath) {
    try {
      // Ensure directory exists
      const dir = path.dirname(outputPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Write file
      fs.writeFileSync(
        outputPath, 
        JSON.stringify(processedData, null, 2)
      );
      console.log(`Processed data saved to ${outputPath}`);
    } catch (error) {
      console.error('Error saving processed data:', error);
      throw error;
    }
  }

  /**
   * Validate file path
   * @param {string} filePath - Path to validate
   * @returns {boolean} Whether file exists
   */
  static fileExists(filePath) {
    return fs.existsSync(filePath);
  }

  /**
   * Get file extension
   * @param {string} filePath - Path to get extension from
   * @returns {string} File extension
   */
  static getFileExtension(filePath) {
    return path.extname(filePath).toLowerCase();
  }
}

export class ValidationUtils {
  /**
   * Validate invoice processing result
   * @param {Object} result - Processed invoice data
   * @returns {boolean} Whether result is valid
   */
  static isValidInvoiceData(result) {
    if (!result) return false;
    
    const requiredFields = [
      'Invoice Number', 
      'Date', 
      'Total Amount', 
      'Vendor/Company Name'
    ];

    return requiredFields.every(field => 
      result[field] !== null && result[field] !== undefined
    );
  }
}