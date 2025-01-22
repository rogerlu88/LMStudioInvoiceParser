import axios from 'axios';

export class LMStudioProcessor {
  /**
   * Process extracted text using simple parsing
   * @param {string} ocrText - Text extracted from OCR
   * @returns {Promise<Object>} Structured invoice data
   */
  static async processInvoiceText(ocrText) {
    try {
      const lines = ocrText.split('\n').map(line => line.trim()).filter(line => line);
      const data = {
        invoiceNumber: null,
        date: null,
        totalAmount: null,
        vendorName: null,
        lineItems: [],
        taxAmount: null,
        paymentTerms: null
      };

      // Process lines in sequence
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // Skip empty lines
        if (!line) continue;

        // Invoice number - Look for patterns like "Invoice #" or just "#" or "Invoice Number:"
        if (line.toLowerCase().includes('invoice') || line.match(/^#\s*\d+/)) {
          // Try different patterns
          let match = line.match(/invoice\s*#\s*:?\s*(\d+)/i) ||
                     line.match(/invoice\s*number\s*:?\s*(\d+)/i) ||
                     line.match(/invoice\s*#?\s*:?\s*(\d+)/i) ||
                     line.match(/[#:]\s*(\d+)/);
          
          if (match) {
            data.invoiceNumber = match[1];
            console.log('Found invoice number:', match[1], 'from line:', line);
          }
          continue;
        }

        // Date - Look for various date formats
        if (line.toLowerCase().includes('date:') || line.match(/\d{4}-\d{2}-\d{2}/) || line.match(/\d{1,2}\/\d{1,2}\/\d{4}/)) {
          const dateMatch = line.match(/(\d{4}-\d{2}-\d{2})|(\d{1,2}\/\d{1,2}\/\d{4})/);
          if (dateMatch) {
            data.date = dateMatch[0];
          }
          continue;
        }

        // Vendor Name - Usually at the top of the invoice
        if (i < 5 && !data.vendorName && line.length > 0 && !line.match(/invoice|date|bill to/i)) {
          data.vendorName = line;
          continue;
        }

        // Line Items - Look for lines with quantity, price, and amount
        // Match both table format and more flexible formats
        let itemMatch = line.match(/^(.*?)\s+(\d+)\s+\$?([\d,]+\.?\d*)\s+\$?([\d,]+\.?\d*)$/);
        if (!itemMatch) {
          // Try alternative format: Description followed by amount
          itemMatch = line.match(/^(.*?)\s+(\d+)\s+\$?([\d,]+\.?\d*)$/);
          if (itemMatch) {
            const description = itemMatch[1].trim();
            const quantity = parseInt(itemMatch[2]);
            const unitPrice = parseFloat(itemMatch[3].replace(/,/g, ''));
            const amount = quantity * unitPrice;
            
            data.lineItems.push({
              description,
              quantity,
              unitPrice,
              amount
            });
            continue;
          }
        } else {
          // Standard format
          data.lineItems.push({
            description: itemMatch[1].trim(),
            quantity: parseInt(itemMatch[2]),
            unitPrice: parseFloat(itemMatch[3].replace(/,/g, '')),
            amount: parseFloat(itemMatch[4].replace(/,/g, ''))
          });
          continue;
        }

        // Total Amount - Look for Grand Total or Total
        const totalPattern = /(?:grand\s+)?total:?\s*\$?([\d,]+\.?\d*)/i;
        if (line.match(totalPattern)) {
          const totalMatch = line.match(totalPattern);
          if (totalMatch) {
            data.totalAmount = parseFloat(totalMatch[1].replace(/[$,]/g, ''));
          }
          continue;
        }
      }

      // Calculate total if not found or verify if found
      const calculatedTotal = data.lineItems.reduce((sum, item) => sum + item.amount, 0);
      
      // If the parsed total differs significantly from calculated total, use calculated
      if (!data.totalAmount || Math.abs(data.totalAmount - calculatedTotal) > 1) {
        data.totalAmount = calculatedTotal;
      }

      return data;
    } catch (error) {
      console.error('Parsing Error:', error.message);
      throw error;
    }
  }
}