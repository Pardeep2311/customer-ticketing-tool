const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { testConnection } = require('./src/config/db');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration - allow both localhost and LAN IP
const allowedOrigins = [
  process.env.FRONTEND_URL,          // e.g. http://localhost:3000 or http://192.168.2.64:3000
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://192.168.2.64:3000'         // your current WiFi IP
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Test database connection on startup
testConnection();

// Routes
app.get('/', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Customer Ticketing Tool API is running',
    version: '1.0.0'
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Server is healthy',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/tickets', require('./src/routes/ticketRoutes'));
app.use('/api/dashboard', require('./src/routes/dashboardRoutes'));
app.use('/api/categories', require('./src/routes/categoryRoutes'));
app.use('/api/subcategories', require('./src/routes/subcategoryRoutes'));
app.use('/api/assignment-groups', require('./src/routes/assignmentGroupRoutes'));
app.use('/api', require('./src/routes/commentRoutes'));
app.use('/api/users', require('./src/routes/userRoutes'));
app.use('/api/knowledge', require('./src/routes/knowledgeRoutes'));
app.use('/api/services', require('./src/routes/serviceRoutes'));
app.use('/api/notifications', require('./src/routes/notificationRoutes'));
app.use('/api/tags', require('./src/routes/tagRoutes'));
app.use('/api/followers', require('./src/routes/followerRoutes'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.stack : {}
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Start server - Listen on 0.0.0.0 to allow network access
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 API URL: http://localhost:${PORT}`);
  console.log(`🌍 Network access: http://[YOUR_IP_ADDRESS]:${PORT}`);
  console.log(`💡 To access from other devices, use your computer's IP address instead of localhost`);
});

module.exports = app;

