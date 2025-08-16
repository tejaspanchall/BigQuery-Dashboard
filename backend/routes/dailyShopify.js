const express = require('express');
const router = express.Router();
const dailyShopifyService = require('../services/dailyShopifyService');

/**
 * @route POST /api/dailyShopify
 * @desc Get detailed daily Shopify orders data for a date range
 * @access Private
 */
router.post('/', async (req, res) => {
  try {
    const { startDate, endDate } = req.body;

    // Validate required parameters
    if (!startDate || !endDate) {
      return res.status(400).json({
        error: 'Both startDate and endDate are required in YYYY-MM-DD format'
      });
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
      return res.status(400).json({
        error: 'Dates must be in YYYY-MM-DD format'
      });
    }

    // Get daily Shopify data
    const data = await dailyShopifyService.getDailyShopifyData(startDate, endDate);
    
    console.log('Total orders found:', data.length);
    console.log('Date range:', startDate, 'to', endDate);

    const response = {
      success: true,
      total_orders: data.length,
      data: data
    };

    console.log('Response structure:', Object.keys(response));
    res.json(response);

  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

module.exports = router; 