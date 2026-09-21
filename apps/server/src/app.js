const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const leadRoutes = require('./routes/lead.routes');
const { errorHandler, notFoundHandler } = require('./middleware/error.middleware');

const app = express();

// Security middleware
app.use(helmet());

// CORS config - avoid wildcard, explicitly allow localhost and extension
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || origin.startsWith('http://localhost') || origin.startsWith('chrome-extension://')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Parsers & logging
app.use(express.json({ limit: '10mb' })); // Request size limit
app.use(morgan('dev'));

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Wa-CRM API is running'
  });
});

// API Routes
app.use('/api/leads', leadRoutes);
app.use('/api/ai', leadRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
