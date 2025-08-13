const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const auth = require('./middleware/auth');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
const authRoutes = require('./routes/auth');
const bigQueryRoutes = require('./routes/bigquery');

// Welcome route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to BigQuery Dashboard API' });
});

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/bigquery', auth, bigQueryRoutes); // Protected routes

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested endpoint does not exist'
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 