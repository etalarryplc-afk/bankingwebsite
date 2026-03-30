const express = require('express');
const cors = require('cors');
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer setup for ID uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, unique + '-' + file.originalname.replace(/\s+/g, '_'));
  }
});
const upload = multer({ storage });

// Contact Form Endpoint
app.post('/api/contact', (req, res) => {
  const { name, email, phone, subject, message } = req.body;
  
  // Validation
  if (!name || !email || !subject || !message) {
    return res.status(400).json({ 
      success: false, 
      error: 'All fields are required' 
    });
  }
  
  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ 
      success: false, 
      error: 'Invalid email format' 
    });
  }
  
  // Phone validation (optional)
  if (phone && !/^\d{10,}$/.test(phone.replace(/\D/g, ''))) {
    return res.status(400).json({ 
      success: false, 
      error: 'Invalid phone number' 
    });
  }
  
  // Log the submission
  console.log('📧 Contact Form Submission:');
  console.log({ name, email, phone, subject, message });
  
  res.json({ 
    success: true, 
    message: '✅ Thank you! We will contact you within 24 hours.' 
  });
});

// Newsletter Subscription Endpoint
app.post('/api/newsletter', (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ 
      success: false, 
      error: 'Email is required' 
    });
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ 
      success: false, 
      error: 'Invalid email format' 
    });
  }
  
  console.log('📰 Newsletter Subscription:', email);
  res.json({ 
    success: true, 
    message: '✅ Successfully subscribed to our newsletter!' 
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🏦 USFinance server running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Create Account Endpoint (handles uploads for ID front/back)
app.post('/api/create-account', upload.fields([
  { name: 'idFront', maxCount: 1 },
  { name: 'idBack', maxCount: 1 }
]), (req, res) => {
  const { firstName, lastName, idNumber, zip, city, accountType } = req.body;

  // Basic validation
  if (!firstName || !lastName || !idNumber || !accountType) {
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  }

  // If creating a personal account, require zip, city and both ID uploads
  if (accountType === 'personal') {
    if (!zip || !city) {
      return res.status(400).json({ success: false, error: 'Zip and City are required for Personal accounts' });
    }

    if (!req.files || !req.files.idFront || !req.files.idBack) {
      return res.status(400).json({ success: false, error: 'Please upload both front and back of your ID' });
    }
  }

  const savedFiles = {};
  if (req.files) {
    Object.keys(req.files).forEach(key => {
      savedFiles[key] = req.files[key].map(f => ({ originalName: f.originalname, savedAs: f.filename, path: f.path }));
    });
  }

  // Log the submission (for demo purposes)
  console.log('🆕 Account Creation Request:');
  console.log({ firstName, lastName, idNumber, zip, city, accountType, files: savedFiles });

  // In a real app you'd persist this to a DB and trigger verification workflows
  res.json({ success: true, message: 'Account request received. Our team will contact you to complete verification.' });
});