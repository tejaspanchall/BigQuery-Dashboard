const express = require('express');
const router = express.Router();
const shopifyService = require('../services/shopifyService');
const jwt = require('jsonwebtoken');

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

// Get orders data
router.post('/orders', validateToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.body;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ 
        error: 'Start date and end date are required in request body' 
      });
    }

    const orders = await shopifyService.getOrders(startDate, endDate);
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get net revenue data
router.post('/net-revenue', validateToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.body;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ 
        error: 'Start date and end date are required in request body' 
      });
    }

    const revenue = await shopifyService.getNetRevenue(startDate, endDate);
    res.json(revenue);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get MER (Marketing Efficiency Ratio) data
router.post('/mer', validateToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.body;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ 
        error: 'Start date and end date are required in request body' 
      });
    }

    const mer = await shopifyService.getMER(startDate, endDate);
    res.json(mer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get return orders count
router.post('/returns', validateToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.body;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ 
        error: 'Start date and end date are required in request body' 
      });
    }

    const returnOrders = await shopifyService.getReturnOrders(startDate, endDate);
    res.json(returnOrders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 