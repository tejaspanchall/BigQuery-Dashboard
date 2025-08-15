const express = require('express');
const router = express.Router();
const drilldownService = require('../services/drilldownService');

/**
 * @route POST /api/drilldown
 * @desc Get drilldown data from Google and Meta platforms
 * @access Private
 */
router.post('/', async (req, res) => {
  try {
    const { startDate, endDate } = req.body;
    
    // Validate date parameters
    if (!startDate || !endDate) {
      return res.status(400).json({ 
        success: false, 
        message: 'Start date and end date are required' 
      });
    }
    
    // Get drilldown data from service
    const drilldownData = await drilldownService.getDrilldownData(startDate, endDate);
    
    // Return successful response
    return res.status(200).json({
      success: true,
      data: drilldownData
    });
  } catch (error) {
    console.error('Error in drilldown route:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch drilldown data',
      error: error.message
    });
  }
});

module.exports = router; 