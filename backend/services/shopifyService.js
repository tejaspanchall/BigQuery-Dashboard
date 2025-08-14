const bigquery = require('../config/bigquery');
const metaService = require('./metaService');
const googleService = require('./googleService');

class ShopifyService {
  constructor() {
    this.datasetId = process.env.BIGQUERY_DATASET_ID;
    this.projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
  }

  /**
   * Get total confirmed Shopify orders count for the date range
   * @param {string} startDate - Start date in YYYY-MM-DD format
   * @param {string} endDate - End date in YYYY-MM-DD format
   * @returns {Promise<Object>} Total confirmed orders count
   */
  async getOrders(startDate, endDate) {
    try {
      // Get reference to the table
      const dataset = bigquery.dataset(this.datasetId);
      const table = dataset.table('shopifyakikoorders');

      // Get rows with metadata
      const [rows] = await table.getRows();
      
      // Process and filter the data
      let totalOrders = 0;
      
      rows.forEach(row => {
        try {
          // Skip if no processed_at date or confirmed status
          if (!row.processed_at || row.confirmed === undefined) return;
          
          // Extract date from processed_at timestamp (format: YYYY-MM-DDTHH:mm:ss+05:30)
          const processedDate = row.processed_at.split('T')[0]; // Get YYYY-MM-DD part
          
          // Only count if date is in range and order is confirmed
          if (processedDate >= startDate && 
              processedDate <= endDate && 
              row.confirmed === true) {
            totalOrders++;
          }
        } catch (e) {
          console.error('Error processing row:', e, row);
        }
      });
      
      return {
        total_orders: totalOrders
      };
      
    } catch (error) {
      console.error('Error fetching Shopify orders:', error);
      throw error;
    }
  }

  /**
   * Get net revenue from confirmed Shopify orders for the date range
   * @param {string} startDate - Start date in YYYY-MM-DD format
   * @param {string} endDate - End date in YYYY-MM-DD format
   * @returns {Promise<Object>} Total net revenue
   */
  async getNetRevenue(startDate, endDate) {
    try {
      // Get reference to the table
      const dataset = bigquery.dataset(this.datasetId);
      const table = dataset.table('shopifyakikoorders');

      // Get rows with metadata
      const [rows] = await table.getRows();
      
      // Process and filter the data
      let totalRevenue = 0;
      
      rows.forEach(row => {
        try {
          // Skip if no processed_at date or confirmed status or current_subtotal_price
          if (!row.processed_at || row.confirmed === undefined || !row.current_subtotal_price) return;
          
          // Extract date from processed_at timestamp (format: YYYY-MM-DDTHH:mm:ss+05:30)
          const processedDate = row.processed_at.split('T')[0]; // Get YYYY-MM-DD part
          
          // Only add revenue if date is in range and order is confirmed
          if (processedDate >= startDate && 
              processedDate <= endDate && 
              row.confirmed === true) {
            // Parse the current_subtotal_price as float and add to total
            const revenue = parseFloat(row.current_subtotal_price);
            if (!isNaN(revenue)) {
              totalRevenue += revenue;
            }
          }
        } catch (e) {
          console.error('Error processing row:', e, row);
        }
      });
      
      return {
        net_revenue: parseFloat(totalRevenue.toFixed(2))
      };
      
    } catch (error) {
      console.error('Error fetching Shopify net revenue:', error);
      throw error;
    }
  }

  /**
   * Calculate MER (Net Revenue ÷ Total Spend from Meta & Google combined)
   * @param {string} startDate - Start date in YYYY-MM-DD format
   * @param {string} endDate - End date in YYYY-MM-DD format
   * @returns {Promise<Object>} MER value
   */
  async getMER(startDate, endDate) {
    try {
      // Get net revenue from Shopify
      const revenueData = await this.getNetRevenue(startDate, endDate);
      const netRevenue = revenueData.net_revenue;

      // Get Meta ad spend
      const metaSpend = await metaService.getAdSpend(startDate, endDate);
      const totalMetaSpend = metaSpend.reduce((sum, day) => sum + day.spend, 0);

      // Get Google ad spend
      const googleSpend = await googleService.getAdSpend(startDate, endDate);
      const totalGoogleSpend = googleSpend.reduce((sum, day) => sum + day.spend, 0);

      // Calculate total spend
      const totalSpend = totalMetaSpend + totalGoogleSpend;

      // Calculate MER
      const mer = totalSpend > 0 ? parseFloat((netRevenue / totalSpend).toFixed(2)) : 0;

      return {
        mer,
        net_revenue: netRevenue,
        total_spend: parseFloat(totalSpend.toFixed(2)),
        meta_spend: parseFloat(totalMetaSpend.toFixed(2)),
        google_spend: parseFloat(totalGoogleSpend.toFixed(2))
      };
    } catch (error) {
      console.error('Error calculating MER:', error);
      throw error;
    }
  }

  /**
   * Get return orders count based on non-empty refunds array
   * @param {string} startDate - Start date in YYYY-MM-DD format
   * @param {string} endDate - End date in YYYY-MM-DD format
   * @returns {Promise<Object>} Return orders count
   */
  async getReturnOrders(startDate, endDate) {
    try {
      // Get reference to the table
      const dataset = bigquery.dataset(this.datasetId);
      const table = dataset.table('shopifyakikoorders');

      // Get rows with metadata
      const [rows] = await table.getRows();
      
      // Process and filter the data
      let returnOrdersCount = 0;
      
      rows.forEach(row => {
        try {
          // Skip if no processed_at date
          if (!row.processed_at) return;
          
          // Extract date from processed_at timestamp
          const processedDate = row.processed_at.split('T')[0];
          
          // Check if date is in range and refunds array is not empty
          if (processedDate >= startDate && 
              processedDate <= endDate && 
              row.refunds && 
              row.refunds !== '[]' && 
              row.refunds !== '""' && 
              row.refunds !== '') {
            // Parse refunds JSON string to check if it's actually an array with items
            try {
              const refundsArray = JSON.parse(row.refunds);
              if (Array.isArray(refundsArray) && refundsArray.length > 0) {
                returnOrdersCount++;
              }
            } catch (jsonError) {
              console.error('Error parsing refunds JSON:', jsonError, row.refunds);
            }
          }
        } catch (e) {
          console.error('Error processing row:', e, row);
        }
      });
      
      return {
        return_orders: returnOrdersCount
      };
      
    } catch (error) {
      console.error('Error fetching return orders:', error);
      throw error;
    }
  }

  /**
 * Get daily metrics (orders and revenue) from Shopify
 * @param {string} startDate - Start date in YYYY-MM-DD format
 * @param {string} endDate - End date in YYYY-MM-DD format
 * @returns {Promise<Array>} Daily metrics data
 */
async getDailyMetrics(startDate, endDate) {
  try {
    // Get reference to the table
    const dataset = bigquery.dataset(this.datasetId);
    const table = dataset.table('shopifyakikoorders');

    // Get rows with metadata
    const [rows] = await table.getRows();
    
    // Process and filter the data
    const dailyMetrics = {};
    
    rows.forEach(row => {
      try {
        // Skip if no processed_at date or confirmed status or current_subtotal_price
        if (!row.processed_at || row.confirmed === undefined || !row.current_subtotal_price) return;
        
        // Extract date from processed_at timestamp (format: YYYY-MM-DDTHH:mm:ss+05:30)
        const processedDate = row.processed_at.split('T')[0]; // Get YYYY-MM-DD part
        
        // Only process if date is in range and order is confirmed
        if (processedDate >= startDate && 
            processedDate <= endDate && 
            row.confirmed === true) {
          
          // Initialize metrics for this date if not exists
          if (!dailyMetrics[processedDate]) {
            dailyMetrics[processedDate] = {
              date: processedDate,
              revenue: 0,
              orders: 0
            };
          }
          
          // Parse the current_subtotal_price as float and add to total
          const revenue = parseFloat(row.current_subtotal_price);
          if (!isNaN(revenue)) {
            dailyMetrics[processedDate].revenue += revenue;
            dailyMetrics[processedDate].orders += 1;
          }
        }
      } catch (e) {
        console.error('Error processing row:', e, row);
      }
    });
    
    // Convert to array and sort by date
    return Object.values(dailyMetrics)
      .map(day => ({
        ...day,
        revenue: parseFloat(day.revenue.toFixed(2))
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
    
  } catch (error) {
    console.error('Error fetching Shopify daily metrics:', error);
    throw error;
  }
}
}

module.exports = new ShopifyService(); 