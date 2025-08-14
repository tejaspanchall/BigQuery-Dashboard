const express = require('express');
const router = express.Router();
const metaService = require('../services/metaService');
const jwt = require('jsonwebtoken');

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

// Helper function to validate token
const validateToken = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No token, authorization denied' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token is not valid' });
  }
};

/**
 * Get daily ad spend data for Meta (Facebook)
 */
router.post('/adspend', validateToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.body || {};
    
    const validationError = validateDates(startDate, endDate);
    if (validationError) {
      return res.status(400).json(validationError);
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

/**
 * Get daily clicks data for Meta (Facebook)
 */
router.post('/clicks', validateToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.body || {};
    
    const validationError = validateDates(startDate, endDate);
    if (validationError) {
      return res.status(400).json(validationError);
    }
    
    const clicksData = await metaService.getClicks(startDate, endDate);
    res.json({
      data: clicksData,
      platform: 'meta'
    });
  } catch (error) {
    console.error('Error in Meta clicks route:', error);
    res.status(500).json({ 
      error: 'Failed to fetch Meta clicks data',
      message: error.message
    });
  }
});

/**
 * Get daily impressions data for Meta (Facebook)
 */
router.post('/impressions', validateToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.body || {};
    
    const validationError = validateDates(startDate, endDate);
    if (validationError) {
      return res.status(400).json(validationError);
    }
    
    const impressionsData = await metaService.getImpressions(startDate, endDate);
    res.json({
      data: impressionsData,
      platform: 'meta'
    });
  } catch (error) {
    console.error('Error in Meta impressions route:', error);
    res.status(500).json({ 
      error: 'Failed to fetch Meta impressions data',
      message: error.message
    });
  }
});

/**
 * Get daily CTR data for Meta (Facebook)
 */
router.post('/ctr', validateToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.body || {};
    
    const validationError = validateDates(startDate, endDate);
    if (validationError) {
      return res.status(400).json(validationError);
    }
    
    const ctrData = await metaService.getCTR(startDate, endDate);
    res.json({
      data: ctrData,
      platform: 'meta'
    });
  } catch (error) {
    console.error('Error in Meta CTR route:', error);
    res.status(500).json({ 
      error: 'Failed to fetch Meta CTR data',
      message: error.message
    });
  }
});

/**
 * Get daily conversions data for Meta (Facebook)
 */
router.post('/conversions', validateToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.body || {};
    
    const validationError = validateDates(startDate, endDate);
    if (validationError) {
      return res.status(400).json(validationError);
    }
    
    const conversionsData = await metaService.getConversions(startDate, endDate);
    res.json({
      data: conversionsData,
      platform: 'meta'
    });
  } catch (error) {
    console.error('Error in Meta conversions route:', error);
    res.status(500).json({ 
      error: 'Failed to fetch Meta conversions data',
      message: error.message
    });
  }
});

module.exports = router; 