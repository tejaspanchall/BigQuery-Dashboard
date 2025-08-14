const express = require('express');
const router = express.Router();
const googleService = require('../services/googleService');

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
 * Get daily ad spend data for Google
 */
router.post('/adspend', async (req, res) => {
  try {
    const { startDate, endDate } = req.body || {};
    
    const validationError = validateDates(startDate, endDate);
    if (validationError) {
      return res.status(400).json(validationError);
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

/**
 * Get daily clicks data for Google
 */
router.post('/clicks', async (req, res) => {
  try {
    const { startDate, endDate } = req.body || {};
    
    const validationError = validateDates(startDate, endDate);
    if (validationError) {
      return res.status(400).json(validationError);
    }
    
    const clicksData = await googleService.getClicks(startDate, endDate);
    res.json({
      data: clicksData,
      platform: 'google'
    });
  } catch (error) {
    console.error('Error in Google clicks route:', error);
    res.status(500).json({ 
      error: 'Failed to fetch Google clicks data',
      message: error.message
    });
  }
});

/**
 * Get daily impressions data for Google
 */
router.post('/impressions', async (req, res) => {
  try {
    const { startDate, endDate } = req.body || {};
    
    const validationError = validateDates(startDate, endDate);
    if (validationError) {
      return res.status(400).json(validationError);
    }
    
    const impressionsData = await googleService.getImpressions(startDate, endDate);
    res.json({
      data: impressionsData,
      platform: 'google'
    });
  } catch (error) {
    console.error('Error in Google impressions route:', error);
    res.status(500).json({ 
      error: 'Failed to fetch Google impressions data',
      message: error.message
    });
  }
});

/**
 * Get daily CTR data for Google
 */
router.post('/ctr', async (req, res) => {
  try {
    const { startDate, endDate } = req.body || {};
    
    const validationError = validateDates(startDate, endDate);
    if (validationError) {
      return res.status(400).json(validationError);
    }
    
    const ctrData = await googleService.getCTR(startDate, endDate);
    res.json({
      data: ctrData,
      platform: 'google'
    });
  } catch (error) {
    console.error('Error in Google CTR route:', error);
    res.status(500).json({ 
      error: 'Failed to fetch Google CTR data',
      message: error.message
    });
  }
});

/**
 * Get daily conversions data for Google
 */
router.post('/conversions', async (req, res) => {
  try {
    const { startDate, endDate } = req.body || {};
    
    const validationError = validateDates(startDate, endDate);
    if (validationError) {
      return res.status(400).json(validationError);
    }
    
    const conversionsData = await googleService.getConversions(startDate, endDate);
    res.json({
      data: conversionsData,
      platform: 'google'
    });
  } catch (error) {
    console.error('Error in Google conversions route:', error);
    res.status(500).json({ 
      error: 'Failed to fetch Google conversions data',
      message: error.message
    });
  }
});

module.exports = router; 