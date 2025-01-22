import express from 'express';
import multer from 'multer';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { OCRProcessor } from './ocr.js';
import { LMStudioProcessor } from './lm-studio.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3001;

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal server error'
  });
});

// Enable CORS with error handling
app.use((req, res, next) => {
  cors({
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
  })(req, res, err => {
    if (err) {
      console.error('CORS Error:', err);
      return res.status(500).json({
        success: false,
        error: 'CORS error: ' + err.message
      });
    }
    next();
  });
});

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, '../public')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Sanitize the filename to prevent path traversal
    const sanitizedName = path.basename(file.originalname).replace(/[^a-zA-Z0-9.-]/g, '_');
    const uniqueFilename = Date.now() + '-' + sanitizedName;
    cb(null, uniqueFilename);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    // Check mime type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('Invalid file type. Only PDF, JPEG, and PNG files are allowed.'));
    }

    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (parseInt(req.headers['content-length']) > maxSize) {
      return cb(new Error('File too large. Maximum size is 10MB.'));
    }

    cb(null, true);
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});

// Serve uploaded files with proper error handling
app.get('/uploads/:filename', (req, res) => {
  const filename = path.basename(req.params.filename);
  const filePath = path.join(__dirname, '../uploads', filename);
  
  console.log('Requested file:', {
    filename,
    filePath,
    exists: fs.existsSync(filePath)
  });

  if (!fs.existsSync(filePath)) {
    console.error('File not found:', filePath);
    res.status(404).send('File not found');
    return;
  }

  // Check if file is readable
  try {
    fs.accessSync(filePath, fs.constants.R_OK);
  } catch (err) {
    console.error('File not readable:', err);
    res.status(500).send('Error accessing file');
    return;
  }

  res.sendFile(filePath);
});

// Get all invoices
app.get('/api/invoices', (req, res) => {
  const uploadDir = path.join(__dirname, '../uploads');
  try {
    const files = fs.readdirSync(uploadDir);
    res.json({ success: true, invoices: files });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to get invoices' });
  }
});

// Get next invoice
app.get('/api/invoices/next/:currentFile', (req, res) => {
  const uploadDir = path.join(__dirname, '../uploads');
  try {
    const files = fs.readdirSync(uploadDir);
    const currentIndex = files.indexOf(req.params.currentFile);
    if (currentIndex === -1 || currentIndex === files.length - 1) {
      res.json({ success: false, message: 'No next invoice available' });
    } else {
      const nextFile = files[currentIndex + 1];
      const nextFileStats = fs.statSync(path.join(uploadDir, nextFile));
      res.json({ 
        success: true, 
        nextFile: nextFile, 
        fileSize: nextFileStats.size, 
        fileType: nextFileStats.isDirectory() ? 'directory' : 'file' 
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to get next invoice' });
  }
});

// Get previous invoice
app.get('/api/invoices/prev/:currentFile', (req, res) => {
  const uploadDir = path.join(__dirname, '../uploads');
  try {
    const files = fs.readdirSync(uploadDir);
    const currentIndex = files.indexOf(req.params.currentFile);
    if (currentIndex <= 0) {
      res.json({ success: false, message: 'No previous invoice available' });
    } else {
      res.json({ success: true, prevFile: files[currentIndex - 1] });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to get previous invoice' });
  }
});

// Get next invoice file
app.get('/api/invoices/next-file/:currentFile', (req, res) => {
  const uploadDir = path.join(__dirname, '../uploads');
  try {
    const files = fs.readdirSync(uploadDir);
    const currentIndex = files.indexOf(req.params.currentFile);
    if (currentIndex === -1 || currentIndex === files.length - 1) {
      res.json({ success: false, message: 'No next invoice available' });
    } else {
      res.sendFile(path.join(uploadDir, files[currentIndex + 1]));
    }
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to get next invoice' });
  }
});

// Serve the edit page
app.get('/edit.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/edit.html'));
});

// Handle file upload and processing
app.post('/upload', upload.single('invoice'), async (req, res) => {
  try {
    if (!req.file) {
      throw new Error('No file uploaded');
    }

    // Validate uploaded file
    const stats = await fs.promises.stat(req.file.path);
    if (stats.size === 0) {
      throw new Error('Uploaded file is empty');
    }

    console.log('File uploaded:', {
      originalname: req.file.originalname,
      filename: req.file.filename,
      path: req.file.path,
      size: stats.size,
      mimetype: req.file.mimetype
    });

    // Verify file exists and is readable
    try {
      await fs.promises.access(req.file.path, fs.constants.R_OK);
    } catch (err) {
      throw new Error(`Cannot read uploaded file: ${err.message}`);
    }
    
    // Extract text from the uploaded file
    console.log('Starting text extraction...');
    const text = await OCRProcessor.extract(req.file.path);
    console.log('Text extraction completed');
    
    if (!text || text.trim().length === 0) {
      throw new Error('No text could be extracted from the file');
    }

    console.log('Extracted text length:', text.length);
    console.log('Sample of extracted text:', text.substring(0, 200));

    // Process the extracted text
    console.log('Processing extracted text...');
    const result = await LMStudioProcessor.processInvoiceText(text);
    console.log('Text processing completed');
    
    res.json({
      success: true,
      data: result,
      fileName: req.file.filename,
      textLength: text.length
    });
  } catch (error) {
    console.error('Error processing file:', error);
    
    // Clean up the uploaded file if there was an error
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
        console.log('Cleaned up failed upload:', req.file.path);
      } catch (err) {
        console.error('Error deleting file:', err);
      }
    }

    res.status(500).json({
      success: false,
      error: error.message || 'Failed to process invoice'
    });
  }
});

// Start the server with error handling
const server = app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running at http://localhost:${port}`);
  console.log(`Serving static files from: ${path.join(__dirname, '../public')}`);
  console.log(`Upload directory: ${path.join(__dirname, '../uploads')}`);
}).on('error', (err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
