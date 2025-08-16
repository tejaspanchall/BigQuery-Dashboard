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
const metaRoutes = require('./routes/meta');
const googleRoutes = require('./routes/google');
const shopifyRoutes = require('./routes/shopify');
const trendRoutes = require('./routes/trends');
const drilldownRoutes = require('./routes/drilldown');
const dailyShopifyRoutes = require('./routes/dailyShopify');

// Welcome route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to BigQuery Dashboard API' });
});

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/bigquery', bigQueryRoutes); // Removed auth middleware
app.use('/api/meta', metaRoutes);
app.use('/api/google', googleRoutes);
app.use('/api/shopify', shopifyRoutes);
app.use('/api/trends', trendRoutes);
app.use('/api/drilldown', drilldownRoutes);
app.use('/api/dailyShopify', dailyShopifyRoutes);

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