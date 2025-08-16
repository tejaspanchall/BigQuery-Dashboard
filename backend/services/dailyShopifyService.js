const bigquery = require('../config/bigquery');

class DailyShopifyService {
  constructor() {
    this.datasetId = process.env.BIGQUERY_DATASET_ID;
    this.projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
  }

  /**
   * Parse payment gateway names from string or array
   * @param {string|Array} gateways - Payment gateway names
   * @returns {string} First payment gateway name or empty string
   */
  getPaymentGateway(gateways) {
    try {
      if (!gateways) return '';
      
      // Parse if it's a string
      const gatewayArray = typeof gateways === 'string' ? JSON.parse(gateways) : gateways;
      
      // Return first gateway name or empty string
      return Array.isArray(gatewayArray) && gatewayArray.length > 0 ? gatewayArray[0] : '';
    } catch (e) {
      return '';
    }
  }

  /**
   * Calculate total refund amount from refunds array
   * @param {Array} refunds - Array of refund objects
   * @returns {number} Total refund amount
   */
  calculateTotalRefund(refunds) {
    try {
      if (!refunds || refunds === '[]') return 0;
      
      // Parse refunds if it's a string
      const refundsArray = typeof refunds === 'string' ? JSON.parse(refunds) : refunds;
      
      if (!Array.isArray(refundsArray)) return 0;
      
      // Sum up all refund amounts from order_adjustments
      return refundsArray.reduce((total, refund) => {
        if (!refund.order_adjustments) return total;
        
        const adjustmentTotal = refund.order_adjustments.reduce((sum, adjustment) => {
          const amount = parseFloat(adjustment.amount || 0);
          return sum + amount;
        }, 0);
        
        return total + adjustmentTotal;
      }, 0);
    } catch (e) {
      return 0;
    }
  }

  /**
   * Safely extracts date from various timestamp formats or returns null
   * @param {*} timestamp - Timestamp in any format
   * @returns {string|null} Date in YYYY-MM-DD format or null
   */
  safeExtractDate(timestamp) {
    if (!timestamp) return null;
    
    try {
      // Handle BigQuery timestamp object format
      if (timestamp && typeof timestamp === 'object' && timestamp.value) {
        timestamp = timestamp.value;
      }

      // If it's already a date string in YYYY-MM-DD format
      if (typeof timestamp === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(timestamp)) {
        return timestamp;
      }

      // Try parsing as ISO string or any other date format
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) return null;

      // Format as YYYY-MM-DD
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch {
      return null;
    }
  }

  /**
   * Get detailed daily Shopify orders data for the date range
   * @param {string} startDate - Start date in YYYY-MM-DD format
   * @param {string} endDate - End date in YYYY-MM-DD format
   * @returns {Promise<Array>} Detailed daily orders data
   */
  async getDailyShopifyData(startDate, endDate) {
    try {
      // Get reference to the table
      const dataset = bigquery.dataset(this.datasetId);
      const table = dataset.table('shopifyakikoorders');

      // Get rows with metadata
      const [rows] = await table.getRows();
      console.log('Total rows from BigQuery:', rows.length);
      
      // Process and filter the data
      const ordersData = [];
      
      // Sort all rows by created_at first to ensure we get the oldest orders first
      const sortedRows = [...rows].sort((a, b) => {
        const dateA = this.safeExtractDate(a.created_at) || '';
        const dateB = this.safeExtractDate(b.created_at) || '';
        return dateA.localeCompare(dateB); // Ascending order
      });
      
      for (const row of sortedRows) {
        // Extract dates from timestamps
        const createdDate = this.safeExtractDate(row.created_at);
        
        // Check if the order falls within the date range (using created_at)
        if (createdDate && createdDate >= startDate && createdDate <= endDate) {
          try {
            // Format the order data with only specified columns
            const orderData = {
              // Dates
              created_at: this.safeExtractDate(row.created_at),
              processed_at: this.safeExtractDate(row.processed_at),
              
              // Order details
              id: row.id?.toString() || '',
              order_number: row.order_number?.toString() || row.number?.toString() || '',
              total_price: parseFloat(row.total_price || '0'),
              subtotal_price: parseFloat(row.subtotal_price || '0'),
              total_discounts: parseFloat(row.total_discounts || '0'),
              total_tax: parseFloat(row.total_tax || '0'),
              financial_status: row.financial_status || '',
              fulfillment_status: row.fulfillment_status || '',
              
              // Payment info
              payment_gateway: this.getPaymentGateway(row.payment_gateway_names),
              
              // Refund amount (only the total amount)
              refund_amount: this.calculateTotalRefund(row.refunds),
              
              // Additional filters
              shop_url: row.shop_url || '',
              customer_email: row.email || row.contact_email || ''
            };

            ordersData.push(orderData);
          } catch (e) {
            // Silently handle errors for individual rows
          }
        }
      }
      
      console.log('Filtered orders count:', ordersData.length);
      return ordersData; // Already sorted in ascending order
      
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new DailyShopifyService(); 