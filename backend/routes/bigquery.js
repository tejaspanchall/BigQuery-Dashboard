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

module.exports = router; 