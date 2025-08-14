const express = require('express');
const router = express.Router();
const googleService = require('../services/googleService');

/**
 * Get daily ad spend data for Google
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
    
    const adSpendData = await googleService.getAdSpend(startDate, endDate);
    res.json({
      data: adSpendData,
      platform: 'google'
    });
  } catch (error) {
    console.error('Error in Google ad spend route:', error);
    res.status(500).json({ 
      error: 'Failed to fetch Google ad spend data',
      message: error.message
    });
  }
});

module.exports = router; 