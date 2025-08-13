const express = require('express');
const router = express.Router();
const bigQueryService = require('../services/bigQueryService');

// Health check endpoint
router.get('/health', async (req, res) => {
  try {
    const status = await bigQueryService.testConnection();
    if (status.connected) {
      res.json(status);
    } else {
      res.status(503).json(status);
    }
  } catch (error) {
    res.status(500).json({
      connected: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Get table names
router.get('/tables/names', async (req, res) => {
  try {
    const tableNames = await bigQueryService.getTableNames();
    res.json({
      dataset: process.env.BIGQUERY_DATASET_ID,
      tables: tableNames,
      count: tableNames.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// List all tables in the dataset
router.get('/tables', async (req, res) => {
  try {
    const tables = await bigQueryService.listTables();
    res.json(tables);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get table schema
router.get('/tables/:tableId/schema', async (req, res) => {
  try {
    const { tableId } = req.params;
    const schema = await bigQueryService.getTableSchema(tableId);
    res.json(schema);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Execute custom query
router.post('/query', async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }
    const results = await bigQueryService.executeQuery(query);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get daily KPIs
router.get('/kpis/daily', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Start date and end date are required' });
    }
    const kpis = await bigQueryService.getDailyKPIs(startDate, endDate);
    res.json(kpis);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get platform comparison
router.get('/platforms/comparison', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Start date and end date are required' });
    }
    const comparison = await bigQueryService.getPlatformComparison(startDate, endDate);
    res.json(comparison);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get campaign drilldown
router.get('/campaigns/drilldown', async (req, res) => {
  try {
    const { startDate, endDate, platform } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Start date and end date are required' });
    }
    const campaigns = await bigQueryService.getCampaignDrilldown(startDate, endDate, platform);
    res.json(campaigns);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get orders and refunds
router.get('/orders-refunds', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Start date and end date are required' });
    }
    const orders = await bigQueryService.getOrdersAndRefunds(startDate, endDate);
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 