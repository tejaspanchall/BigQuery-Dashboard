const express = require('express');
const router = express.Router();
const shopifyService = require('../services/shopifyService');
const dailyShopifyService = require('../services/dailyShopifyService');
const ExcelJS = require('exceljs');
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

/**
 * @route POST /api/shopify/export
 * @desc Export filtered Shopify orders data to Excel
 */
router.post('/export', async (req, res) => {
  try {
    const { startDate, endDate, filters } = req.body;

    // Get orders data
    const ordersData = await dailyShopifyService.getDailyShopifyData(startDate, endDate);

    // Apply filters if any
    let filteredData = ordersData;
    if (filters) {
      filteredData = ordersData.filter(order => {
        let matches = true;
        if (filters.financial_status && filters.financial_status !== 'all') {
          matches = matches && order.financial_status === filters.financial_status;
        }
        if (filters.fulfillment_status && filters.fulfillment_status !== 'all') {
          matches = matches && order.fulfillment_status === filters.fulfillment_status;
        }
        if (filters.payment_gateway && filters.payment_gateway !== 'all') {
          matches = matches && order.payment_gateway === filters.payment_gateway;
        }
        return matches;
      });
    }

    // Create Excel workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Orders');

    // Add headers
    worksheet.columns = [
      { header: 'Created Date', key: 'created_at', width: 15 },
      { header: 'Processed Date', key: 'processed_at', width: 15 },
      { header: 'Order ID', key: 'id', width: 15 },
      { header: 'Order Number', key: 'order_number', width: 12 },
      { header: 'Total Price', key: 'total_price', width: 12 },
      { header: 'Subtotal', key: 'subtotal_price', width: 12 },
      { header: 'Discounts', key: 'total_discounts', width: 12 },
      { header: 'Tax', key: 'total_tax', width: 12 },
      { header: 'Financial Status', key: 'financial_status', width: 15 },
      { header: 'Fulfillment Status', key: 'fulfillment_status', width: 15 },
      { header: 'Payment Gateway', key: 'payment_gateway', width: 20 },
      { header: 'Refund Amount', key: 'refund_amount', width: 12 },
      { header: 'Shop URL', key: 'shop_url', width: 15 },
      { header: 'Customer Email', key: 'customer_email', width: 25 }
    ];

    // Style the header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE5E7EB' }
    };

    // Add data
    filteredData.forEach(order => {
      worksheet.addRow({
        ...order,
        total_price: Number(order.total_price),
        subtotal_price: Number(order.subtotal_price),
        total_discounts: Number(order.total_discounts),
        total_tax: Number(order.total_tax),
        refund_amount: Number(order.refund_amount)
      });
    });

    // Format number columns
    const numberColumns = ['E', 'F', 'G', 'H', 'L'];
    numberColumns.forEach(col => {
      worksheet.getColumn(col).numFmt = '₹#,##0.00';
    });

    // Set response headers
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=Orders_${startDate}_${endDate}.xlsx`
    );

    // Write to response
    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error('Error exporting orders:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

module.exports = router; 