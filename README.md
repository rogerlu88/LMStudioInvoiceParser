# Invoice Processor

## Overview
A modular invoice processing utility that combines OCR (Optical Character Recognition) with LM Studio for intelligent text extraction and parsing.

## Features
- Supports multiple image formats (JPG, PNG, PDF)
- Local OCR processing
- AI-powered invoice data extraction
- Flexible configuration
- Error handling and validation

## Prerequisites
- Node.js (v14+ recommended)
- LM Studio running locally
- Tesseract OCR installed

## Installation
```bash
npm install
```

## Configuration
1. Ensure LM Studio is running
2. Adjust LM Studio URL in `lm-studio.js` if needed
3. Configure Tesseract OCR as required

## Usage
```javascript
import InvoiceProcessor from './src/index.js';

async function processInvoice() {
  try {
    const result = await InvoiceProcessor.process(
      './invoice.jpg', 
      { 
        outputPath: './processed_invoice.json' 
      }
    );
    console.log(result);
  } catch (error) {
    console.error('Processing failed:', error);
  }
}
```

## Project Structure
- `src/index.js`: Main entry point
- `src/ocr.js`: OCR processing module
- `src/lm-studio.js`: LM Studio text processing
- `src/utils.js`: Utility functions

## Dependencies
- axios
- tesseract.js
- form-data

## Troubleshooting
- Ensure LM Studio is running
- Check image quality
- Verify Tesseract OCR installation