const express = require('express');
const router = express.Router();
const trendService = require('../services/trendService');
const auth = require('../middleware/auth');

// Helper function to validate dates
const validateDates = (startDate, endDate) => {
  if (!startDate || !endDate) {
    return {
      error: 'Missing required parameters',
      message: 'Both startDate and endDate are required'
    };
  }
  return null;
};

/**
 * Get daily trend data (Spend vs Revenue vs Orders)
 */
router.post('/daily', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.body || {};
    
    const validationError = validateDates(startDate, endDate);
    if (validationError) {
      return res.status(400).json(validationError);
    }
    
    const trendData = await trendService.getDailyTrend(startDate, endDate);
    res.json(trendData);
  } catch (error) {
    console.error('Error in daily trend route:', error);
    res.status(500).json({ 
      error: 'Failed to fetch daily trend data',
      message: error.message
    });
  }
});

module.exports = router; 