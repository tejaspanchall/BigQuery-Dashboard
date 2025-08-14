const express = require('express');
const router = express.Router();
const metaService = require('../services/metaService');

/**
 * Get daily ad spend data for Meta (Facebook)
 * Accepts date range in request body
 */
router.post('/adspend', async (req, res) => {
  try {
    const { startDate, endDate } = req.body || {};
    
    if (!startDate || !endDate) {
      return res.status(400).json({
        error: 'Missing required parameters',
        message: 'Both startDate and endDate are required'
      });
    }
    
    const adSpendData = await metaService.getAdSpend(startDate, endDate);
    res.json({
      data: adSpendData,
      platform: 'meta'
    });
  } catch (error) {
    console.error('Error in Meta ad spend route:', error);
    res.status(500).json({ 
      error: 'Failed to fetch Meta ad spend data',
      message: error.message
    });
  }
});

module.exports = router; 