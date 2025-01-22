import { OCRProcessor } from './src/ocr.js';
import { LMStudioProcessor } from './src/lm-studio.js';
import { FileUtils } from './src/utils.js';
import fs from 'fs';

async function testComponents() {
    console.log('Starting component tests...\n');

    // 1. Test FileUtils
    console.log('1. Testing FileUtils...');
    try {
        console.log('- Checking if test.js exists:', FileUtils.fileExists('./test.js'));
        console.log('- Getting file extension:', FileUtils.getFileExtension('test.jpg'));
        console.log('✅ FileUtils tests passed\n');
    } catch (error) {
        console.error('❌ FileUtils tests failed:', error.message, '\n');
    }

    // 2. Test Invoice Processing
    console.log('2. Testing Invoice Processing...');
    try {
        const invoiceText = fs.readFileSync('./invoiceExample.txt', 'utf8');
        console.log('- Reading sample invoice text...');
        console.log('- Processing invoice data...');
        const result = await LMStudioProcessor.processInvoiceText(invoiceText);
        console.log('- Processed Result:', JSON.stringify(result, null, 2));
        console.log('✅ Invoice processing successful\n');
    } catch (error) {
        console.error('❌ Invoice processing failed:', error.message, '\n');
    }

    console.log('Component tests completed.');
}

testComponents();
