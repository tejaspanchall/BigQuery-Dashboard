const express = require('express');
const router = express.Router();
const shopifyService = require('../services/shopifyService');

// Get orders data
router.post('/orders', async (req, res) => {
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
router.post('/net-revenue', async (req, res) => {
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
router.post('/mer', async (req, res) => {
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

module.exports = router; 